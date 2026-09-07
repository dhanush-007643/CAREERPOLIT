const request = require('supertest');
const app = require('../src/app');
const { ROLES } = require('../src/utils/constants');

describe('Authentication & Authorization API Suite', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new FRESHER successfully and return token and profile', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'Password123!',
          role: ROLES.FRESHER,
          location: 'Seattle, WA'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('jane@example.com');
      expect(res.body.data.user.role).toBe(ROLES.FRESHER);
      expect(res.body.data.profile).toBeDefined();
      expect(res.body.data.profile.fullName).toBe('Jane Doe');
    });

    it('should register a new STARTUP successfully and create company entity', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Elon Recruiter',
          email: 'elon@spacex-demo.com',
          password: 'Password123!',
          role: ROLES.STARTUP,
          companyName: 'SpaceX Labs',
          industry: 'Aerospace',
          location: 'Hawthorne, CA'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe(ROLES.STARTUP);
      expect(res.body.data.profile.companyName).toBe('SpaceX Labs');
    });

    it('should reject registration with duplicate email address', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User 1',
          email: 'duplicate@example.com',
          password: 'Password123!',
          role: ROLES.FRESHER
        });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User 2',
          email: 'duplicate@example.com',
          password: 'Password123!',
          role: ROLES.FRESHER
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('should reject invalid input payload with 422 validation error', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'A',
          email: 'invalid-email',
          password: '123'
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Login User',
          email: 'login@example.com',
          password: 'Password123!',
          role: ROLES.FRESHER
        });
    });

    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('login@example.com');
    });

    it('should reject invalid password with 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should retrieve currently authenticated user profile', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Profile Owner',
          email: 'owner@example.com',
          password: 'Password123!',
          role: ROLES.FRESHER
        });

      const token = reg.body.data.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('owner@example.com');
    });

    it('should return 401 when token is missing', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
