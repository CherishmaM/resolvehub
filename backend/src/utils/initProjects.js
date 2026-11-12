import { Project } from '../models/Project.js';
import { Issue } from '../models/Issue.js';
import { User } from '../models/User.js';

/**
 * Initializes default projects if none exist and backfills existing issues without a projectId.
 */
export const initializeProjects = async () => {
  try {
    const projectCount = await Project.countDocuments();
    let defaultProject = null;

    if (projectCount === 0) {
      // Find an admin user to be the creator
      const adminUser = (await User.findOne({ role: 'admin' })) || (await User.findOne());
      if (!adminUser) {
        console.log('[PROJECT INIT] No users found yet; skipping project bootstrap.');
        return;
      }

      // Collect all existing active users as members
      const allUsers = await User.find({ isActive: true });
      const members = allUsers.map((u) => ({
        user: u._id,
        role: u.role === 'admin' ? 'project_admin' : 'project_member',
        joinedAt: new Date(),
      }));

      defaultProject = await Project.create({
        name: 'Core Platform',
        key: 'CORE',
        description: 'Primary engineering workspace for Core Platform features, bugs, and tasks.',
        status: 'Active',
        createdBy: adminUser._id,
        members,
      });

      console.log(`[PROJECT INIT] Created default project: "${defaultProject.name}" (${defaultProject.key}) with ${members.length} members.`);
    } else {
      defaultProject = await Project.findOne().sort({ createdAt: 1 });
    }

    if (defaultProject) {
      // Backfill any issues missing projectId
      const unassignedIssues = await Issue.countDocuments({
        $or: [{ projectId: { $exists: false } }, { projectId: null }],
      });

      if (unassignedIssues > 0) {
        await Issue.updateMany(
          { $or: [{ projectId: { $exists: false } }, { projectId: null }] },
          { $set: { projectId: defaultProject._id } }
        );
        console.log(`[PROJECT INIT] Backfilled ${unassignedIssues} legacy issues with projectId: ${defaultProject._id}`);
      }
    }
  } catch (error) {
    console.error('[PROJECT INIT] Error initializing projects:', error.message);
  }
};
