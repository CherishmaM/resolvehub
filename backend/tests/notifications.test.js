import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB } from './setup.js';
import { User } from '../src/models/User.js';
import { Notification } from '../src/models/Notification.js';

describe('ResolveHub Notifications API Tests (Scenario 1-7 Verification)', () => {
  setupTestDB();

  let adminUser;
  let memberUser;
  let secondMember;
  let adminToken;
  let memberToken;
  let secondMemberToken;

  beforeEach(async () => {
    const adminPasswordHash = await User.hashPassword('adminpass123');
    adminUser = await User.create({
      name: 'Cherishma',
      email: 'cherishma@resolvehub.dev',
      passwordHash: adminPasswordHash,
      role: 'admin',
      isActive: true,
    });

    const memberPasswordHash = await User.hashPassword('memberpass123');
    memberUser = await User.create({
      name: 'Bob Developer',
      email: 'bob@resolvehub.dev',
      passwordHash: memberPasswordHash,
      role: 'member',
      isActive: true,
    });

    const secondMemberPasswordHash = await User.hashPassword('secondpass123');
    secondMember = await User.create({
      name: 'Alice QA',
      email: 'alice@resolvehub.dev',
      passwordHash: secondMemberPasswordHash,
      role: 'member',
      isActive: true,
    });

    const adminLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'cherishma@resolvehub.dev', password: 'adminpass123' });
    adminToken = adminLoginRes.body.data.token;

    const memberLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'bob@resolvehub.dev', password: 'memberpass123' });
    memberToken = memberLoginRes.body.data.token;

    const secondMemberLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'alice@resolvehub.dev', password: 'secondpass123' });
    secondMemberToken = secondMemberLoginRes.body.data.token;
  });

  // Scenario 1: Create an issue assigned to Cherishma while logged in as Cherishma
  it('Scenario 1: should notify Cherishma when an issue is created and assigned to Cherishma by Cherishma', async () => {
    const issueRes = await request(app)
      .post('/api/v1/issues')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Fix Cherishma Self-Assigned Task',
        description: 'Verify self assignment notification creation flow',
        category: 'Backend',
        priority: 'High',
        assignedTo: adminUser._id,
      });

    expect(issueRes.status).toBe(201);
    const issueId = issueRes.body.data._id;

    // Cherishma (the authenticated user and assignee) MUST receive the notification
    const adminNotifs = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminNotifs.status).toBe(200);
    expect(adminNotifs.body.data.notifications).toHaveLength(1);
    expect(adminNotifs.body.data.unreadCount).toBe(1);

    const notif = adminNotifs.body.data.notifications[0];
    expect(notif.type).toBe('task_assigned');
    expect(notif.message).toBe('A task has been assigned to you: Fix Cherishma Self-Assigned Task');
    expect(notif.read).toBe(false);
    expect(notif.issueId).toBe(issueId);

    // Other users (Bob, Alice) receive "New issue raised"
    const bobNotifs = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${memberToken}`);
    expect(bobNotifs.body.data.notifications).toHaveLength(1);
    expect(bobNotifs.body.data.notifications[0].type).toBe('issue_created');
    expect(bobNotifs.body.data.notifications[0].message).toBe(
      'New issue raised: Fix Cherishma Self-Assigned Task'
    );
  });

  // Scenario 2: Create an issue assigned to another user
  it('Scenario 2: should notify the assigned user when an issue is created and assigned to another user', async () => {
    const issueRes = await request(app)
      .post('/api/v1/issues')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Fix Bob Task Bug',
        description: 'Assigned to Bob upon creation',
        category: 'Backend',
        priority: 'Critical',
        assignedTo: memberUser._id,
      });

    expect(issueRes.status).toBe(201);

    // Bob (assignee) should receive the assignment notification
    const bobNotifs = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(bobNotifs.body.data.notifications).toHaveLength(1);
    expect(bobNotifs.body.data.notifications[0].type).toBe('task_assigned');
    expect(bobNotifs.body.data.notifications[0].message).toBe(
      'A task has been assigned to you: Fix Bob Task Bug'
    );
    expect(bobNotifs.body.data.unreadCount).toBe(1);

    // Alice receives "New issue raised"
    const aliceNotifs = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${secondMemberToken}`);
    expect(aliceNotifs.body.data.notifications).toHaveLength(1);
    expect(aliceNotifs.body.data.notifications[0].type).toBe('issue_created');
    expect(aliceNotifs.body.data.notifications[0].message).toBe(
      'New issue raised: Fix Bob Task Bug'
    );

    // Cherishma (creator) receives 0 notifications
    const adminNotifs = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminNotifs.body.data.notifications).toHaveLength(0);
  });

  // Scenario 3: Create an issue with no assignee
  it('Scenario 3: should NOT create an assignment notification when an issue has no assignee', async () => {
    const issueRes = await request(app)
      .post('/api/v1/issues')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Unassigned Issue Crash',
        description: 'No assignee assigned upon creation',
        category: 'Frontend',
        priority: 'Medium',
      });

    expect(issueRes.status).toBe(201);

    // All notifications in DB should be 'issue_created', no 'task_assigned'
    const notifs = await Notification.find({ issueId: issueRes.body.data._id });
    expect(notifs.length).toBeGreaterThan(0);
    expect(notifs.every((n) => n.type === 'issue_created')).toBe(true);
    expect(notifs.some((n) => n.type === 'task_assigned')).toBe(false);

    // Creator receives 0 notifications
    const adminNotifs = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminNotifs.body.data.notifications).toHaveLength(0);
  });

  // Scenario 4: Reassign an existing issue to Cherishma
  it('Scenario 4: should notify Cherishma when an existing issue is reassigned to Cherishma', async () => {
    // 1. Bob creates unassigned issue
    const issueRes = await request(app)
      .post('/api/v1/issues')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        title: 'Payment Gateway Timeout',
        description: 'Transactions fail on callback',
        category: 'Backend',
      });

    const issueId = issueRes.body.data._id;

    // Clear Cherishma's notifications from issue creation
    await request(app)
      .patch('/api/v1/notifications/mark-all-read')
      .set('Authorization', `Bearer ${adminToken}`);

    // 2. Admin reassigns issue to Cherishma
    const assignRes = await request(app)
      .patch(`/api/v1/issues/${issueId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ assignedTo: adminUser._id });

    expect(assignRes.status).toBe(200);

    // Cherishma receives task assignment notification
    const adminNotifs = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${adminToken}`);

    const assignNotif = adminNotifs.body.data.notifications.find(
      (n) => n.type === 'task_assigned' && n.issueId === issueId
    );
    expect(assignNotif).toBeDefined();
    expect(assignNotif.message).toBe('A task has been assigned to you: Payment Gateway Timeout');
  });

  // Scenario 5: Edit an issue without changing its assignee
  it('Scenario 5: should NOT generate a notification when editing an issue without changing assignee', async () => {
    // 1. Create issue assigned to Bob
    const issueRes = await request(app)
      .post('/api/v1/issues')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Style Button Glitch',
        description: 'Padding misaligned',
        category: 'UI/UX',
        assignedTo: memberUser._id,
      });

    const issueId = issueRes.body.data._id;

    // Bob has 1 notification (task_assigned)
    let bobNotifs = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${memberToken}`);
    expect(bobNotifs.body.data.notifications).toHaveLength(1);

    // 2. Re-assign with same assignee
    await request(app)
      .patch(`/api/v1/issues/${issueId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ assignedTo: memberUser._id });

    // Bob still has only 1 notification
    bobNotifs = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${memberToken}`);
    expect(bobNotifs.body.data.notifications).toHaveLength(1);

    // 3. Edit title and priority
    await request(app)
      .patch(`/api/v1/issues/${issueId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Style Button Glitch Fixed', priority: 'Low' });

    // Bob still has only 1 notification
    bobNotifs = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${memberToken}`);
    expect(bobNotifs.body.data.notifications).toHaveLength(1);
  });

  // Scenario 6: Refresh the page and verify the notification persists
  it('Scenario 6: should persist notification and read/unread state across multiple fetches (page refreshes)', async () => {
    const issueRes = await request(app)
      .post('/api/v1/issues')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Persistent Notification Test',
        description: 'Verify persistence across fetches',
        category: 'Backend',
        assignedTo: memberUser._id,
      });

    const issueId = issueRes.body.data._id;

    // First fetch: 1 unread notification
    const res1 = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res1.body.data.unreadCount).toBe(1);
    const notifId = res1.body.data.notifications[0]._id;

    // Simulate page refresh (second fetch)
    const res2 = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res2.body.data.unreadCount).toBe(1);
    expect(res2.body.data.notifications[0]._id).toBe(notifId);

    // Mark as read
    await request(app)
      .patch(`/api/v1/notifications/${notifId}/read`)
      .set('Authorization', `Bearer ${memberToken}`);

    // Simulate page refresh after read (third fetch)
    const res3 = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res3.body.data.unreadCount).toBe(0);
    expect(res3.body.data.notifications[0].read).toBe(true);
  });

  // Scenario 7: Verify correct user receives notification and no duplicate notifications appear
  it('Scenario 7: should ensure no duplicate notifications are created even if processed multiple times', async () => {
    const issueRes = await request(app)
      .post('/api/v1/issues')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Deduplication Test Issue',
        description: 'Verify deduplication guarantee',
        category: 'Database',
        assignedTo: memberUser._id,
      });

    const issueId = issueRes.body.data._id;

    // Simulate a separate assignment handler also processing this issue immediately
    await request(app)
      .patch(`/api/v1/issues/${issueId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ assignedTo: memberUser._id });

    // Verify Bob has EXACTLY 1 task_assigned notification for this issue
    const bobNotifs = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${memberToken}`);

    const assignedNotifs = bobNotifs.body.data.notifications.filter(
      (n) => n.issueId === issueId && n.type === 'task_assigned'
    );
    expect(assignedNotifs).toHaveLength(1);
  });

  it('should generate "New discussion: [Issue title]" when a discussion comment is posted', async () => {
    const issueRes = await request(app)
      .post('/api/v1/issues')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Search indexing failure',
        description: 'Search returns stale cached records',
        category: 'Backend',
        priority: 'Medium',
      });

    const issueId = issueRes.body.data._id;

    // Member adds a comment
    const commentRes = await request(app)
      .post(`/api/v1/issues/${issueId}/comments`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ text: 'I found the query cache TTL was set too high.' });

    expect(commentRes.status).toBe(201);

    // Admin (creator) should receive: "New discussion: Search indexing failure"
    const adminNotifs = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminNotifs.status).toBe(200);
    const commentNotif = adminNotifs.body.data.notifications.find(
      (n) => n.type === 'discussion_created'
    );
    expect(commentNotif).toBeDefined();
    expect(commentNotif.message).toBe('New discussion: Search indexing failure');
    expect(commentNotif.read).toBe(false);
  });

  it('should NOT generate notifications for status changes or issue resolution', async () => {
    const issueRes = await request(app)
      .post('/api/v1/issues')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Dashboard loading error',
        description: 'Dashboard crashes on mount',
        category: 'Frontend',
      });

    const issueId = issueRes.body.data._id;

    // Clear notifications from issue creation
    await request(app)
      .patch('/api/v1/notifications/mark-all-read')
      .set('Authorization', `Bearer ${memberToken}`);

    // Member resolves the issue
    const statusRes = await request(app)
      .patch(`/api/v1/issues/${issueId}/status`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ status: 'Resolved' });

    expect(statusRes.status).toBe(200);

    // Admin should NOT receive resolution notification
    const adminNotifs = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminNotifs.status).toBe(200);
    const resolvedNotif = adminNotifs.body.data.notifications.find(
      (n) => n.type === 'issue_resolved'
    );
    expect(resolvedNotif).toBeUndefined();
  });
});
