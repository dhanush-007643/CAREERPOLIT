const matchingService = require('./MatchingService');

class RecommendationService {
  async getRecommendedJobsForFresher(fresherId, limit = 10) {
    const matches = await matchingService.matchFresherToAllJobs(fresherId, limit);
    return matches.map((m) => ({
      jobId: m.job.id,
      title: m.job.title,
      company: m.job.company,
      location: m.job.location,
      workMode: m.job.workMode,
      matchScore: m.matchScore,
      matchedSkills: m.matchedSkills,
      missingSkills: m.missingSkills,
      recommendation: m.recommendation,
      explanation: m.explanation
    }));
  }

  async getRecommendedCandidatesForJob(jobId, userId, userRole, limit = 10) {
    const matches = await matchingService.matchCandidatesForJob(jobId, userId, userRole, limit);
    return matches.map((m) => ({
      candidateId: m.candidate.id,
      name: m.candidate.name,
      email: m.candidate.email,
      avatar: m.candidate.avatar,
      location: m.candidate.location,
      resumeUrl: m.candidate.resumeUrl,
      skills: m.candidate.skills,
      matchScore: m.matchScore,
      matchedSkills: m.matchedSkills,
      missingSkills: m.missingSkills,
      recommendation: m.recommendation,
      explanation: m.explanation
    }));
  }
}

module.exports = new RecommendationService();
