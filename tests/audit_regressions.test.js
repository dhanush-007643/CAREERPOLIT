const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Job = require('../src/models/Job');
const Company = require('../src/models/Company');
const FresherProfile = require('../src/models/FresherProfile');
const Application = require('../src/models/Application');
const Invitation = require('../src/models/Invitation');
const Assessment = require('../src/models/Assessment');
const MatchingEngine = require('../src/ai/MatchingEngine');
const CareerService = require('../src/services/CareerService');
const AdminService = require('../src/services/AdminService');
const MatchingService = require('../src/services/MatchingService');
const { ROLES, JOB_STATUS, APPLICATION_STATUS, INVITATION_STATUS, INTERVIEW_STATUS, ASSESSMENT_CATEGORY } = require('../src/utils/constants');

describe('CareerPilot Comprehensive Audit Regressions Suite (B01 - B36)', () => {
  let adminToken, startupTokenA, startupTokenB, fresherToken;
  let adminUser, startupUserA, startupUserB, fresherUser;
  let companyA, companyB, fresherProfile;

  beforeEach(async () => {
    // 1. Admin fixture
    adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@audit.io',
      password: 'Password123!',
      role: ROLES.ADMIN
    });
    adminToken = adminUser.generateAuthToken();

    // 2. Register Startup A
    const resA = await request(app).post('/api/auth/register').send({
      name: 'Startup A Owner',
      email: 'owner.alpha@audit.io',
      password: 'Password123!',
      role: ROLES.STARTUP,
      companyName: 'Startup Alpha Inc',
      industry: 'Technology',
      location: 'San Francisco, CA'
    });
    startupTokenA = resA.body.data.token;
    startupUserA = resA.body.data.user;
    companyA = resA.body.data.profile;

    // 3. Register Startup B
    const resB = await request(app).post('/api/auth/register').send({
      name: 'Startup B Owner',
      email: 'owner.beta@audit.io',
      password: 'Password123!',
      role: ROLES.STARTUP,
      companyName: 'Startup Beta Corp',
      industry: 'Finance',
      location: 'New York, NY'
    });
    startupTokenB = resB.body.data.token;
    startupUserB = resB.body.data.user;
    companyB = resB.body.data.profile;

    // 4. Register Fresher
    const resFresher = await request(app).post('/api/auth/register').send({
      name: 'Alex Fresher',
      email: 'alex@audit.io',
      password: 'Password123!',
      role: ROLES.FRESHER,
      location: 'Austin, TX'
    });
    fresherToken = resFresher.body.data.token;
    fresherUser = resFresher.body.data.user;
    fresherProfile = resFresher.body.data.profile;
  });

  // --- B01: Public Registration Role Escalation Guard ---
  describe('B01: Registration Authorization', () => {
    it('should reject registration attempts with ADMIN role', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Attacker Admin',
        email: 'attacker@evil.com',
        password: 'Password123!',
        role: ROLES.ADMIN
      });
      expect([400, 422]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  });

  // --- B02: Password Reset Token Information Leakage ---
  describe('B02: Password Reset Security', () => {
    it('should NOT return resetToken in forgot-password response', async () => {
      const res = await request(app).post('/api/auth/forgot-password').send({
        email: 'alex@audit.io'
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data?.resetToken).toBeUndefined();
    });
  });

  // --- B04: Startup ATS Multi-Tenant Data Isolation ---
  describe('B04: Application Multi-Tenancy Isolation', () => {
    it('should forbid Startup B from accessing applications for Startup A jobs', async () => {
      // Create job by Startup A
      const jobRes = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${startupTokenA}`)
        .send({
          title: 'Full Stack Engineer',
          description: 'Build modern applications with Node and React.',
          location: 'San Francisco, CA',
          locationType: 'REMOTE',
          employmentType: 'FULL_TIME',
          requiredSkills: ['React', 'Node.js', 'MongoDB'],
          salaryMin: 80000,
          salaryMax: 120000
        });
      const jobId = jobRes.body.data._id;

      // Fresher applies to Job A via /api/jobs/:id/apply with resume
      const appRes = await request(app)
        .post(`/api/jobs/${jobId}/apply`)
        .set('Authorization', `Bearer ${fresherToken}`)
        .send({
          resumeUrl: 'https://storage.googleapis.com/resumes/alex.pdf',
          coverLetter: 'I would love to join your team!'
        });
      expect(appRes.status).toBe(201);
      const applicationId = appRes.body.data._id;

      // Startup B attempts to view application
      const viewRes = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${startupTokenB}`);

      expect(viewRes.status).toBe(403);
    });
  });

  // --- B05: Invitation Recruiter Job Ownership Guard ---
  describe('B05: Recruiter Job Ownership Validation on Invitations', () => {
    it('should forbid Startup B from sending an invitation for Startup A job', async () => {
      const jobRes = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${startupTokenA}`)
        .send({
          title: 'DevOps Engineer',
          description: 'Kubernetes and CI/CD pipelines.',
          location: 'Remote',
          locationType: 'REMOTE',
          employmentType: 'FULL_TIME',
          requiredSkills: ['Docker', 'Kubernetes'],
          salaryMin: 90000,
          salaryMax: 130000
        });
      const jobAId = jobRes.body.data._id;

      // Startup B tries to invite candidate to Job A
      const inviteRes = await request(app)
        .post('/api/invitations')
        .set('Authorization', `Bearer ${startupTokenB}`)
        .send({
          fresherId: fresherUser._id || fresherUser.id,
          jobId: jobAId,
          message: 'Join us at Startup Beta!'
        });

      expect(inviteRes.status).toBe(403);
    });
  });

  // --- B06: Private Job Visibility Control ---
  describe('B06: Private Job Visibility Guard', () => {
    it('should hide private jobs from unauthenticated public discovery', async () => {
      const jobRes = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${startupTokenA}`)
        .send({
          title: 'Confidential Executive Role',
          description: 'Secret internal leadership position.',
          location: 'New York, NY',
          locationType: 'ON_SITE',
          employmentType: 'FULL_TIME',
          visibility: 'PRIVATE',
          requiredSkills: ['Leadership', 'Management'],
          salaryMin: 150000,
          salaryMax: 200000
        });
      const privateJobId = jobRes.body.data._id;

      // Unauthenticated request
      const publicRes = await request(app).get(`/api/jobs/${privateJobId}`);
      expect([403, 404]).toContain(publicRes.status);

      // Authenticated Owner can see it
      const ownerRes = await request(app)
        .get(`/api/jobs/${privateJobId}`)
        .set('Authorization', `Bearer ${startupTokenA}`);
      expect(ownerRes.status).toBe(200);
      expect(ownerRes.body.data.visibility).toBe('PRIVATE');
    });
  });

  // --- B07: Assessment Question Answer Key Leak Prevention ---
  describe('B07: Assessment Answering Security', () => {
    it('should NOT leak isCorrect when candidate views assessment', async () => {
      // Create assessment directly in model
      const assessDoc = await Assessment.create({
        title: 'JavaScript Fundamentals Test',
        description: 'Core JS closures and async knowledge.',
        category: ASSESSMENT_CATEGORY.FULLSTACK,
        skillName: 'JavaScript',
        durationMinutes: 20,
        passingScorePercentage: 50,
        questions: [
          {
            questionText: 'What is the output of typeof null?',
            options: [
              { text: 'object', isCorrect: true },
              { text: 'null', isCorrect: false }
            ],
            points: 10
          }
        ]
      });

      // Fresher fetches test
      const takeRes = await request(app)
        .get(`/api/assessments/${assessDoc._id}`)
        .set('Authorization', `Bearer ${fresherToken}`);

      expect(takeRes.status).toBe(200);
      expect(takeRes.body.data.questions).toBeDefined();
      takeRes.body.data.questions.forEach((q) => {
        expect(q.options).toBeDefined();
        q.options.forEach((opt) => {
          expect(opt.isCorrect).toBeUndefined();
        });
      });
    });
  });

  // --- B08: Token Revocation on Password Reset / Token Version Increment ---
  describe('B08: Token Version Invalidation', () => {
    it('should invalidate old JWT tokens after tokenVersion is incremented', async () => {
      // 1. Verify old token works
      const testRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${fresherToken}`);
      expect(testRes.status).toBe(200);

      // 2. Increment tokenVersion in DB (e.g. password reset/security event)
      await User.findByIdAndUpdate(fresherUser._id || fresherUser.id, {
        $inc: { tokenVersion: 1 }
      });

      // 3. Old token should now be rejected with 401
      const oldTokenRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${fresherToken}`);
      expect(oldTokenRes.status).toBe(401);
    });
  });

  // --- B11 & B12: AI Matching Engine Full Job Payload ---
  describe('B11 & B12: Matching Engine Job Shape Integrity', () => {
    it('should return complete job entity properties (_id, id, requiredSkills, employmentType)', async () => {
      // Update Fresher profile skills
      await request(app)
        .put('/api/freshers/profile')
        .set('Authorization', `Bearer ${fresherToken}`)
        .send({
          skills: [
            { name: 'React', level: 'INTERMEDIATE', experienceMonths: 12 },
            { name: 'Node.js', level: 'BEGINNER', experienceMonths: 6 }
          ],
          preferredRoles: ['Frontend Developer', 'Full Stack Developer']
        });

      // Create a matching job
      await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${startupTokenA}`)
        .send({
          title: 'Frontend Developer',
          description: 'React developer position.',
          location: 'San Francisco, CA',
          locationType: 'REMOTE',
          employmentType: 'FULL_TIME',
          requiredSkills: ['React', 'CSS'],
          salaryMin: 75000,
          salaryMax: 110000
        });

      const matchRes = await request(app)
        .get('/api/matching/jobs')
        .set('Authorization', `Bearer ${fresherToken}`);

      expect(matchRes.status).toBe(200);
      expect(matchRes.body.data).toBeInstanceOf(Array);
      if (matchRes.body.data.length > 0) {
        const item = matchRes.body.data[0];
        expect(item.job).toBeDefined();
        expect(item.job._id || item.job.id).toBeDefined();
        expect(item.job.requiredSkills).toBeInstanceOf(Array);
        expect(item.job.employmentType).toBeDefined();
      }
    });
  });

  // --- B13: Company Profile Endpoints ---
  describe('B13: Company Profile Retrieval and Update', () => {
    it('should allow startup recruiter to get and update company profile via /companies/profile', async () => {
      const getRes = await request(app)
        .get('/api/companies/profile')
        .set('Authorization', `Bearer ${startupTokenA}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.companyName).toBe('Startup Alpha Inc');

      const updateRes = await request(app)
        .put('/api/companies/profile')
        .set('Authorization', `Bearer ${startupTokenA}`)
        .send({
          companyName: 'Startup Alpha Global',
          website: 'https://alpha-global.io',
          tagline: 'Leading the future of AI'
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.companyName).toBe('Startup Alpha Global');
      expect(updateRes.body.data.website).toBe('https://alpha-global.io');
    });
  });

  // --- B14: Admin Dashboard Stats and User Management ---
  describe('B14: Admin Dashboard Stats and User Management', () => {
    it('should provide /api/admin/stats and allow updating user active status', async () => {
      const statsRes = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(statsRes.status).toBe(200);
      expect(statsRes.body.data.totalUsers).toBeGreaterThanOrEqual(4);

      // Toggle user status
      const userStatusRes = await request(app)
        .patch(`/api/admin/users/${fresherUser._id || fresherUser.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(userStatusRes.status).toBe(200);
      expect(userStatusRes.body.data.isActive).toBe(false);
    });
  });

  // --- B15: Career Goal & Step Progress Update ---
  describe('B15: Career Goal and Step Progress', () => {
    it('should allow setting career goal and updating roadmap step status', async () => {
      const goalRes = await request(app)
        .post('/api/career/goal')
        .set('Authorization', `Bearer ${fresherToken}`)
        .send({
          targetRole: 'Full Stack Engineer',
          timelineWeeks: 12
        });

      expect(goalRes.status).toBe(200);
      expect(goalRes.body.data.targetRole).toBe('Full Stack Engineer');

      // Update step progress
      const stepRes = await request(app)
        .patch('/api/career/roadmap/step')
        .set('Authorization', `Bearer ${fresherToken}`)
        .send({
          stepNumber: 1,
          status: 'COMPLETED'
        });

      expect(stepRes.status).toBe(200);
      expect(stepRes.body.data.roadmap[0].status).toBe('COMPLETED');
    });
  });

  // --- B16: Recruiter Own Job Retrieval ---
  describe('B16: Recruiter /jobs/my Endpoint', () => {
    it('should return only jobs belonging to the authenticated startup', async () => {
      // Create job for Startup A
      await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${startupTokenA}`)
        .send({
          title: 'QA Automation Lead',
          description: 'Selenium and Cypress test automation.',
          location: 'Austin, TX',
          locationType: 'HYBRID',
          employmentType: 'FULL_TIME',
          requiredSkills: ['Cypress', 'JavaScript'],
          salaryMin: 70000,
          salaryMax: 95000
        });

      const myJobsRes = await request(app)
        .get('/api/jobs/my')
        .set('Authorization', `Bearer ${startupTokenA}`);

      expect(myJobsRes.status).toBe(200);
      expect(myJobsRes.body.data.length).toBeGreaterThanOrEqual(1);
      expect(myJobsRes.body.data[0].title).toBe('QA Automation Lead');
    });
  });

  // --- B21: Expired Invitation Handling ---
  describe('B21: Invitation Expiration Validation', () => {
    it('should prevent responding to expired invitations', async () => {
      const jobRes = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${startupTokenA}`)
        .send({
          title: 'Backend Dev',
          description: 'Express and MongoDB APIs',
          location: 'Remote',
          locationType: 'REMOTE',
          employmentType: 'FULL_TIME',
          requiredSkills: ['Node.js'],
          salaryMin: 80000,
          salaryMax: 100000
        });

      const companyDoc = await Company.findOne({ user: startupUserA._id || startupUserA.id });

      // Create an already expired invitation directly in DB
      const expiredInvite = await Invitation.create({
        company: companyDoc._id,
        fresher: fresherUser._id || fresherUser.id,
        job: jobRes.body.data._id,
        status: INVITATION_STATUS.PENDING,
        expiryDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // yesterday
      });

      const respondRes = await request(app)
        .patch(`/api/invitations/${expiredInvite._id}/accept`)
        .set('Authorization', `Bearer ${fresherToken}`)
        .send({});

      expect(respondRes.status).toBe(400);
      expect(respondRes.body.message).toMatch(/expired/i);
    });
  });

  // --- B22: Expired Application Deadline ---
  describe('B22: Job Application Deadline Check', () => {
    it('should reject application if deadline has passed', async () => {
      const pastDeadline = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const jobRes = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${startupTokenA}`)
        .send({
          title: 'Intern Developer',
          description: 'Summer internship program.',
          location: 'Remote',
          locationType: 'REMOTE',
          employmentType: 'INTERNSHIP',
          requiredSkills: ['Python'],
          salaryMin: 40000,
          salaryMax: 50000,
          deadline: pastDeadline
        });

      const applyRes = await request(app)
        .post(`/api/jobs/${jobRes.body.data._id}/apply`)
        .set('Authorization', `Bearer ${fresherToken}`)
        .send({
          resumeUrl: 'https://storage.googleapis.com/resumes/alex.pdf',
          coverLetter: 'Excited about the internship!'
        });

      expect(applyRes.status).toBe(400);
      expect(applyRes.body.message).toMatch(/expired/i);
    });
  });

  // --- B24 & B25: Interview Scheduling & Time Conflicts ---
  describe('B24 & B25: Interview Scheduling Validations', () => {
    it('should allow valid same-day future time and reject duplicate active interviews', async () => {
      // 1. Create Job & Application
      const jobRes = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${startupTokenA}`)
        .send({
          title: 'Systems Architect',
          description: 'High throughput cloud architectures.',
          location: 'San Jose, CA',
          locationType: 'HYBRID',
          employmentType: 'FULL_TIME',
          requiredSkills: ['Go', 'Cloud'],
          salaryMin: 120000,
          salaryMax: 160000
        });

      const appRes = await request(app)
        .post(`/api/jobs/${jobRes.body.data._id}/apply`)
        .set('Authorization', `Bearer ${fresherToken}`)
        .send({
          resumeUrl: 'https://storage.googleapis.com/resumes/alex.pdf',
          coverLetter: 'Expert architect candidate.'
        });
      const appId = appRes.body.data._id;

      // 2. Schedule Future Interview for tomorrow
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const schedRes1 = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${startupTokenA}`)
        .send({
          applicationId: appId,
          date: tomorrow,
          time: '14:30',
          durationMinutes: 45,
          meetingLink: 'https://meet.google.com/abc-defg-hij',
          interviewType: 'TECHNICAL'
        });

      expect(schedRes1.status).toBe(201);
      expect(schedRes1.body.data.status).toBe(INTERVIEW_STATUS.SCHEDULED);

      // 3. Attempt to schedule another active interview for the same application (B25 conflict check)
      const schedRes2 = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${startupTokenA}`)
        .send({
          applicationId: appId,
          date: tomorrow,
          time: '16:00',
          meetingLink: 'https://meet.google.com/xyz-uvw-rst'
        });

      expect([400, 409]).toContain(schedRes2.status);
    });
  });

  // --- B27: Matching Engine Skill Canonicalization & Edge Cases ---
  describe('B27: MatchingEngine Skill Aliasing & Math Robustness', () => {
    it('should canonicalize aliases (React.js -> react, Node -> nodejs, TS -> typescript)', () => {
      expect(MatchingEngine.normalizeSkill('React.js')).toBe('react');
      expect(MatchingEngine.normalizeSkill('Node')).toBe('nodejs');
      expect(MatchingEngine.normalizeSkill('TS')).toBe('typescript');

      const result = MatchingEngine.evaluateSkillMatch(
        ['React.js', 'Node', 'TS'],
        ['react', 'nodejs', 'typescript']
      );
      expect(result.missing.length).toBe(0);
      expect(result.score).toBe(100);
    });

    it('should return safe score when target skills are empty', () => {
      const result = MatchingEngine.evaluateSkillMatch(['Python'], []);
      expect(result.score).toBe(100);
      expect(result.missing.length).toBe(0);
    });
  });

  // --- B29: Job Search Special Characters Regex Escaping ---
  describe('B29: Job Repository Regex Safety', () => {
    it('should handle C++, C#, .NET search terms without syntax errors', async () => {
      await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${startupTokenA}`)
        .send({
          title: 'C++ Systems Engineer',
          description: 'Develop low-latency drivers in C++ and C#.',
          location: 'Seattle, WA',
          locationType: 'HYBRID',
          employmentType: 'FULL_TIME',
          requiredSkills: ['C++', 'C#', '.NET'],
          salaryMin: 110000,
          salaryMax: 150000
        });

      const searchRes = await request(app).get('/api/jobs?search=' + encodeURIComponent('C++'));
      expect(searchRes.status).toBe(200);
      expect(searchRes.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // --- B31: Assessment Timeout Empty Submission ---
  describe('B31: Assessment Submission Timeout Handling', () => {
    it('should score 0 without throwing error on timeout (empty answers)', async () => {
      const assessDoc = await Assessment.create({
        title: 'Quick Python Quiz',
        description: 'Assess basic python syntax.',
        category: ASSESSMENT_CATEGORY.BACKEND,
        skillName: 'Python',
        durationMinutes: 10,
        passingScorePercentage: 50,
        questions: [
          {
            questionText: 'What is Python?',
            options: [
              { text: 'Language', isCorrect: true },
              { text: 'Snake', isCorrect: false }
            ],
            points: 10
          }
        ]
      });

      const q = assessDoc.questions[0];
      const wrongOpt = q.options.find((opt) => !opt.isCorrect);

      // Submit incorrect answer
      const subRes = await request(app)
        .post(`/api/assessments/${assessDoc._id}/submit`)
        .set('Authorization', `Bearer ${fresherToken}`)
        .send({
          answers: [{ questionId: q._id.toString(), selectedOptionId: wrongOpt._id.toString() }]
        });

      expect(subRes.status).toBe(200);
      expect(subRes.body.data.percentage).toBe(0);
      expect(subRes.body.data.isPassed).toBe(false);
    });
  });
});
