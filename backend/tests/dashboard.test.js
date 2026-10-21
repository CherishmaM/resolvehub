import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB } from './setup.js';
import { Issue } from '../src/models/Issue.js';

describe('Dashboard Stats & Team API Tests', () => {
  setupTestDB();

  let adminToken;
  let memberUser;

  beforeEach(async () => {
    // Register user
    const memberRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Dashboard Tester',
        email: 'dashboard@example.com',
        password: 'password123',
      });
    memberUser = memberRes.body.data.user;

    // Register admin user
    const adminRegRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Dashboard Admin',
        email: 'admin_dash@example.com',
        password: 'password123',
      });

    // Promote to admin in DB
    const { User } = await import('../src/models/User.js');
    await User.findByIdAndUpdate(adminRegRes.body.data.user._id, { role: 'admin' });

    // Login admin
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin_dash@example.com',
        password: 'password123',
      });
    adminToken = loginRes.body.data.token;

    // Create 3 issues directly
    await Issue.create([
      {
        title: 'Open issue 1',
        description: 'First open issue description',
        category: 'Backend',
        priority: 'High',
        status: 'Open',
        createdBy: memberUser._id,
        assignedTo: memberUser._id,
      },
      {
        title: 'In progress issue 2',
        description: 'In progress issue description',
        category: 'Frontend',
        priority: 'Medium',
        status: 'In Progress',
        createdBy: memberUser._id,
      },
      {
        title: 'Resolved issue 3',
        description: 'Resolved issue description',
        category: 'Database',
        priority: 'Critical',
        status: 'Resolved',
        resolvedAt: new Date(),
        createdBy: memberUser._id,
      },
    ]);
  });

  it('should return accurate aggregated dashboard statistics from MongoDB', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { totals, statusDistribution, priorityDistribution, recentIssues } = res.body.data;
    expect(totals.total).toBe(3);
    expect(totals.open).toBe(1);
    expect(totals.inProgress).toBe(1);
    expect(totals.resolved).toBe(1);

    expect(statusDistribution).toBeDefined();
    expect(statusDistribution.length).toBe(3);

    expect(priorityDistribution).toBeDefined();
    expect(priorityDistribution.length).toBe(4);

    expect(recentIssues.length).toBe(3);
  });

  it('should prevent admin from changing their own role', async () => {
    const { User } = await import('../src/models/User.js');
    const adminInDb = await User.findOne({ email: 'admin_dash@example.com' });

    const res = await request(app)
      .patch(`/api/v1/users/${adminInDb._id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'member' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/cannot change their own role/i);
  });

  it('should allow admin to promote member to admin', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/${memberUser._id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin' });

    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('admin');
  });
});
