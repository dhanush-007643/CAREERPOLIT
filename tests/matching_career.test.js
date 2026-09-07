const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const { ROLES, ASSESSMENT_CATEGORY } = require('../src/utils/constants');

describe('AI Matching, Career Development & Assessments Suite', () => {
  let adminToken;
  let startupToken;
  let fresherToken;
  let jobId;

  beforeEach(async () => {
    // Admin
    const adminUser = await User.create({
      name: 'Master Admin',
      email: 'admin@platform.com',
      password: 'Password123!',
      role: ROLES.ADMIN
    });
    adminToken = adminUser.generateAuthToken();

    // Startup
    const startupRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Tech Founder',
        email: 'founder@scaleup.io',
        password: 'Password123!',
        role: ROLES.STARTUP,
        companyName: 'ScaleUp AI'
      });
    startupToken = startupRes.body.data.token;

    // Fresher
    const fresherRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Candidate Taylor',
        email: 'taylor@example.com',
        password: 'Password123!',
        role: ROLES.FRESHER
      });
    fresherToken = fresherRes.body.data.token;

    // Setup fresher profile
    await request(app)
      .put('/api/freshers/profile')
      .set('Authorization', `Bearer ${fresherToken}`)
      .send({
        skills: ['React', 'Node.js', 'MongoDB', 'Express'],
        careerInterests: ['Full Stack Developer'],
        preferredJobRoles: ['Full Stack Developer'],
        education: [{ degree: 'BS Computer Science', university: 'Berkeley', graduationYear: 2024 }]
      });

    // Create matching job
    const jobRes = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${startupToken}`)
      .send({
        title: 'Full Stack MERN Developer',
        description: 'React, Node, Express, MongoDB cloud platform development.',
        requiredSkills: ['React', 'Node.js', 'MongoDB', 'Express'],
        preferredSkills: ['TypeScript', 'Docker'],
        location: 'Remote'
      });
    jobId = jobRes.body.data._id;
  });

  it('should calculate accurate AI match score with matched & missing skills and explanations', async () => {
    const matchRes = await request(app)
      .get(`/api/matching/jobs/${jobId}`)
      .set('Authorization', `Bearer ${fresherToken}`);

    expect(matchRes.status).toBe(200);
    expect(matchRes.body.success).toBe(true);
    expect(matchRes.body.data.matchScore).toBeGreaterThanOrEqual(75);
    expect(matchRes.body.data.matchedSkills).toContain('React');
    expect(matchRes.body.data.explanation).toBeDefined();
    expect(matchRes.body.data.recommendation).toBeDefined();
  });

  it('should generate skill-gap analysis and personalized learning roadmap', async () => {
    const gapRes = await request(app)
      .get('/api/career/skill-gap?targetRole=Full Stack Developer')
      .set('Authorization', `Bearer ${fresherToken}`);

    expect(gapRes.status).toBe(200);
    expect(gapRes.body.success).toBe(true);
    expect(gapRes.body.data.targetRole).toBe('Full Stack Developer');
    expect(gapRes.body.data.readinessScore).toBeDefined();

    const roadmapRes = await request(app)
      .get('/api/career/roadmap')
      .set('Authorization', `Bearer ${fresherToken}`);

    expect(roadmapRes.status).toBe(200);
    expect(roadmapRes.body.data.roadmap).toBeDefined();
    expect(roadmapRes.body.data.roadmap.length).toBeGreaterThanOrEqual(1);
  });

  it('should allow admin to create assessments and fresher to take and submit them', async () => {
    // Admin creates assessment
    const createAssessRes = await request(app)
      .post('/api/assessments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Core React Assessment',
        category: ASSESSMENT_CATEGORY.FRONTEND,
        skillName: 'React',
        durationMinutes: 15,
        passingScorePercentage: 50,
        questions: [
          {
            questionText: 'What is JSX in React?',
            options: [
              { text: 'A syntax extension for JavaScript', isCorrect: true },
              { text: 'A database query language', isCorrect: false }
            ],
            points: 50
          },
          {
            questionText: 'Which hook manages local component state?',
            options: [
              { text: 'useState', isCorrect: true },
              { text: 'useHistory', isCorrect: false }
            ],
            points: 50
          }
        ]
      });

    expect(createAssessRes.status).toBe(201);
    const assessmentId = createAssessRes.body.data._id;
    const q1 = createAssessRes.body.data.questions[0];
    const q2 = createAssessRes.body.data.questions[1];

    // Fresher fetches assessment (without isCorrect leaks)
    const getAssessRes = await request(app)
      .get(`/api/assessments/${assessmentId}`)
      .set('Authorization', `Bearer ${fresherToken}`);

    expect(getAssessRes.status).toBe(200);
    expect(getAssessRes.body.data.questions[0].options[0].isCorrect).toBeUndefined();

    // Fresher submits answers
    const submitRes = await request(app)
      .post(`/api/assessments/${assessmentId}/submit`)
      .set('Authorization', `Bearer ${fresherToken}`)
      .send({
        answers: [
          { questionId: q1._id, selectedOptionId: q1.options[0]._id },
          { questionId: q2._id, selectedOptionId: q2.options[0]._id }
        ]
      });

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.data.percentage).toBe(100);
    expect(submitRes.body.data.isPassed).toBe(true);
  });
});
