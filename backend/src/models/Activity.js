import mongoose from 'mongoose';

export const ACTIVITY_ACTIONS = [
  'Created',
  'Assigned',
  'Status Changed',
  'Priority Changed',
  'Updated',
  'Comment Added',
];

const activitySchema = new mongoose.Schema(
  {
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: [true, 'Issue ID is required'],
      index: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Actor ID is required'],
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: {
        values: ACTIVITY_ACTIONS,
        message: 'Invalid activity action',
      },
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

activitySchema.index({ issueId: 1, createdAt: -1 });

export const Activity = mongoose.model('Activity', activitySchema);
