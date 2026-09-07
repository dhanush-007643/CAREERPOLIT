const request = require('supertest');
const app = require('../src/app');
const { ROLES, WORK_MODE, EMPLOYMENT_TYPE } = require('../src/utils/constants');

describe('Company Management & Job Search API Suite', () => {
  let startupToken;
  let fresherToken;
  let companyId;

  beforeEach(async () => {
    const startupRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Apex Recruiter',
        email: 'recruiter@apexcloud.io',
        password: 'Password123!',
        role: ROLES.STARTUP,
        companyName: 'Apex Cloud Systems',
        industry: 'Cloud Computing',
        location: 'Austin, TX'
      });
    startupToken = startupRes.body.data.token;
    companyId = startupRes.body.data.profile._id;

    const fresherRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Sam Fresher',
        email: 'sam@example.com',
        password: 'Password123!',
        role: ROLES.FRESHER
      });
    fresherToken = fresherRes.body.data.token;
  });

  it('should allow startup to update company profile', async () => {
    const res = await request(app)
      .put(`/api/companies/${companyId}`)
      .set('Authorization', `Bearer ${startupToken}`)
      .send({
        aboutCompany: 'Leading hyper-scale serverless cloud provider.',
        companySize: '51-200'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.aboutCompany).toContain('serverless');
  });

  it('should prevent fresher from updating company profile (403 Forbidden)', async () => {
    const res = await request(app)
      .put(`/api/companies/${companyId}`)
      .set('Authorization', `Bearer ${fresherToken}`)
      .send({
        aboutCompany: 'Hacked description'
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should allow fresher to follow and unfollow a company', async () => {
    // Follow
    const followRes = await request(app)
      .post(`/api/companies/${companyId}/follow`)
      .set('Authorization', `Bearer ${fresherToken}`);

    expect(followRes.status).toBe(200);
    expect(followRes.body.success).toBe(true);

    // Cannot follow twice
    const duplicateFollowRes = await request(app)
      .post(`/api/companies/${companyId}/follow`)
      .set('Authorization', `Bearer ${fresherToken}`);

    expect(duplicateFollowRes.status).toBe(409);

    // Unfollow
    const unfollowRes = await request(app)
      .delete(`/api/companies/${companyId}/follow`)
      .set('Authorization', `Bearer ${fresherToken}`);

    expect(unfollowRes.status).toBe(200);
    expect(unfollowRes.body.success).toBe(true);
  });

  it('should post a new job and support multi-filter search and pagination', async () => {
    // Post Job
    const postJobRes = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${startupToken}`)
      .send({
        title: 'Junior React Developer',
        description: 'Build cutting edge web interfaces.',
        requiredSkills: ['React', 'JavaScript', 'CSS3'],
        preferredSkills: ['TypeScript'],
        location: 'Austin, TX',
        workMode: WORK_MODE.HYBRID,
        employmentType: EMPLOYMENT_TYPE.FULL_TIME,
        salaryRange: { min: 70000, max: 90000 }
      });

    expect(postJobRes.status).toBe(201);
    expect(postJobRes.body.success).toBe(true);
    const jobId = postJobRes.body.data._id;

    // Search Job by query
    const searchRes = await request(app)
      .get('/api/jobs?search=React&location=Austin&workMode=HYBRID');

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.success).toBe(true);
    expect(searchRes.body.data.length).toBeGreaterThanOrEqual(1);
    expect(searchRes.body.pagination.total).toBeGreaterThanOrEqual(1);

    // Get single job details
    const singleJobRes = await request(app).get(`/api/jobs/${jobId}`);
    expect(singleJobRes.status).toBe(200);
    expect(singleJobRes.body.data.title).toBe('Junior React Developer');
  });
});
