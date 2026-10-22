import mongoose from 'mongoose';

export const ISSUE_CATEGORIES = [
  'Frontend',
  'Backend',
  'Database',
  'UI/UX',
  'Feature Request',
  'DevOps',
  'QA Testing',
  'Web Development',
  'Backend API',
  'Other',
];

export const ISSUE_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export const ISSUE_STATUSES = ['Open', 'In Progress', 'Resolved'];

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Issue title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Issue description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ISSUE_CATEGORIES,
        message: 'Invalid issue category',
      },
    },
    priority: {
      type: String,
      enum: {
        values: ISSUE_PRIORITIES,
        message: 'Invalid issue priority',
      },
      default: 'Medium',
    },
    status: {
      type: String,
      enum: {
        values: ISSUE_STATUSES,
        message: 'Invalid issue status',
      },
      default: 'Open',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user reference is required'],
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
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

// Compound and lookup indexes
issueSchema.index({ status: 1, priority: 1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ title: 'text', description: 'text' });

// Pre-save hook to ensure resolvedAt is properly synchronized with status
issueSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'Resolved') {
      if (!this.resolvedAt) {
        this.resolvedAt = new Date();
      }
    } else {
      this.resolvedAt = null;
    }
  }
  next();
});

export const Issue = mongoose.model('Issue', issueSchema);
