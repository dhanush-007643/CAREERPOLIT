const jobRepository = require('../repositories/JobRepository');
const fresherRepository = require('../repositories/FresherRepository');
const matchResultRepository = require('../repositories/MatchResultRepository');
const matchingEngine = require('../ai/MatchingEngine');
const { ROLES, JOB_VISIBILITY } = require('../utils/constants');
const { NotFoundError, ForbiddenError } = require('../utils/customErrors');

class MatchingService {
  async matchFresherToJob(fresherId, jobId) {
    const [profile, job] = await Promise.all([
      fresherRepository.findByUserId(fresherId),
      jobRepository.findById(jobId, { path: 'company', select: 'companyName logo location isPublic' })
    ]);

    if (!profile) throw new NotFoundError('Fresher profile not found', 'PROFILE_NOT_FOUND');
    if (!job) throw new NotFoundError('Job not found', 'JOB_NOT_FOUND');

    // B06: Check private job visibility
    if (job.visibility === JOB_VISIBILITY.PRIVATE) {
      const invitationRepository = require('../repositories/InvitationRepository');
      const invitation = await invitationRepository.findOne({ job: jobId, fresher: fresherId });
      if (!invitation) {
        throw new ForbiddenError('This is a private job listing. An invitation is required to view match analysis.', 'PRIVATE_JOB_ACCESS_DENIED');
      }
    }

    const matchAnalysis = matchingEngine.calculateMatch(profile, job);

    // Persist/cache match result
    await matchResultRepository.saveOrUpdateMatch(fresherId, jobId, matchAnalysis);

    return {
      job: {
        _id: job._id,
        id: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        workMode: job.workMode,
        employmentType: job.employmentType || 'FULL_TIME',
        salaryRange: job.salaryRange,
        requiredSkills: job.requiredSkills || [],
        preferredSkills: job.preferredSkills || [],
        experience: job.experience
      },
      ...matchAnalysis
    };
  }

  async matchFresherToAllJobs(fresherId, limit = 20) {
    const profile = await fresherRepository.findByUserId(fresherId);
    if (!profile) throw new NotFoundError('Fresher profile not found', 'PROFILE_NOT_FOUND');

    // Retrieve active public jobs (B28: batches/paginate)
    const jobsResult = await jobRepository.findPublicJobs({}, 1, 200);
    const jobs = jobsResult.data || [];

    const matches = [];
    for (const job of jobs) {
      const match = matchingEngine.calculateMatch(profile, job);
      matches.push({
        job: {
          _id: job._id,
          id: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
          workMode: job.workMode,
          employmentType: job.employmentType || 'FULL_TIME',
          salaryRange: job.salaryRange,
          requiredSkills: job.requiredSkills || [],
          preferredSkills: job.preferredSkills || [],
          experience: job.experience,
          status: job.status
        },
        ...match
      });
    }

    matches.sort((a, b) => b.matchScore - a.matchScore);
    return matches.slice(0, limit);
  }

  async matchCandidatesForJob(jobId, userId, userRole, limit = 50) {
    const job = await jobRepository.findById(jobId);
    if (!job) throw new NotFoundError('Job not found', 'JOB_NOT_FOUND');

    if (job.postedBy.toString() !== userId.toString() && userRole !== ROLES.ADMIN) {
      throw new ForbiddenError('You can only analyze candidate matches for your own jobs', 'FORBIDDEN_JOB_MATCH');
    }

    const profiles = await fresherRepository.find({}, { createdAt: -1 }, 200, 0, {
      path: 'user',
      select: 'name email avatar'
    });

    const matches = [];
    for (const profile of profiles) {
      const match = matchingEngine.calculateMatch(profile, job);
      matches.push({
        candidate: {
          _id: profile.user?._id,
          id: profile.user?._id,
          name: profile.fullName || profile.user?.name,
          email: profile.email || profile.user?.email,
          avatar: profile.user?.avatar,
          location: profile.location,
          completionPercentage: profile.completionPercentage,
          resumeUrl: profile.resumeUrl,
          skills: profile.skills || []
        },
        ...match
      });
    }

    matches.sort((a, b) => b.matchScore - a.matchScore);
    return matches.slice(0, limit);
  }
}

module.exports = new MatchingService();
