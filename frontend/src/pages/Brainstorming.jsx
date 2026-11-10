import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getIdeasApi,
  getIdeaStatsApi,
  deleteIdeaApi,
  toggleUpvoteApi,
  updateStageApi,
  addIdeaCommentApi,
  deleteIdeaCommentApi,
  convertIdeaToIssueApi,
} from '../api/ideas.api';
import { UserAvatar } from '../components/ui/UserAvatar';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { formatRelativeTime } from '../utils/formatters';
import {
  Lightbulb,
  ArrowBigUp,
  MessageSquare,
  Search,
  CheckCircle2,
  Trash2,
  Send,
  X,
  Rocket,
  Flame,
  CheckSquare,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Feature Proposal',
  'UI/UX Enhancement',
  'Architecture & Performance',
  'Developer Tooling',
  'Workflow & Automation',
  'General Innovation',
];

const STAGES = [
  'All',
  'Exploring',
  'Under Review',
  'Planned',
  'Converted',
  'Archived',
];

export const Brainstorming = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Data states
  const [ideas, setIdeas] = useState([]);
  const [stats, setStats] = useState({
    totalIdeas: 0,
    exploringCount: 0,
    plannedCount: 0,
    totalUpvotes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filtering, search, and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'recent' | 'discussed'

  // Action confirmation states
  const [pendingDeleteIdea, setPendingDeleteIdea] = useState(null);
  const [pendingConvertIdea, setPendingConvertIdea] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Expanded discussion comments trackers
  const [expandedDiscussionId, setExpandedDiscussionId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [submittingCommentFor, setSubmittingCommentFor] = useState(null);

  // Expanded description tracker
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  // Fetch ideas list
  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        stage: selectedStage !== 'All' ? selectedStage : undefined,
        sort: sortBy,
        search: searchQuery.trim() || undefined,
        limit: 50,
      };

      const [ideasRes, statsRes] = await Promise.all([
        getIdeasApi(params),
        getIdeaStatsApi(),
      ]);

      setIdeas(ideasRes.data || []);
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load brainstorming ideas.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedStage, sortBy, searchQuery]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  // Handle Upvoting with optimistic state
  const handleToggleUpvote = async (ideaId) => {
    // Optimistic UI update
    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea._id === ideaId) {
          const wasUpvoted = idea.isUpvotedByMe;
          const nextCount = wasUpvoted
            ? Math.max(0, (idea.upvoteCount || 1) - 1)
            : (idea.upvoteCount || 0) + 1;
          return {
            ...idea,
            isUpvotedByMe: !wasUpvoted,
            upvoteCount: nextCount,
          };
        }
        return idea;
      })
    );

    try {
      const res = await toggleUpvoteApi(ideaId);
      const { upvoteCount, isUpvotedByMe } = res.data;
      setIdeas((prev) =>
        prev.map((idea) =>
          idea._id === ideaId ? { ...idea, upvoteCount, isUpvotedByMe } : idea
        )
      );
      // Refresh stats in background
      getIdeaStatsApi().then((r) => r.data && setStats(r.data));
    } catch (err) {
      // Revert upon error
      fetchIdeas();
    }
  };

  // Handle Stage Change
  const handleStageChange = async (ideaId, newStage) => {
    try {
      await updateStageApi(ideaId, newStage);
      setIdeas((prev) =>
        prev.map((idea) =>
          idea._id === ideaId ? { ...idea, stage: newStage } : idea
        )
      );
      setSuccessMessage(`Updated idea stage to "${newStage}"`);
      setTimeout(() => setSuccessMessage(''), 4000);
      getIdeaStatsApi().then((r) => r.data && setStats(r.data));
    } catch (err) {
      setError(err.message || 'Failed to update idea stage.');
    }
  };

  // Handle Delete Idea
  const confirmDelete = async () => {
    if (!pendingDeleteIdea) return;
    setActionLoading(true);
    try {
      await deleteIdeaApi(pendingDeleteIdea._id);
      setIdeas((prev) => prev.filter((i) => i._id !== pendingDeleteIdea._id));
      setSuccessMessage('Idea was removed.');
      setTimeout(() => setSuccessMessage(''), 4000);
      getIdeaStatsApi().then((r) => r.data && setStats(r.data));
    } catch (err) {
      setError(err.message || 'Failed to delete idea.');
    } finally {
      setActionLoading(false);
      setPendingDeleteIdea(null);
    }
  };

  // Handle Convert Idea to Bug Tracker Issue
  const confirmConvert = async () => {
    if (!pendingConvertIdea) return;
    setActionLoading(true);
    try {
      const res = await convertIdeaToIssueApi(pendingConvertIdea._id);
      const { issue } = res.data;
      setSuccessMessage(
        `🎉 Successfully converted idea into Bug Tracker issue: "${issue.title}"!`
      );
      setTimeout(() => setSuccessMessage(''), 5000);
      fetchIdeas();
    } catch (err) {
      setError(err.message || 'Failed to convert idea to issue.');
    } finally {
      setActionLoading(false);
      setPendingConvertIdea(null);
    }
  };

  // Handle Comment Submission
  const handleAddComment = async (ideaId) => {
    const text = (commentInputs[ideaId] || '').trim();
    if (!text) return;

    setSubmittingCommentFor(ideaId);
    try {
      const res = await addIdeaCommentApi(ideaId, text);
      const updatedComments = res.data;

      setIdeas((prev) =>
        prev.map((idea) =>
          idea._id === ideaId ? { ...idea, comments: updatedComments } : idea
        )
      );

      setCommentInputs((prev) => ({ ...prev, [ideaId]: '' }));
    } catch (err) {
      setError(err.message || 'Failed to post comment.');
    } finally {
      setSubmittingCommentFor(null);
    }
  };

  // Handle Comment Deletion
  const handleDeleteComment = async (ideaId, commentId) => {
    try {
      await deleteIdeaCommentApi(ideaId, commentId);
      setIdeas((prev) =>
        prev.map((idea) => {
          if (idea._id === ideaId) {
            return {
              ...idea,
              comments: idea.comments.filter((c) => c._id !== commentId),
            };
          }
          return idea;
        })
      );
    } catch (err) {
      setError(err.message || 'Failed to delete comment.');
    }
  };

  // Helper for stage styling
  const getStageBadge = (stage) => {
    switch (stage) {
      case 'Exploring':
        return {
          label: 'Exploring',
          style: 'bg-[#F0EBFF] text-[#6257D9] border-[#E3D9FF]',
          dot: 'bg-[#6257D9] animate-pulse',
        };
      case 'Under Review':
        return {
          label: 'Under Review',
          style: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'Planned':
        return {
          label: 'Planned',
          style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'Converted':
        return {
          label: 'Converted to Ticket',
          style: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
        };
      case 'Archived':
      default:
        return {
          label: 'Archived',
          style: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  // Helper for impact styling
  const getImpactBadge = (impact) => {
    switch (impact) {
      case 'Moonshot':
        return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200';
      case 'High':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'Medium':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Low':
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-up max-w-7xl mx-auto pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6257D9]/20 to-[#a78bfa]/25 text-[#6257D9] flex items-center justify-center shadow-xs">
              <Lightbulb className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Brainstorming Ideas
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#ede9fe] text-[#6257D9] px-2 py-0.5 rounded-md border border-[#ddd6fe]">
                  Collaborative Hub
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Explore creative thoughts, vote on upcoming features, and brainstorm before filing issues
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && <ErrorMessage message={error} />}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-medium flex items-center gap-2.5 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 2. Quick Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#EAE5F7] shadow-2xs hover:shadow-subtle transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-600">Total Ideas</span>
            <Lightbulb className="w-4 h-4 text-[#6257D9]" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalIdeas}</p>
          <span className="text-[11px] text-slate-400">Team innovations</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#EAE5F7] shadow-2xs hover:shadow-subtle transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-600">Exploring</span>
            <MessageSquare className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.exploringCount}</p>
          <span className="text-[11px] text-purple-600 font-medium">Open for discussion</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#EAE5F7] shadow-2xs hover:shadow-subtle transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-600">Planned</span>
            <Rocket className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.plannedCount}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Queued for roadmap</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#EAE5F7] shadow-2xs hover:shadow-subtle transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-600">Community Upvotes</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalUpvotes}</p>
          <span className="text-[11px] text-slate-400">Team endorsements</span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-[#EAE5F7] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts, features, tags, proposals..."
              className="w-full pl-9 pr-8 py-2.5 text-xs bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6257D9]/20 focus:border-[#6257D9] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Stage Dropdown */}
          <div className="w-full sm:w-44">
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full py-2.5 px-3 text-xs bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6257D9]/20 focus:border-[#6257D9] transition-all font-medium"
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Stages' : s}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div className="w-full sm:w-44">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2.5 px-3 text-xs bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6257D9]/20 focus:border-[#6257D9] transition-all font-medium"
            >
              <option value="popular">🔥 Most Upvoted</option>
              <option value="recent">⚡ Newest First</option>
              <option value="discussed">💬 Most Discussed</option>
            </select>
          </div>
        </div>

        {/* Category Horizontal Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-xl whitespace-nowrap transition-all font-medium ${
                  active
                    ? 'bg-[#6257D9] text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/70'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Idea Cards List */}
      {loading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" text="Loading brainstorming ideas..." />
        </div>
      ) : ideas.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EAE5F7] p-12 text-center shadow-2xs">
          <div className="w-16 h-16 rounded-3xl bg-[#F0EBFF] text-[#6257D9] flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Lightbulb className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No ideas found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {searchQuery || selectedCategory !== 'All' || selectedStage !== 'All'
              ? 'Try adjusting your search criteria or category filter.'
              : 'No brainstorming ideas recorded yet. Ideas shared by team members will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {ideas.map((idea) => {
            const stageInfo = getStageBadge(idea.stage);
            const isAuthor = idea.createdBy?._id === user?._id;
            const canManage = isAuthor || isAdmin;
            const isExpandedDesc = !!expandedDescriptions[idea._id];
            const isDiscussionOpen = expandedDiscussionId === idea._id;
            const comments = idea.comments || [];

            return (
              <div
                key={idea._id}
                className="bg-white rounded-3xl border border-[#EAE5F7] hover:border-[#D6CCF7] shadow-2xs hover:shadow-subtle transition-all duration-200 overflow-hidden"
              >
                <div className="p-5 sm:p-6 flex flex-col md:flex-row items-start gap-4 sm:gap-5">
                  {/* Upvote Box */}
                  <button
                    type="button"
                    onClick={() => handleToggleUpvote(idea._id)}
                    className={`flex md:flex-col items-center justify-center gap-1.5 px-3 py-2 md:py-3.5 md:w-16 rounded-2xl border transition-all duration-200 active:scale-95 shrink-0 ${
                      idea.isUpvotedByMe
                        ? 'bg-[#6257D9] text-white border-[#6257D9] shadow-md shadow-[#6257D9]/25'
                        : 'bg-slate-50/80 hover:bg-[#F0EBFF] hover:border-[#E3D9FF] text-slate-600 hover:text-[#6257D9] border-slate-200/80'
                    }`}
                    title={idea.isUpvotedByMe ? 'Remove your upvote' : 'Upvote this idea'}
                  >
                    <ArrowBigUp
                      className={`w-5 h-5 transition-transform ${
                        idea.isUpvotedByMe ? 'fill-current scale-110' : ''
                      }`}
                    />
                    <span className="text-xs font-bold font-mono">
                      {idea.upvoteCount || 0}
                    </span>
                  </button>

                  {/* Main Content Area */}
                  <div className="flex-1 w-full space-y-2.5">
                    {/* Top Row: Category, Stage, Impact & Converted Alert */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold text-[#6257D9] bg-[#F0EBFF] border border-[#E3D9FF] px-2.5 py-0.5 rounded-lg">
                        {idea.category}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-medium border px-2.5 py-0.5 rounded-lg ${stageInfo.style}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${stageInfo.dot}`} />
                        <span>{stageInfo.label}</span>
                      </span>

                      {idea.impact && (
                        <span
                          className={`text-[10px] font-medium border px-2 py-0.5 rounded-lg ${getImpactBadge(
                            idea.impact
                          )}`}
                        >
                          Impact: {idea.impact}
                        </span>
                      )}

                      {idea.convertedIssueId && (
                        <Link
                          to={`/issues/${idea.convertedIssueId}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-2.5 py-0.5 rounded-lg transition-colors ml-auto"
                        >
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>View in Bug Tracker ➔</span>
                        </Link>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-bold text-[#20212B] leading-snug">
                      {idea.title}
                    </h3>

                    {/* Description */}
                    <div className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed whitespace-pre-line">
                      {isExpandedDesc || idea.description.length <= 220
                        ? idea.description
                        : `${idea.description.slice(0, 220)}... `}
                      {idea.description.length > 220 && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedDescriptions((prev) => ({
                              ...prev,
                              [idea._id]: !prev[idea._id],
                            }))
                          }
                          className="text-[#6257D9] font-medium hover:underline text-xs ml-1 inline-flex items-center gap-0.5"
                        >
                          <span>{isExpandedDesc ? 'Show less' : 'Read more'}</span>
                        </button>
                      )}
                    </div>

                    {/* Tags */}
                    {idea.tags && idea.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {idea.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] bg-slate-100/90 hover:bg-slate-200/80 text-slate-600 px-2 py-0.5 rounded-md font-mono"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer Row: Author & Action Buttons */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                      {/* Author Info */}
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          name={idea.createdBy?.name || 'Member'}
                          title={idea.createdBy?.jobTitle || idea.createdBy?.role}
                          avatar={idea.createdBy?.avatar}
                          size="sm"
                        />
                        <div className="text-xs">
                          <span className="font-semibold text-slate-800">
                            {idea.createdBy?.name || 'Teammate'}
                          </span>
                          <span className="text-slate-400 text-[11px] ml-1.5">
                            {formatRelativeTime(idea.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Right actions */}
                      <div className="flex items-center gap-2 ml-auto">
                        {/* Discussion toggle */}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedDiscussionId(
                              isDiscussionOpen ? null : idea._id
                            )
                          }
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            isDiscussionOpen
                              ? 'bg-[#F0EBFF] text-[#6257D9] border-[#E3D9FF]'
                              : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#6257D9]" />
                          <span>
                            {comments.length > 0
                              ? `${comments.length} Comments`
                              : 'Discuss'}
                          </span>
                        </button>

                        {/* Stage Selector (Admin or Author) */}
                        {canManage && (
                          <select
                            value={idea.stage}
                            onChange={(e) =>
                              handleStageChange(idea._id, e.target.value)
                            }
                            className="text-xs py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none"
                          >
                            <option value="Exploring">Exploring</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Planned">Planned</option>
                            <option value="Archived">Archived</option>
                          </select>
                        )}

                        {/* Convert to Issue (Admin) */}
                        {isAdmin && !idea.convertedIssueId && (
                          <button
                            type="button"
                            onClick={() => setPendingConvertIdea(idea)}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-[#ede9fe] hover:bg-[#ddd6fe] text-[#5b42d6] font-semibold rounded-xl border border-[#c4b5fd] transition-colors"
                            title="Convert this approved idea into a tracked issue in the Bug Tracker"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Convert to Ticket</span>
                          </button>
                        )}

                        {/* Delete */}
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => setPendingDeleteIdea(idea)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Delete this idea"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Inline Discussion Thread */}
                {isDiscussionOpen && (
                  <div className="bg-[#FAF9FF] border-t border-[#EAE5F7] p-5 sm:p-6 space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-[#6257D9]" />
                        <span>Team Brainstorm Discussion ({comments.length})</span>
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        Share thoughts or suggest improvements
                      </span>
                    </div>

                    {/* Comments list */}
                    {comments.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">
                        No comments yet. Start the brainstorming conversation!
                      </p>
                    ) : (
                      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                        {comments.map((comment) => {
                          const isCommentAuthor =
                            comment.user?._id === user?._id;
                          const canDeleteComment =
                            isCommentAuthor || isAuthor || isAdmin;

                          return (
                            <div
                              key={comment._id}
                              className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs flex items-start justify-between gap-3 text-xs"
                            >
                              <div className="flex items-start gap-2.5 flex-1">
                                <UserAvatar
                                  name={comment.user?.name || 'Teammate'}
                                  title={comment.user?.jobTitle}
                                  avatar={comment.user?.avatar}
                                  size="sm"
                                />
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-900">
                                      {comment.user?.name || 'Team Member'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-normal">
                                      {formatRelativeTime(comment.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-slate-600 leading-normal whitespace-pre-wrap">
                                    {comment.text}
                                  </p>
                                </div>
                              </div>

                              {canDeleteComment && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteComment(idea._id, comment._id)
                                  }
                                  className="text-slate-300 hover:text-rose-500 p-1 rounded-lg transition-colors shrink-0"
                                  title="Delete comment"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* New Comment Input */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={commentInputs[idea._id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [idea._id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment(idea._id);
                          }
                        }}
                        placeholder="Add to the brainstorm... (press Enter to send)"
                        className="flex-1 px-4 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6257D9]/20 focus:border-[#6257D9] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComment(idea._id)}
                        disabled={
                          submittingCommentFor === idea._id ||
                          !(commentInputs[idea._id] || '').trim()
                        }
                        className="px-3.5 py-2 bg-[#6257D9] hover:bg-[#5246c7] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog for Delete */}
      <ConfirmDialog
        isOpen={!!pendingDeleteIdea}
        title="Remove Brainstorming Idea?"
        message={`Are you sure you want to delete the idea "${pendingDeleteIdea?.title}"? This will also remove associated discussion comments.`}
        confirmText="Delete Idea"
        confirmVariant="danger"
        loading={actionLoading}
        onConfirm={confirmDelete}
        onClose={() => setPendingDeleteIdea(null)}
      />

      {/* Confirmation Dialog for Converting Idea to Issue */}
      <ConfirmDialog
        isOpen={!!pendingConvertIdea}
        title="Convert Idea to Tracked Issue?"
        message={`Do you want to convert "${pendingConvertIdea?.title}" into a live ticket in the Bug Tracker? This will create an open Feature Request ticket and mark the idea as Converted.`}
        confirmText="Convert to Issue"
        confirmVariant="primary"
        loading={actionLoading}
        onConfirm={confirmConvert}
        onClose={() => setPendingConvertIdea(null)}
      />
    </div>
  );
};
