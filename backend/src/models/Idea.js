import mongoose from 'mongoose';

export const IDEA_CATEGORIES = [
  'Feature Proposal',
  'UI/UX Enhancement',
  'Architecture & Performance',
  'Developer Tooling',
  'Workflow & Automation',
  'General Innovation',
];

export const IDEA_STAGES = [
  'Exploring',
  'Under Review',
  'Planned',
  'Converted',
  'Archived',
];

export const IDEA_IMPACTS = ['Low', 'Medium', 'High', 'Moonshot'];

const ideaCommentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const ideaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Idea title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [140, 'Title cannot exceed 140 characters'],
    },
    description: {
      type: String,
      required: [true, 'Idea description is required'],
      trim: true,
      maxlength: [4000, 'Description cannot exceed 4000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: IDEA_CATEGORIES,
        message: 'Invalid idea category',
      },
      default: 'Feature Proposal',
    },
    stage: {
      type: String,
      enum: {
        values: IDEA_STAGES,
        message: 'Invalid idea stage',
      },
      default: 'Exploring',
    },
    impact: {
      type: String,
      enum: {
        values: IDEA_IMPACTS,
        message: 'Invalid idea impact',
      },
      default: 'Medium',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user reference is required'],
      index: true,
    },
    comments: [ideaCommentSchema],
    convertedIssueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
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

// Indexes for fast lookup, filtering, and text search
ideaSchema.index({ stage: 1, category: 1 });
ideaSchema.index({ createdAt: -1 });
ideaSchema.index({ title: 'text', description: 'text' });

export const Idea = mongoose.model('Idea', ideaSchema);
