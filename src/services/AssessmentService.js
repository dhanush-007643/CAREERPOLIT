const assessmentRepository = require('../repositories/AssessmentRepository');
const fresherRepository = require('../repositories/FresherRepository');
const { NotFoundError, BadRequestError } = require('../utils/customErrors');

class AssessmentService {
  async createAssessment(data) {
    return await assessmentRepository.create(data);
  }

  // B07: Sanitize assessment list so answers/correct options are never leaked to candidates
  async getAssessments(category = null) {
    const assessments = await assessmentRepository.findActiveAssessments(category);
    return assessments.map((assessment) => {
      const obj = assessment.toObject ? assessment.toObject() : assessment;
      return {
        _id: obj._id,
        title: obj.title,
        description: obj.description,
        category: obj.category,
        skillName: obj.skillName,
        durationMinutes: obj.durationMinutes,
        passingScorePercentage: obj.passingScorePercentage,
        totalQuestions: obj.questions ? obj.questions.length : 0,
        isActive: obj.isActive,
        createdAt: obj.createdAt
      };
    });
  }

  async getAssessmentById(id, includeAnswers = false) {
    const assessment = await assessmentRepository.findById(id);
    if (!assessment) {
      throw new NotFoundError('Assessment not found', 'ASSESSMENT_NOT_FOUND');
    }

    if (includeAnswers) return assessment;

    // Sanitize correct options for candidate test-takers
    const sanitized = assessment.toObject ? assessment.toObject() : { ...assessment };
    sanitized.questions = (sanitized.questions || []).map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      points: q.points,
      options: (q.options || []).map((opt) => ({
        _id: opt._id,
        text: opt.text
      }))
    }));

    return sanitized;
  }

  // B31: Enforce assessment state and safe submission scoring
  async submitAssessment(assessmentId, fresherId, submissionAnswers = []) {
    const assessment = await assessmentRepository.findById(assessmentId);
    if (!assessment) {
      throw new NotFoundError('Assessment not found', 'ASSESSMENT_NOT_FOUND');
    }

    if (!assessment.isActive) {
      throw new BadRequestError('This assessment is inactive and cannot accept submissions', 'ASSESSMENT_INACTIVE');
    }

    let earnedScore = 0;
    let maxScore = 0;
    const evaluatedAnswers = [];

    const answerMap = new Map(
      (submissionAnswers || [])
        .filter((a) => a && a.questionId)
        .map((a) => [a.questionId.toString(), a.selectedOptionId ? a.selectedOptionId.toString() : null])
    );

    for (const question of (assessment.questions || [])) {
      const qId = question._id.toString();
      const points = question.points && question.points > 0 ? question.points : 10;
      maxScore += points;

      const selectedOptId = answerMap.get(qId);
      let isCorrect = false;

      if (selectedOptId) {
        const correctOpt = (question.options || []).find((o) => o.isCorrect);
        if (correctOpt && correctOpt._id.toString() === selectedOptId) {
          isCorrect = true;
          earnedScore += points;
        }
      }

      evaluatedAnswers.push({
        questionId: question._id,
        selectedOptionId: selectedOptId || null,
        isCorrect
      });
    }

    const percentage = maxScore > 0 ? Math.round((earnedScore / maxScore) * 100) : 0;
    const isPassed = percentage >= (assessment.passingScorePercentage || 60);

    const submission = await assessmentRepository.saveSubmission({
      assessment: assessment._id,
      fresher: fresherId,
      answers: evaluatedAnswers,
      score: earnedScore,
      maxScore,
      percentage,
      isPassed,
      completedAt: new Date()
    });

    // If passed, append validated skill to FresherProfile if not already present
    if (isPassed && assessment.skillName) {
      const profile = await fresherRepository.findByUserId(fresherId, false);
      if (profile && !profile.skills.includes(assessment.skillName)) {
        profile.skills.push(assessment.skillName);
        await profile.save();
      }
    }

    return {
      submissionId: submission._id,
      score: earnedScore,
      maxScore,
      percentage,
      isPassed,
      passingScorePercentage: assessment.passingScorePercentage,
      evaluatedAnswers
    };
  }

  async getFresherAssessmentHistory(fresherId) {
    return await assessmentRepository.findSubmissionsByFresher(fresherId);
  }
}

module.exports = new AssessmentService();
