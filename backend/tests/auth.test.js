import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB } from './setup.js';
import { User } from '../src/models/User.js';

describe('Authentication API Tests', () => {
  setupTestDB();

  const mockUser = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
  };

  describe('POST /api/v1/auth/register', () => {
    it('should register a new member successfully with hashed password and return cookie', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(mockUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(mockUser.email);
      expect(res.body.data.user.name).toBe(mockUser.name);
      expect(res.body.data.user.role).toBe('member'); // Self-registration must always be member
      expect(res.body.data.user.passwordHash).toBeUndefined(); // Never returned

      // Verify cookie is set
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.includes('fixflow_token'))).toBe(true);

      // Verify database record
      const dbUser = await User.findOne({ email: mockUser.email }).select('+passwordHash');
      expect(dbUser).toBeTruthy();
      expect(dbUser.passwordHash).not.toBe(mockUser.password);
      expect(await dbUser.comparePassword(mockUser.password)).toBe(true);
    });

    it('should reject client-submitted role escalation during registration', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...mockUser,
          email: 'escalation@example.com',
          role: 'admin', // Attempted role escalation
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('member'); // Forcefully member
    });

    it('should reject duplicate email registration with 409 conflict', async () => {
      await request(app).post('/api/v1/auth/register').send(mockUser);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(mockUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should reject invalid registration data with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: '',
          email: 'not-an-email',
          password: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(mockUser);
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: mockUser.email,
          password: mockUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(mockUser.email);
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: mockUser.email,
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject login for non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'ghost@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me & Logout', () => {
    let authCookie;

    beforeEach(async () => {
      const regRes = await request(app).post('/api/v1/auth/register').send(mockUser);
      authCookie = regRes.headers['set-cookie'];
    });

    it('should return current user when authenticated with cookie', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(mockUser.email);
    });

    it('should reject unauthenticated request to /auth/me with 401', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should clear cookie on logout', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      const cookies = res.headers['set-cookie'];
      expect(cookies.some((c) => c.includes('fixflow_token=;'))).toBe(true);
    });
  });
});
