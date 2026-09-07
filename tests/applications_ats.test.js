const request = require('supertest');
const app = require('../src/app');
const { ROLES, APPLICATION_STATUS } = require('../src/utils/constants');

describe('Application System & ATS Pipeline Suite', () => {
  let startupToken;
  let fresherToken;
  let jobId;

  beforeEach(async () => {
    const startupRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Venture HR',
        email: 'hr@venturecloud.io',
        password: 'Password123!',
        role: ROLES.STARTUP,
        companyName: 'Venture Cloud'
      });
    startupToken = startupRes.body.data.token;

    const fresherRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Applicant Candidate',
        email: 'applicant@example.com',
        password: 'Password123!',
        role: ROLES.FRESHER
      });
    fresherToken = fresherRes.body.data.token;

    // Update fresher profile with resume and skills
    await request(app)
      .put('/api/freshers/profile')
      .set('Authorization', `Bearer ${fresherToken}`)
      .send({
        skills: ['React', 'Node.js', 'MongoDB'],
        education: [{ degree: 'BS CS', university: 'Stanford', graduationYear: 2024 }]
      });

    const dummyBuffer = Buffer.from('Mock PDF Resume');
    await request(app)
      .post('/api/freshers/resume')
      .set('Authorization', `Bearer ${fresherToken}`)
      .attach('resume', dummyBuffer, 'applicant_resume.pdf');

    // Post job
    const jobRes = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${startupToken}`)
      .send({
        title: 'Full Stack Node.js Engineer',
        description: 'Design robust backend services and React interfaces.',
        requiredSkills: ['React', 'Node.js', 'MongoDB'],
        location: 'Remote'
      });
    jobId = jobRes.body.data._id;
  });

  it('should allow fresher to apply for a job and calculate initial match score', async () => {
    const applyRes = await request(app)
      .post(`/api/jobs/${jobId}/apply`)
      .set('Authorization', `Bearer ${fresherToken}`)
      .send({
        coverLetter: 'I am highly passionate about fullstack web architecture.'
      });

    expect(applyRes.status).toBe(201);
    expect(applyRes.body.success).toBe(true);
    expect(applyRes.body.data.matchScore).toBeGreaterThanOrEqual(70);
    expect(applyRes.body.data.status).toBe(APPLICATION_STATUS.APPLIED);
    const applicationId = applyRes.body.data._id;

    // Duplicate application should be blocked
    const dupRes = await request(app)
      .post(`/api/jobs/${jobId}/apply`)
      .set('Authorization', `Bearer ${fresherToken}`)
      .send({ coverLetter: 'Second attempt' });

    expect(dupRes.status).toBe(409);

    // Fresher views own applications
    const myAppsRes = await request(app)
      .get('/api/applications/my')
      .set('Authorization', `Bearer ${fresherToken}`);

    expect(myAppsRes.status).toBe(200);
    expect(myAppsRes.body.data.length).toBe(1);

    // Startup views ATS pipeline board
    const pipelineRes = await request(app)
      .get('/api/company/pipeline')
      .set('Authorization', `Bearer ${startupToken}`);

    expect(pipelineRes.status).toBe(200);
    expect(pipelineRes.body.data.pipeline.APPLIED.length).toBe(1);

    // Transition ATS Stage: APPLIED -> SHORTLISTED
    const statusUpdateRes = await request(app)
      .patch(`/api/applications/${applicationId}/status`)
      .set('Authorization', `Bearer ${startupToken}`)
      .send({
        status: APPLICATION_STATUS.SHORTLISTED,
        note: 'Passed initial resume screening'
      });

    expect(statusUpdateRes.status).toBe(200);
    expect(statusUpdateRes.body.data.status).toBe(APPLICATION_STATUS.SHORTLISTED);

    // Verify candidate received in-app notification for stage update
    const notificationsRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${fresherToken}`);

    expect(notificationsRes.status).toBe(200);
    expect(notificationsRes.body.data.notifications.length).toBeGreaterThanOrEqual(1);
    expect(notificationsRes.body.data.notifications[0].title).toContain('Shortlisted');
  });
});
