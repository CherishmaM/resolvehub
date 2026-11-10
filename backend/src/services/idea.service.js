import mongoose from 'mongoose';
import { Idea } from '../models/Idea.js';
import { Issue } from '../models/Issue.js';
import { Activity } from '../models/Activity.js';
import { ApiError } from '../utils/apiError.js';

export const getIdeas = async ({
  search,
  category,
  stage,
  sort = 'popular',
  page = 1,
  limit = 20,
  currentUserId,
}) => {
  const match = {};

  if (category && category !== 'all') {
    match.category = category;
  }

  if (stage && stage !== 'all') {
    match.stage = stage;
  }

  if (search && search.trim()) {
    const s = search.trim();
    match.$or = [
      { title: { $regex: s, $options: 'i' } },
      { description: { $regex: s, $options: 'i' } },
      { tags: { $in: [new RegExp(s, 'i')] } },
    ];
  }

  let sortStage = { upvoteCount: -1, createdAt: -1 };
  if (sort === 'recent') {
    sortStage = { createdAt: -1 };
  } else if (sort === 'discussed') {
    sortStage = { commentCount: -1, createdAt: -1 };
  }

  const skip = (page - 1) * limit;

  const pipeline = [
    { $match: match },
    {
      $addFields: {
        upvoteCount: { $size: { $ifNull: ['$upvotes', []] } },
        commentCount: { $size: { $ifNull: ['$comments', []] } },
      },
    },
    { $sort: sortStage },
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: 'users',
              localField: 'createdBy',
              foreignField: '_id',
              as: 'createdBy',
              pipeline: [
                {
                  $project: {
                    name: 1,
                    email: 1,
                    role: 1,
                    jobTitle: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          { $unwind: '$createdBy' },
          {
            $lookup: {
              from: 'users',
              localField: 'comments.userId',
              foreignField: '_id',
              as: 'commentUsers',
              pipeline: [
                {
                  $project: {
                    name: 1,
                    email: 1,
                    role: 1,
                    jobTitle: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ];

  const results = await Idea.aggregate(pipeline);
  const total = results[0]?.metadata[0]?.total || 0;
  const rawList = results[0]?.data || [];

  const uidStr = currentUserId ? currentUserId.toString() : null;

  const ideas = rawList.map((doc) => {
    // Populate comment user objects from commentUsers lookup array
    const userMap = new Map();
    (doc.commentUsers || []).forEach((u) => {
      userMap.set(u._id.toString(), u);
    });

    const populatedComments = (doc.comments || []).map((c) => ({
      _id: c._id,
      text: c.text,
      createdAt: c.createdAt,
      user: userMap.get(c.userId?.toString()) || {
        _id: c.userId,
        name: 'Team Member',
      },
    }));

    delete doc.commentUsers;

    return {
      ...doc,
      comments: populatedComments,
      isUpvotedByMe: uidStr
        ? (doc.upvotes || []).some((u) => u.toString() === uidStr)
        : false,
    };
  });

  return {
    ideas,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getIdeaStats = async () => {
  const stats = await Idea.aggregate([
    {
      $group: {
        _id: null,
        totalIdeas: { $sum: 1 },
        exploringCount: {
          $sum: { $cond: [{ $eq: ['$stage', 'Exploring'] }, 1, 0] },
        },
        plannedCount: {
          $sum: { $cond: [{ $eq: ['$stage', 'Planned'] }, 1, 0] },
        },
        totalUpvotes: {
          $sum: { $size: { $ifNull: ['$upvotes', []] } },
        },
      },
    },
  ]);

  if (!stats.length) {
    return {
      totalIdeas: 0,
      exploringCount: 0,
      plannedCount: 0,
      totalUpvotes: 0,
    };
  }

  const { totalIdeas, exploringCount, plannedCount, totalUpvotes } = stats[0];
  return {
    totalIdeas,
    exploringCount,
    plannedCount,
    totalUpvotes,
  };
};

export const createIdea = async ({
  title,
  description,
  category,
  impact,
  tags = [],
  imageUrl = null,
  createdBy,
}) => {
  const idea = await Idea.create({
    title,
    description,
    category,
    impact,
    tags,
    imageUrl: imageUrl || null,
    createdBy,
    upvotes: [createdBy], // Creator automatically upvotes their idea
  });

  return Idea.findById(idea._id)
    .populate('createdBy', 'name email role jobTitle avatar')
    .lean();
};

export const getIdeaById = async (id, currentUserId) => {
  const idea = await Idea.findById(id)
    .populate('createdBy', 'name email role jobTitle avatar')
    .populate('comments.userId', 'name email role jobTitle avatar')
    .lean();

  if (!idea) {
    throw ApiError.notFound('Brainstorming idea not found');
  }

  const uidStr = currentUserId ? currentUserId.toString() : null;
  return {
    ...idea,
    upvoteCount: (idea.upvotes || []).length,
    isUpvotedByMe: uidStr
      ? (idea.upvotes || []).some((u) => u.toString() === uidStr)
      : false,
    comments: (idea.comments || []).map((c) => ({
      _id: c._id,
      text: c.text,
      createdAt: c.createdAt,
      user: c.userId || { name: 'Team Member' },
    })),
  };
};

export const toggleUpvote = async (id, userId) => {
  const idea = await Idea.findById(id);
  if (!idea) {
    throw ApiError.notFound('Idea not found');
  }

  const uidStr = userId.toString();
  const upvoteIndex = idea.upvotes.findIndex((u) => u.toString() === uidStr);

  let isUpvotedByMe = false;
  if (upvoteIndex > -1) {
    idea.upvotes.splice(upvoteIndex, 1);
    isUpvotedByMe = false;
  } else {
    idea.upvotes.push(userId);
    isUpvotedByMe = true;
  }

  await idea.save();

  return {
    _id: idea._id,
    upvoteCount: idea.upvotes.length,
    isUpvotedByMe,
  };
};

export const updateStage = async (id, stage, user) => {
  const idea = await Idea.findById(id);
  if (!idea) {
    throw ApiError.notFound('Idea not found');
  }

  idea.stage = stage;
  await idea.save();

  return Idea.findById(idea._id)
    .populate('createdBy', 'name email role jobTitle avatar')
    .populate('comments.userId', 'name email role jobTitle avatar')
    .lean();
};

export const updateIdea = async (id, updateData, user) => {
  const idea = await Idea.findById(id);
  if (!idea) {
    throw ApiError.notFound('Idea not found');
  }

  const isOwner = idea.createdBy.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('Only the idea author or an administrator can edit this idea');
  }

  Object.assign(idea, updateData);
  await idea.save();

  return Idea.findById(idea._id)
    .populate('createdBy', 'name email role jobTitle avatar')
    .lean();
};

export const deleteIdea = async (id, user) => {
  const idea = await Idea.findById(id);
  if (!idea) {
    throw ApiError.notFound('Idea not found');
  }

  const isOwner = idea.createdBy.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('Only the idea author or an administrator can delete this idea');
  }

  await Idea.findByIdAndDelete(id);
  return { message: 'Idea successfully deleted' };
};

export const addComment = async (id, { userId, text }) => {
  const idea = await Idea.findById(id);
  if (!idea) {
    throw ApiError.notFound('Idea not found');
  }

  idea.comments.push({
    userId,
    text: text.trim(),
    createdAt: new Date(),
  });

  await idea.save();

  const updated = await Idea.findById(id)
    .populate('comments.userId', 'name email role jobTitle avatar')
    .lean();

  const formattedComments = (updated.comments || []).map((c) => ({
    _id: c._id,
    text: c.text,
    createdAt: c.createdAt,
    user: c.userId || { name: 'Team Member' },
  }));

  return formattedComments;
};

export const deleteComment = async (id, commentId, user) => {
  const idea = await Idea.findById(id);
  if (!idea) {
    throw ApiError.notFound('Idea not found');
  }

  const comment = idea.comments.id(commentId);
  if (!comment) {
    throw ApiError.notFound('Comment not found');
  }

  const isCommentAuthor = comment.userId.toString() === user._id.toString();
  const isIdeaAuthor = idea.createdBy.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';

  if (!isCommentAuthor && !isIdeaAuthor && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to delete this comment');
  }

  idea.comments.pull(commentId);
  await idea.save();

  return { message: 'Comment removed successfully' };
};

export const convertToIssue = async (id, user) => {
  const idea = await Idea.findById(id);
  if (!idea) {
    throw ApiError.notFound('Idea not found');
  }

  // Priority mapping from idea impact
  let priority = 'Medium';
  if (idea.impact === 'Moonshot' || idea.impact === 'High') {
    priority = 'High';
  } else if (idea.impact === 'Low') {
    priority = 'Low';
  }

  // Create issue in Bug Tracker
  const issue = await Issue.create({
    title: idea.title,
    description: `${idea.description}\n\n---\n*💡 Converted from Brainstorming Idea: "${idea.title}"*`,
    category: 'Feature Request',
    priority,
    status: 'Open',
    imageUrl: idea.imageUrl || null,
    createdBy: user._id,
  });

  // Update idea stage & reference
  idea.stage = 'Converted';
  idea.convertedIssueId = issue._id;
  await idea.save();

  // Create activity log
  await Activity.create({
    issueId: issue._id,
    actorId: user._id,
    action: 'Created',
    details: {
      message: `Issue converted from Brainstorming Idea "${idea.title}"`,
    },
  });

  return {
    idea,
    issue,
  };
};
