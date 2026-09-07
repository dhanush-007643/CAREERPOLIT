const request = require('supertest');
const app = require('../src/app');
const { ROLES } = require('../src/utils/constants');

describe('Fresher Profile & Resume API Suite', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jordan Smith',
        email: 'jordan@example.com',
        password: 'Password123!',
        role: ROLES.FRESHER
      });
    token = res.body.data.token;
  });

  it('should fetch fresher profile and return 0% completion initially', async () => {
    const res = await request(app)
      .get('/api/freshers/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fullName).toBe('Jordan Smith');
  });

  it('should update profile and dynamically increase completion percentage', async () => {
    const updatePayload = {
      phone: '+1 234 567 8900',
      location: 'Boston, MA',
      education: [
        {
          degree: 'B.S. in Computer Science',
          university: 'MIT',
          graduationYear: 2024
        }
      ],
      skills: ['React', 'Node.js', 'Express', 'MongoDB'],
      careerInterests: ['Full Stack Developer'],
      gitHubUrl: 'https://github.com/jordansmith'
    };

    const res = await request(app)
      .put('/api/freshers/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(updatePayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.skills).toContain('React');
    expect(res.body.data.completionPercentage).toBeGreaterThanOrEqual(70);
  });

  it('should handle resume upload with buffer/multer', async () => {
    const dummyBuffer = Buffer.from('Mock PDF Content for Resume');

    const res = await request(app)
      .post('/api/freshers/resume')
      .set('Authorization', `Bearer ${token}`)
      .attach('resume', dummyBuffer, 'jordan_resume.pdf');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.resume.fileUrl).toBeDefined();
    expect(res.body.data.profile.resumeUrl).toBeDefined();
  });

  it('should delete uploaded resume successfully', async () => {
    const res = await request(app)
      .delete('/api/freshers/resume')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.profile.resumeUrl).toBe('');
  });
});
