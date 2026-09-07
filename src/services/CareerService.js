const fresherRepository = require('../repositories/FresherRepository');
const careerRepository = require('../repositories/CareerRepository');
const assessmentRepository = require('../repositories/AssessmentRepository');
const matchingEngine = require('../ai/MatchingEngine');
const { NotFoundError, BadRequestError } = require('../utils/customErrors');

// Domain taxonomy of tech career roles and required foundational skills
const ROLE_TAXONOMIES = {
  'Frontend Developer': ['JavaScript', 'TypeScript', 'React', 'HTML5', 'CSS3', 'Redux', 'TailwindCSS', 'Git'],
  'Backend Developer': ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'REST API', 'Docker', 'Authentication', 'Git'],
  'Full Stack Developer': ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'Docker', 'Git', 'REST API'],
  'Data Scientist': ['Python', 'Pandas', 'NumPy', 'Scikit-Learn', 'SQL', 'Machine Learning', 'Data Visualization'],
  'DevOps Engineer': ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Terraform', 'Git', 'Monitoring']
};

// Curated high quality learning resources for specific skills (B32)
const SKILL_RESOURCE_MAP = {
  'react': { title: 'Official React Documentation & Interactive Tutorial', url: 'https://react.dev' },
  'javascript': { title: 'MDN Modern JavaScript Deep Dive', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
  'typescript': { title: 'TypeScript Handbook & Interactive Playground', url: 'https://www.typescriptlang.org/docs/' },
  'nodejs': { title: 'Node.js Core Architecture & API Guides', url: 'https://nodejs.org/en/docs/' },
  'express': { title: 'Express.js Framework Guide & REST API Design', url: 'https://expressjs.com/' },
  'mongodb': { title: 'MongoDB University & Aggregation Pipeline Tutorial', url: 'https://www.mongodb.com/docs/' },
  'postgresql': { title: 'PostgreSQL Tutorial & Schema Optimization', url: 'https://www.postgresqltutorial.com/' },
  'docker': { title: 'Docker Get Started & Containerization Lab', url: 'https://docs.docker.com/get-started/' },
  'kubernetes': { title: 'Kubernetes Basics & Deployment Architecture', url: 'https://kubernetes.io/docs/tutorials/' },
  'python': { title: 'Python Official Tutorial & Best Practices', url: 'https://docs.python.org/3/tutorial/' },
  'git': { title: 'Pro Git Book & Branching Workflows', url: 'https://git-scm.com/book/en/v2' },
  'tailwindcss': { title: 'Tailwind CSS Modern Styling Guide', url: 'https://tailwindcss.com/docs' }
};

class CareerService {
  async getCareerProfile(userId) {
    const profile = await fresherRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Fresher profile not found', 'PROFILE_NOT_FOUND');
    }

    const assessments = await assessmentRepository.findSubmissionsByFresher(userId);
    const recommendation = await careerRepository.findByFresher(userId);

    return {
      fresher: {
        fullName: profile.fullName,
        completionPercentage: profile.completionPercentage,
        skills: profile.skills,
        careerInterests: profile.careerInterests,
        preferredJobRoles: profile.preferredJobRoles
      },
      assessmentSummary: {
        totalTaken: assessments.length,
        passedCount: assessments.filter((a) => a.isPassed).length,
        recentSubmissions: assessments.slice(0, 5)
      },
      activeCareerGoal: recommendation || null
    };
  }

  async setCareerGoal(userId, targetRole) {
    const profile = await fresherRepository.findByUserId(userId, false);
    if (!profile) {
      throw new NotFoundError('Fresher profile not found', 'PROFILE_NOT_FOUND');
    }

    if (!profile.careerInterests.includes(targetRole)) {
      profile.careerInterests.push(targetRole);
      await profile.save();
    }

    return await this.generateCareerRoadmap(userId, targetRole);
  }

  async calculateSkillGap(userId, targetRoleParam = null) {
    const profile = await fresherRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Fresher profile not found', 'PROFILE_NOT_FOUND');
    }

    const targetRole =
      targetRoleParam ||
      (profile.preferredJobRoles && profile.preferredJobRoles[0]) ||
      (profile.careerInterests && profile.careerInterests[0]) ||
      'Full Stack Developer';

    const requiredSkills = ROLE_TAXONOMIES[targetRole] || ROLE_TAXONOMIES['Full Stack Developer'];
    const userSkills = profile.skills || [];

    // B27: Use MatchingEngine normalization and strict matching
    const normalizedUserSkills = new Set(
      userSkills
        .map((s) => matchingEngine.normalizeSkill(s))
        .filter((s) => s.length > 0)
    );

    const possessedSkills = [];
    const missingSkills = [];

    for (const skill of requiredSkills) {
      const norm = matchingEngine.normalizeSkill(skill);
      if (normalizedUserSkills.has(norm)) {
        possessedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    }

    const readinessScore = Math.round((possessedSkills.length / requiredSkills.length) * 100);

    return {
      targetRole,
      readinessScore,
      possessedSkills,
      missingSkills,
      totalRequiredCount: requiredSkills.length,
      recommendationSummary:
        readinessScore >= 80
          ? 'You are well prepared for entry-level applications in this role!'
          : `Focus on mastering ${missingSkills.slice(0, 3).join(', ')} to boost your hireability.`
    };
  }

  // B32: Get roadmap without wiping user progress
  async getRoadmap(userId, targetRoleParam = null) {
    const existing = await careerRepository.findByFresher(userId);
    if (existing) {
      if (!targetRoleParam || existing.targetRole.toLowerCase() === targetRoleParam.toLowerCase()) {
        return existing;
      }
    }
    return await this.generateCareerRoadmap(userId, targetRoleParam);
  }

  async generateCareerRoadmap(userId, targetRoleParam = null) {
    const gap = await this.calculateSkillGap(userId, targetRoleParam);
    const existing = await careerRepository.findByFresher(userId);

    // Keep map of previous progress to preserve step completion states
    const previousStatusMap = new Map();
    if (existing && existing.roadmap) {
      for (const s of existing.roadmap) {
        if (s.title) previousStatusMap.set(s.title, s.status);
      }
    }

    const roadmapSteps = [];
    let stepNum = 1;

    // Build personalized milestones with curated resources
    for (const missingSkill of gap.missingSkills) {
      const norm = matchingEngine.normalizeSkill(missingSkill);
      const curated = SKILL_RESOURCE_MAP[norm] || {
        title: `Official ${missingSkill} Documentation & Reference Guide`,
        url: `https://github.com/topics/${encodeURIComponent(norm || missingSkill.toLowerCase())}`
      };

      const stepTitle = `Master ${missingSkill} Fundamentals`;
      const prevStatus = previousStatusMap.get(stepTitle) || 'NOT_STARTED';

      roadmapSteps.push({
        stepNumber: stepNum++,
        title: stepTitle,
        description: `Learn the essential syntax, ecosystem, and build 1 practical project using ${missingSkill}.`,
        targetSkills: [missingSkill],
        estimatedWeeks: 2,
        recommendedResources: [
          {
            title: curated.title,
            type: 'DOCUMENTATION',
            url: curated.url
          },
          {
            title: `Build Portfolio Project with ${missingSkill}`,
            type: 'PROJECT',
            url: `https://github.com/topics/${encodeURIComponent(norm || missingSkill.toLowerCase())}`
          }
        ],
        status: prevStatus
      });
    }

    // Add capstone project step
    const capstoneTitle = `Build Capstone ${gap.targetRole} Project`;
    const capstoneStatus = previousStatusMap.get(capstoneTitle) || 'NOT_STARTED';

    roadmapSteps.push({
      stepNumber: stepNum,
      title: capstoneTitle,
      description: 'Design and deploy a full-featured application incorporating your learned skills and link it to your CareerPilot profile.',
      targetSkills: gap.possessedSkills.concat(gap.missingSkills),
      estimatedWeeks: 3,
      recommendedResources: [
        {
          title: 'CareerPilot Portfolio & GitHub Showcase Guidelines',
          type: 'DOCUMENTATION',
          url: 'https://careerpilot.io/docs/capstone'
        }
      ],
      status: capstoneStatus
    });

    return await careerRepository.saveOrUpdateRecommendation(userId, gap.targetRole, {
      currentReadinessScore: gap.readinessScore,
      possessedSkills: gap.possessedSkills,
      missingSkills: gap.missingSkills,
      roadmap: roadmapSteps,
      summary: `Personalized ${gap.targetRole} roadmap targeting ${gap.missingSkills.length} skill gaps.`
    });
  }

  async updateRoadmapStepProgress(userId, stepNumber, newStatus) {
    const validStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];
    if (!validStatuses.includes(newStatus)) {
      throw new BadRequestError(`Invalid roadmap step status: ${newStatus}`, 'INVALID_STEP_STATUS');
    }

    const rec = await careerRepository.findByFresher(userId);
    if (!rec || !rec.roadmap) {
      throw new NotFoundError('No active roadmap found for user', 'ROADMAP_NOT_FOUND');
    }

    const step = rec.roadmap.find((s) => s.stepNumber === parseInt(stepNumber, 10));
    if (!step) {
      throw new NotFoundError(`Roadmap step ${stepNumber} not found`, 'STEP_NOT_FOUND');
    }

    step.status = newStatus;
    await rec.save();
    return rec;
  }
}

module.exports = new CareerService();
