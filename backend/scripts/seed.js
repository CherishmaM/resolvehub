import mongoose from 'mongoose';
import { env, validateEnv } from '../src/config/env.js';
import { User } from '../src/models/User.js';
import { Issue } from '../src/models/Issue.js';
import { Comment } from '../src/models/Comment.js';
import { Activity } from '../src/models/Activity.js';

const seedDatabase = async () => {
  // Guard: Never run in production!
  if (env.NODE_ENV === 'production') {
    console.error('⛔ [CRITICAL SAFETY CHECK] Seeding script is strictly prohibited in production!');
    process.exit(1);
  }

  validateEnv();

  console.log(`\n🌱 [SEED] Connecting to MongoDB: ${env.MONGODB_URI}...`);
  await mongoose.connect(env.MONGODB_URI);

  console.log('🧹 [SEED] Clearing existing records for clean demo environment...');
  await Promise.all([
    User.deleteMany({}),
    Issue.deleteMany({}),
    Comment.deleteMany({}),
    Activity.deleteMany({}),
  ]);

  console.log('👤 [SEED] Creating demo users...');
  const adminPasswordHash = await User.hashPassword('Admin123!');
  const memberPasswordHash = await User.hashPassword('Member123!');

  const admin = await User.create({
    name: 'Alex Rivera (Admin)',
    email: 'admin@fixflow.dev',
    passwordHash: adminPasswordHash,
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isActive: true,
  });

  const member1 = await User.create({
    name: 'Sarah Chen (Lead Dev)',
    email: 'sarah@fixflow.dev',
    passwordHash: memberPasswordHash,
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    isActive: true,
  });

  const member2 = await User.create({
    name: 'Marcus Vance (UI/UX)',
    email: 'marcus@fixflow.dev',
    passwordHash: memberPasswordHash,
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isActive: true,
  });

  const member3 = await User.create({
    name: 'Elena Rostova (Backend)',
    email: 'elena@fixflow.dev',
    passwordHash: memberPasswordHash,
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    isActive: true,
  });

  console.log('📝 [SEED] Creating 12 varied issues across categories and priorities...');
  const issuesData = [
    {
      title: 'Stripe webhook verification failure during checkout',
      description: 'Signatures fail verification on production edge routes causing duplicate charges on checkout.',
      category: 'Backend',
      priority: 'Critical',
      status: 'Open',
      createdBy: member1._id,
      assignedTo: member3._id,
    },
    {
      title: 'PostgreSQL connection pool exhaustion during peak hours',
      description: 'Active connections spike to 100% capacity due to unclosed client sessions in report exports.',
      category: 'Database',
      priority: 'High',
      status: 'In Progress',
      createdBy: member3._id,
      assignedTo: member3._id,
    },
    {
      title: 'Mobile navigation menu overflow on iOS Safari',
      description: 'The sidebar drawer cuts off navigation pills on iPhone 14/15 viewports when scrolled down.',
      category: 'UI/UX',
      priority: 'Medium',
      status: 'In Progress',
      createdBy: member2._id,
      assignedTo: member2._id,
    },
    {
      title: 'Add CSV / PDF export feature for monthly sprint audit',
      description: 'Project managers need an automated report export summarizing resolved issues per team member.',
      category: 'Feature Request',
      priority: 'Low',
      status: 'Open',
      createdBy: admin._id,
      assignedTo: null,
    },
    {
      title: 'Memory leak in real-time notification socket listener',
      description: 'Disconnect events do not clean up socket event listeners, consuming 400MB RAM within 4 hours.',
      category: 'Backend',
      priority: 'Critical',
      status: 'In Progress',
      createdBy: member1._id,
      assignedTo: member1._id,
    },
    {
      title: 'Contrast ratio failure on secondary buttons in dark mode',
      description: 'Gray text on dark slate buttons fails WCAG AA standards with only 2.8:1 contrast ratio.',
      category: 'UI/UX',
      priority: 'Medium',
      status: 'Resolved',
      resolvedAt: new Date(Date.now() - 86400000 * 2),
      createdBy: member2._id,
      assignedTo: member2._id,
    },
    {
      title: 'Slow indexing on composite queries in issues collection',
      description: 'Queries filtering by status + priority take 1.2s without the compound index.',
      category: 'Database',
      priority: 'High',
      status: 'Resolved',
      resolvedAt: new Date(Date.now() - 86400000 * 4),
      createdBy: member3._id,
      assignedTo: member3._id,
    },
    {
      title: 'OAuth2 Google sign-in redirect URL mismatch in staging',
      description: 'Redirect URI in Google Cloud Console needs staging.fixflow.dev added to authorized origins.',
      category: 'Frontend',
      priority: 'High',
      status: 'Open',
      createdBy: member1._id,
      assignedTo: admin._id,
    },
    {
      title: 'Implement Dark / Light theme toggle in Settings',
      description: 'Allow users to store their preferred color scheme in localStorage and user profile.',
      category: 'Feature Request',
      priority: 'Low',
      status: 'Open',
      createdBy: member2._id,
      assignedTo: member2._id,
    },
    {
      title: 'Missing input sanitization in comment textarea',
      description: 'Raw HTML tags are not stripped when comments are rendered in client DOM.',
      category: 'Frontend',
      priority: 'Critical',
      status: 'Resolved',
      resolvedAt: new Date(Date.now() - 86400000 * 1),
      createdBy: admin._id,
      assignedTo: member1._id,
    },
    {
      title: 'Deadlock during bulk status update transactions',
      description: 'Simultaneous status transitions on related parent/child issues cause lock timeouts.',
      category: 'Database',
      priority: 'High',
      status: 'In Progress',
      createdBy: member3._id,
      assignedTo: member3._id,
    },
    {
      title: 'Upgrade Node.js dependencies to address high security CVEs',
      description: 'Audit report shows outdated npm packages that need minor version upgrades.',
      category: 'Other',
      priority: 'Medium',
      status: 'Resolved',
      resolvedAt: new Date(Date.now() - 86400000 * 3),
      createdBy: admin._id,
      assignedTo: admin._id,
    },
  ];

  const createdIssues = [];
  for (const data of issuesData) {
    const issue = await Issue.create(data);
    createdIssues.push(issue);

    // Create Created activity
    await Activity.create({
      issueId: issue._id,
      actorId: issue.createdBy,
      action: 'Created',
      details: {
        title: issue.title,
        category: issue.category,
        priority: issue.priority,
      },
      createdAt: new Date(Date.now() - 86400000 * 5),
    });

    if (issue.status === 'In Progress' || issue.status === 'Resolved') {
      await Activity.create({
        issueId: issue._id,
        actorId: issue.assignedTo || issue.createdBy,
        action: 'Status Changed',
        details: { fromStatus: 'Open', toStatus: 'In Progress' },
        createdAt: new Date(Date.now() - 86400000 * 3),
      });
    }

    if (issue.status === 'Resolved') {
      await Activity.create({
        issueId: issue._id,
        actorId: issue.assignedTo || issue.createdBy,
        action: 'Status Changed',
        details: { fromStatus: 'In Progress', toStatus: 'Resolved' },
        createdAt: issue.resolvedAt || new Date(),
      });
    }
  }

  console.log('💬 [SEED] Adding demo comments...');
  const sampleComments = [
    {
      issueId: createdIssues[0]._id,
      userId: member3._id,
      text: 'I reviewed the Stripe logs. Looks like the webhook signing secret was rotated yesterday in Doppler.',
    },
    {
      issueId: createdIssues[0]._id,
      userId: admin._id,
      text: 'Thanks Elena! I updated the production env secret. Running a dry-run test transaction now.',
    },
    {
      issueId: createdIssues[1]._id,
      userId: member1._id,
      text: 'Good catch on the unclosed cursor in generateMonthlyReport(). I am adding an explicit finally block.',
    },
    {
      issueId: createdIssues[2]._id,
      userId: member2._id,
      text: 'Fixed with flex-col overflow-y-auto and touch-manipulation CSS classes. Verified on physical device.',
    },
  ];

  for (const c of sampleComments) {
    const comment = await Comment.create(c);
    await Activity.create({
      issueId: c.issueId,
      actorId: c.userId,
      action: 'Comment Added',
      details: { commentId: comment._id },
    });
  }

  console.log('\n✅ [SEED COMPLETE] Successfully populated database!');
  console.log('----------------------------------------------------');
  console.log('🔑 DEMO CREDENTIALS FOR TESTING:');
  console.log('   Admin:  admin@fixflow.dev  /  Admin123!');
  console.log('   Member: sarah@fixflow.dev  /  Member123!');
  console.log('   Member: marcus@fixflow.dev /  Member123!');
  console.log('   Member: elena@fixflow.dev  /  Member123!');
  console.log('----------------------------------------------------\n');

  await mongoose.disconnect();
  process.exit(0);
};

seedDatabase().catch((err) => {
  console.error('[SEED ERROR]', err);
  process.exit(1);
});
