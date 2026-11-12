import mongoose from 'mongoose';

export const PROJECT_STATUSES = ['Active', 'On Hold', 'Completed', 'Archived'];
export const PROJECT_MEMBER_ROLES = ['project_admin', 'project_member'];

const projectMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    role: {
      type: String,
      enum: {
        values: PROJECT_MEMBER_ROLES,
        message: 'Invalid project member role',
      },
      default: 'project_member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [2, 'Project name must be at least 2 characters long'],
      maxlength: [60, 'Project name cannot exceed 60 characters'],
    },
    key: {
      type: String,
      required: [true, 'Project key is required'],
      trim: true,
      uppercase: true,
      minlength: [2, 'Project key must be at least 2 characters long'],
      maxlength: [10, 'Project key cannot exceed 10 characters'],
      match: [/^[A-Z0-9_-]+$/, 'Project key must contain only uppercase letters, numbers, hyphens, or underscores'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Project description cannot exceed 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: PROJECT_STATUSES,
        message: 'Invalid project status',
      },
      default: 'Active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user reference is required'],
      index: true,
    },
    members: [projectMemberSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
projectSchema.index({ key: 1 }, { unique: true });
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ createdAt: -1 });

export const Project = mongoose.model('Project', projectSchema);
