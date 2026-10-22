import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB } from './setup.js';
import { User } from '../src/models/User.js';

describe('Issues, Comments, & Activity API Tests', () => {
  setupTestDB();

  let adminUser;
  let memberUser;
  let adminToken;
  let memberToken;

  beforeEach(async () => {
    // Create admin directly in database
    const adminPasswordHash = await User.hashPassword('adminpass123');
    adminUser = await User.create({
      name: 'Admin Boss',
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      isActive: true,
    });

    // Create member user via register endpoint
    const memberRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Regular Member',
        email: 'member@example.com',
        password: 'memberpass123',
      });

    memberUser = memberRes.body.data.user;
    memberToken = memberRes.body.data.token;

    // Login admin to get token
    const adminLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'adminpass123',
      });
    adminToken = adminLoginRes.body.data.token;
  });

  describe('Issue CRUD', () => {
    it('should create an issue with default Open status and record Created activity', async () => {
      const res = await request(app)
        .post('/api/v1/issues')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'Fix payment button bug',
          description: 'Payment button does not trigger stripe checkout in checkout page.',
          category: 'Frontend',
          priority: 'High',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Fix payment button bug');
      expect(res.body.data.status).toBe('Open');
      expect(res.body.data.priority).toBe('High');
      expect(res.body.data.category).toBe('Frontend');
      expect(res.body.data.createdBy._id).toBe(memberUser._id);
      expect(res.body.data.imageUrl).toBeNull();

      // Check activity log was created
      const issueId = res.body.data._id;
      const actRes = await request(app)
        .get(`/api/v1/issues/${issueId}/activities`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(actRes.status).toBe(200);
      expect(actRes.body.data.length).toBeGreaterThan(0);
      expect(actRes.body.data[0].action).toBe('Created');
    });

    it('should reject issue creation with missing or short title', async () => {
      const res = await request(app)
        .post('/api/v1/issues')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'Hi', // too short (<3)
          description: 'Valid description here',
          category: 'Backend',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should retrieve issues list with pagination and search filters', async () => {
      // Create 3 issues
      await request(app)
        .post('/api/v1/issues')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'Database connection timeout',
          description: 'Postgres connection pool exhausted under load',
          category: 'Database',
          priority: 'Critical',
        });

      await request(app)
        .post('/api/v1/issues')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'Navbar responsiveness glitch',
          description: 'Mobile burger menu does not collapse on click',
          category: 'UI/UX',
          priority: 'Low',
        });

      // Search for 'database'
      const searchRes = await request(app)
        .get('/api/v1/issues?search=database')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(searchRes.status).toBe(200);
      expect(searchRes.body.data.length).toBe(1);
      expect(searchRes.body.data[0].title).toBe('Database connection timeout');

      // Filter by category UI/UX
      const filterRes = await request(app)
        .get('/api/v1/issues?category=UI/UX')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(filterRes.status).toBe(200);
      expect(filterRes.body.data.length).toBe(1);
      expect(filterRes.body.data[0].category).toBe('UI/UX');
    });
  });

  describe('Status Transitions & Assignments', () => {
    let issueId;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/v1/issues')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'Issue for testing status workflow',
          description: 'Testing transition from Open to In Progress to Resolved',
          category: 'Backend',
          priority: 'Medium',
        });
      issueId = createRes.body.data._id;
    });

    it('should transition status to In Progress and then Resolved, setting resolvedAt', async () => {
      // 1. Move to In Progress
      const inProgRes = await request(app)
        .patch(`/api/v1/issues/${issueId}/status`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ status: 'In Progress' });

      expect(inProgRes.status).toBe(200);
      expect(inProgRes.body.data.status).toBe('In Progress');
      expect(inProgRes.body.data.resolvedAt).toBeNull();

      // 2. Move to Resolved
      const resolvedRes = await request(app)
        .patch(`/api/v1/issues/${issueId}/status`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ status: 'Resolved' });

      expect(resolvedRes.status).toBe(200);
      expect(resolvedRes.body.data.status).toBe('Resolved');
      expect(resolvedRes.body.data.resolvedAt).not.toBeNull();

      // 3. Verify activity entries
      const actRes = await request(app)
        .get(`/api/v1/issues/${issueId}/activities`)
        .set('Authorization', `Bearer ${memberToken}`);

      const actions = actRes.body.data.map((a) => a.action);
      expect(actions).toContain('Status Changed');
    });

    it('should allow any team member to close off and reopen an issue created by someone else', async () => {
      // Admin creates an issue
      const adminIssueRes = await request(app)
        .post('/api/v1/issues')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Admin created server memory spike',
          description: 'Investigate memory consumption on worker nodes',
          category: 'Backend',
          priority: 'High',
        });
      const adminIssueId = adminIssueRes.body.data._id;

      // Regular member closes off the admin's issue
      const closeRes = await request(app)
        .patch(`/api/v1/issues/${adminIssueId}/status`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ status: 'Closed' });

      expect(closeRes.status).toBe(200);
      expect(closeRes.body.data.status).toBe('Closed');
      expect(closeRes.body.data.resolvedAt).not.toBeNull();

      // Regular member reopens the issue
      const reopenRes = await request(app)
        .patch(`/api/v1/issues/${adminIssueId}/status`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ status: 'Open' });

      expect(reopenRes.status).toBe(200);
      expect(reopenRes.body.data.status).toBe('Open');
      expect(reopenRes.body.data.resolvedAt).toBeNull();
    });

    it('should allow admin to assign issue and reject member from assigning', async () => {
      // Member trying to assign -> 403 Forbidden
      const memberAssignRes = await request(app)
        .patch(`/api/v1/issues/${issueId}/assign`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ assignedTo: memberUser._id });

      expect(memberAssignRes.status).toBe(403);

      // Admin assigning -> 200 OK
      const adminAssignRes = await request(app)
        .patch(`/api/v1/issues/${issueId}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ assignedTo: memberUser._id });

      expect(adminAssignRes.status).toBe(200);
      expect(adminAssignRes.body.data.assignedTo._id).toBe(memberUser._id);
    });

    it('should save assignee changes when editing an issue via PATCH /api/v1/issues/:id', async () => {
      // Admin edits the issue to change assignedTo to memberUser
      const editRes = await request(app)
        .patch(`/api/v1/issues/${issueId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Issue for testing status workflow (Updated)',
          assignedTo: memberUser._id,
        });

      expect(editRes.status).toBe(200);
      expect(editRes.body.data.assignedTo).toBeDefined();
      expect(editRes.body.data.assignedTo._id).toBe(memberUser._id);
      expect(editRes.body.data.assignedTo.name).toBe(memberUser.name);

      // Verify persistence by fetching directly from DB
      const getRes = await request(app)
        .get(`/api/v1/issues/${issueId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.assignedTo._id).toBe(memberUser._id);

      // Admin edits again to unassign (null)
      const unassignRes = await request(app)
        .patch(`/api/v1/issues/${issueId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          assignedTo: null,
        });

      expect(unassignRes.status).toBe(200);
      expect(unassignRes.body.data.assignedTo).toBeNull();

      // Creator member edits the issue they created to set assignee
      const creatorEditRes = await request(app)
        .patch(`/api/v1/issues/${issueId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'Issue for testing status workflow (Updated by creator)',
          assignedTo: adminUser._id,
        });

      expect(creatorEditRes.status).toBe(200);
      expect(creatorEditRes.body.data.assignedTo._id).toBe(adminUser._id.toString());
    });

    it('should forbid regular member from deleting an issue, but permit admin', async () => {
      // Member attempting deletion -> 403
      const memberDelRes = await request(app)
        .delete(`/api/v1/issues/${issueId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(memberDelRes.status).toBe(403);

      // Admin deletion -> 200
      const adminDelRes = await request(app)
        .delete(`/api/v1/issues/${issueId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminDelRes.status).toBe(200);

      // Verify it's gone
      const getRes = await request(app)
        .get(`/api/v1/issues/${issueId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getRes.status).toBe(404);
    });
  });

  describe('Comments API', () => {
    it('should add comment and retrieve comment thread', async () => {
      const issueRes = await request(app)
        .post('/api/v1/issues')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'Comment thread test issue',
          description: 'Testing comment flow and timeline',
          category: 'Other',
        });
      const issueId = issueRes.body.data._id;

      // Add comment
      const commentRes = await request(app)
        .post(`/api/v1/issues/${issueId}/comments`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ text: 'I am investigating this issue right now.' });

      expect(commentRes.status).toBe(201);
      expect(commentRes.body.data.text).toBe('I am investigating this issue right now.');
      expect(commentRes.body.data.userId._id).toBe(memberUser._id);

      // Fetch comments
      const getCommentsRes = await request(app)
        .get(`/api/v1/issues/${issueId}/comments`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(getCommentsRes.status).toBe(200);
      expect(getCommentsRes.body.data.length).toBe(1);
      expect(getCommentsRes.body.data[0].text).toBe('I am investigating this issue right now.');
    });
  });
});
