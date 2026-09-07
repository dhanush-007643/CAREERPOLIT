const BaseRepository = require('./BaseRepository');
const Assessment = require('../models/Assessment');
const AssessmentSubmission = require('../models/AssessmentSubmission');

class AssessmentRepository extends BaseRepository {
  constructor() {
    super(Assessment);
  }

  async findActiveAssessments(category = null) {
    const filter = { isActive: true };
    if (category) filter.category = category;
    return await this.find(filter, { createdAt: -1 });
  }

  async saveSubmission(submissionData) {
    return await AssessmentSubmission.create(submissionData);
  }

  async findSubmissionsByFresher(fresherId) {
    return await AssessmentSubmission.find({ fresher: fresherId })
      .sort({ createdAt: -1 })
      .populate('assessment', 'title category skillName passingScorePercentage')
      .exec();
  }

  async findSubmission(assessmentId, fresherId) {
    return await AssessmentSubmission.findOne({ assessment: assessmentId, fresher: fresherId })
      .sort({ createdAt: -1 })
      .exec();
  }
}

module.exports = new AssessmentRepository();
