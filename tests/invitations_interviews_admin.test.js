const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const { ROLES, INVITATION_STATUS, INTERVIEW_STATUS } = require('../src/utils/constants');

describe('Invitations, Interviews & Admin Analytics Suite', () => {
  let adminToken;
  let startupToken;
  let fresherToken;
  let fresherUserId;
  let jobId;
  let applicationId;

  beforeEach(async () => {
    // Admin
    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@corp.io',
      password: 'Password123!',
      role: ROLES.ADMIN
    });
    adminToken = adminUser.generateAuthToken();

    // Startup
    const startupRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Apex Recruiter',
        email: 'recruiter@apex.io',
        password: 'Password123!',
        role: ROLES.STARTUP,
        companyName: 'Apex Innovations'
      });
    startupToken = startupRes.body.data.token;

    // Fresher
    const fresherRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Charlie Candidate',
        email: 'charlie@example.com',
        password: 'Password123!',
        role: ROLES.FRESHER
      });
    fresherToken = fresherRes.body.data.token;
    fresherUserId = fresherRes.body.data.user.id;

    // Post Job
    const jobRes = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${startupToken}`)
      .send({
        title: 'Backend Node.js Engineer',
        description: 'Microservices & API development',
        requiredSkills: ['Node.js', 'Express', 'MongoDB'],
        location: 'Remote'
      });
    jobId = jobRes.body.data._id;

    // Add resume and apply
    await request(app)
      .put('/api/freshers/profile')
      .set('Authorization', `Bearer ${fresherToken}`)
      .send({ skills: ['Node.js', 'Express', 'MongoDB'] });

    const dummyBuffer = Buffer.from('PDF Content');
    await request(app)
      .post('/api/freshers/resume')
      .set('Authorization', `Bearer ${fresherToken}`)
      .attach('resume', dummyBuffer, 'resume.pdf');

    const appRes = await request(app)
      .post(`/api/jobs/${jobId}/apply`)
      .set('Authorization', `Bearer ${fresherToken}`)
      .send({ coverLetter: 'Excited to apply!' });
    applicationId = appRes.body.data._id;
  });

  it('should allow startup to invite candidate and candidate to accept', async () => {
    const inviteRes = await request(app)
      .post('/api/invitations')
      .set('Authorization', `Bearer ${startupToken}`)
      .send({
        fresherId: fresherUserId,
        jobId: jobId,
        message: 'We loved your GitHub repos and want to invite you.'
      });

    expect(inviteRes.status).toBe(201);
    expect(inviteRes.body.success).toBe(true);
    const invitationId = inviteRes.body.data._id;

    // Fresher accepts invitation
    const acceptRes = await request(app)
      .patch(`/api/invitations/${invitationId}/accept`)
      .set('Authorization', `Bearer ${fresherToken}`);

    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.data.status).toBe(INVITATION_STATUS.ACCEPTED);
  });

  it('should schedule and manage interview lifecycle', async () => {
    const interviewRes = await request(app)
      .post('/api/interviews')
      .set('Authorization', `Bearer ${startupToken}`)
      .send({
        applicationId,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        time: '11:00 AM EST',
        durationMinutes: 45,
        meetingLink: 'https://meet.google.com/xyz-demo-careerpilot',
        interviewType: 'TECHNICAL',
        notes: 'Review system architecture and database designs.'
      });

    expect(interviewRes.status).toBe(201);
    expect(interviewRes.body.success).toBe(true);
    expect(interviewRes.body.data.status).toBe(INTERVIEW_STATUS.SCHEDULED);
    const interviewId = interviewRes.body.data._id;

    // Fresher views scheduled interviews
    const listRes = await request(app)
      .get('/api/interviews')
      .set('Authorization', `Bearer ${fresherToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);

    // Cancel interview
    const cancelRes = await request(app)
      .delete(`/api/interviews/${interviewId}`)
      .set('Authorization', `Bearer ${startupToken}`)
      .send({ reason: 'Position filled internally' });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.status).toBe(INTERVIEW_STATUS.CANCELLED);
  });

  it('should allow admin to view platform analytics and governance tables', async () => {
    const dashRes = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(dashRes.status).toBe(200);
    expect(dashRes.body.success).toBe(true);
    expect(dashRes.body.data.metrics.totalFreshers).toBeGreaterThanOrEqual(1);
    expect(dashRes.body.data.metrics.totalStartups).toBeGreaterThanOrEqual(1);
    expect(dashRes.body.data.metrics.totalJobs).toBeGreaterThanOrEqual(1);

    // Verify non-admin gets 403 Forbidden
    const forbiddenRes = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${fresherToken}`);

    expect(forbiddenRes.status).toBe(403);
  });
});
