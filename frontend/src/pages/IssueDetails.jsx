import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getIssueByIdApi,
  updateIssueStatusApi,
  assignIssueApi,
  deleteIssueApi,
  updateIssueApi,
} from '../api/issues.api';
import { getCommentsApi, addCommentApi } from '../api/comments.api';
import { getActivitiesApi } from '../api/activity.api';
import { getUsersApi } from '../api/users.api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { CommentList } from '../components/comments/CommentList';
import { CommentForm } from '../components/comments/CommentForm';
import { ActivityTimeline } from '../components/issues/ActivityTimeline';
import { IssueForm } from '../components/issues/IssueForm';
import { formatDate, getCategoryBadgeStyle } from '../utils/formatters';
import {
  ChevronLeft,
  Trash2,
  Edit2,
  User,
  Calendar,
  CheckCircle,
  Tag,
  ShieldAlert,
  MessageSquare,
  History,
  RotateCcw,
  ZoomIn,
  X,
} from 'lucide-react';

export const IssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('comments'); // 'comments' or 'activity'

  const fetchIssueData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [issueRes, commentsRes, activitiesRes] = await Promise.all([
        getIssueByIdApi(id),
        getCommentsApi(id),
        getActivitiesApi(id),
      ]);

      setIssue(issueRes.data);
      setComments(commentsRes.data || []);
      setActivities(activitiesRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load issue details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIssueData();
  }, [fetchIssueData]);

  // Fetch users for assignment dropdown
  useEffect(() => {
    getUsersApi()
      .then((res) => setUsers(res.data || []))
      .catch((err) => console.error('Failed to load team users:', err));
  }, []);

  // Status transition handler
  const handleStatusChange = async (newStatus) => {
    if (issue.status === newStatus) return;
    setActionLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await updateIssueStatusApi(id, newStatus);
      setIssue(res.data);
      setSuccessMessage(`Status updated to ${newStatus}`);

      // Refresh activity timeline
      const actRes = await getActivitiesApi(id);
      setActivities(actRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Assignment change handler (Admin only)
  const handleAssignChange = async (newAssigneeId) => {
    setActionLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const targetId = newAssigneeId || null;
      const res = await assignIssueApi(id, targetId);
      setIssue(res.data);
      setSuccessMessage('Issue assignment updated');

      // Refresh activities
      const actRes = await getActivitiesApi(id);
      setActivities(actRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to update assignment.');
    } finally {
      setActionLoading(false);
    }
  };

  // Add Comment handler
  const handleAddComment = async (text, callback) => {
    setCommentLoading(true);
    setError('');

    try {
      const res = await addCommentApi(id, text);
      setComments((prev) => [...prev, res.data]);
      if (callback) callback();

      // Refresh activity timeline
      const actRes = await getActivitiesApi(id);
      setActivities(actRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to add comment.');
    } finally {
      setCommentLoading(false);
    }
  };

  // Edit Issue details handler
  const handleUpdateIssue = async (updates) => {
    setActionLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await updateIssueApi(id, updates);
      setIssue(res.data);
      setIsEditing(false);
      setSuccessMessage('Issue details updated successfully.');

      // Refresh activities
      const actRes = await getActivitiesApi(id);
      setActivities(actRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to update issue.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Issue handler (Admin only)
  const handleDeleteIssue = async () => {
    setActionLoading(true);
    try {
      await deleteIssueApi(id);
      navigate('/issues', { state: { message: 'Issue was successfully deleted.' } });
    } catch (err) {
      setError(err.message || 'Failed to delete issue.');
      setIsDeleteDialogOpen(false);
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20">
        <LoadingSpinner size="lg" text="Loading issue details & timeline..." />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Issue Not Found</h2>
        <p className="text-xs text-slate-500">The requested issue could not be found or has been deleted.</p>
        <Link
          to="/issues"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#5b42d6] rounded-xl hover:bg-[#4c35c2]"
        >
          Return to Issues
        </Link>
      </div>
    );
  }

  const isCreator = issue.createdBy?._id === user?._id;
  const isAssignee = issue.assignedTo?._id === user?._id;
  const canEdit = isAdmin || isCreator;
  const canChangeStatus = true; // All authenticated members can update issue status or close off issues
  const categoryStyle = getCategoryBadgeStyle(issue.category);

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          to="/issues"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Issues</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Quick 1-click Resolve or Reopen Issue */}
          {issue.status !== 'Resolved' ? (
            <button
              onClick={() => handleStatusChange('Resolved')}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
              title="Mark this issue as resolved"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mark as Resolved</span>
            </button>
          ) : (
            <button
              onClick={() => handleStatusChange('Open')}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#5b42d6] bg-[#f3f0ff] border border-[#e0d9fc] hover:bg-[#ede9fe] rounded-lg transition-colors disabled:opacity-50"
              title="Reopen this issue"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#5b42d6]" />
              <span>Reopen Issue</span>
            </button>
          )}

          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {error && <ErrorMessage message={error} />}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Grid: Left Column (Details, Comments, Activities) & Right Column (Properties Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Header & Description Card */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            {isEditing ? (
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-4">Edit Issue</h3>
                <IssueForm
                  initialValues={issue}
                  isEdit={true}
                  loading={actionLoading}
                  onSubmit={handleUpdateIssue}
                  onCancel={() => setIsEditing(false)}
                />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium border ${categoryStyle}`}
                  >
                    {issue.category}
                  </span>
                  <PriorityBadge priority={issue.priority} />
                  <StatusBadge status={issue.status} />
                  <span className="text-xs text-slate-400 font-mono">
                    #{issue._id.slice(-6).toUpperCase()}
                  </span>
                </div>

                <h1 className="text-xl font-bold text-slate-900 leading-snug">
                  {issue.title}
                </h1>

                {/* Status Switcher Quick Controls */}
                {canChangeStatus && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Status Workflow:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['Open', 'In Progress', 'Resolved'].map((st) => (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(st)}
                          disabled={actionLoading || issue.status === st}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            issue.status === st
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:border-[#5b42d6] hover:text-[#5b42d6]'
                          } disabled:cursor-default`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Description */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Description
                  </h4>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed">
                    {issue.description}
                  </div>
                </div>

                {/* Attached Screenshot / Image */}
                {issue.imageUrl && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Attached Image / Screenshot
                    </h4>
                    <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 inline-block max-w-full">
                      <img
                        src={issue.imageUrl}
                        alt={`Attachment for ${issue.title}`}
                        onClick={() => setIsImageModalOpen(true)}
                        className="max-h-80 w-auto rounded-lg object-contain cursor-pointer hover:opacity-95 transition-opacity"
                      />
                      <div
                        onClick={() => setIsImageModalOpen(true)}
                        className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-xs font-medium gap-1.5"
                      >
                        <ZoomIn className="w-4 h-4" />
                        <span>Click to expand</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Tabs for Comments and Activity Feed */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="flex items-center border-b border-slate-200 bg-slate-50/70 px-4">
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === 'comments'
                    ? 'border-[#5b42d6] text-[#5b42d6] bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Discussion ({comments.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('activity')}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === 'activity'
                    ? 'border-[#5b42d6] text-[#5b42d6] bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Audit Timeline ({activities.length})</span>
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'comments' ? (
                <div className="space-y-6">
                  <CommentList comments={comments} />
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Add to Discussion
                    </h4>
                    <CommentForm
                      onSubmit={handleAddComment}
                      loading={commentLoading}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <ActivityTimeline activities={activities} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Properties Card) */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Issue Properties
            </h3>

            {/* Assignee Section */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Assigned Team Member
              </span>
              {canEdit ? (
                <select
                  value={issue.assignedTo?._id || (typeof issue.assignedTo === 'string' ? issue.assignedTo : '') || ''}
                  onChange={(e) => handleAssignChange(e.target.value)}
                  disabled={actionLoading}
                  className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5b42d6] focus:border-[#5b42d6] transition-all"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} — {u.jobTitle || u.role}
                    </option>
                  ))}
                </select>
              ) : issue.assignedTo ? (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <img
                    src={
                      issue.assignedTo.avatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(issue.assignedTo.name)}`
                    }
                    alt={issue.assignedTo.name}
                    className="w-6 h-6 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      {issue.assignedTo.name}
                    </p>
                    <p className="text-[10px] text-slate-400 capitalize">
                      {issue.assignedTo.jobTitle
                        ? `${issue.assignedTo.jobTitle} • ${issue.assignedTo.role}`
                        : issue.assignedTo.role}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Unassigned</p>
              )}
            </div>

            {/* Reporter / Creator */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Reported By
              </span>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <img
                  src={
                    issue.createdBy?.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(issue.createdBy?.name || 'User')}`
                  }
                  alt={issue.createdBy?.name}
                  className="w-6 h-6 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {issue.createdBy?.name || 'Unknown'}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize">
                    {issue.createdBy?.jobTitle
                      ? `${issue.createdBy.jobTitle} • ${issue.createdBy?.role || 'member'}`
                      : issue.createdBy?.role || 'member'}
                  </p>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Created:
                </span>
                <span className="font-medium text-slate-800">
                  {formatDate(issue.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Updated:
                </span>
                <span className="font-medium text-slate-800">
                  {formatDate(issue.updatedAt)}
                </span>
              </div>

              {issue.resolvedAt && (
                <div className="flex items-center justify-between text-emerald-700 bg-emerald-50/80 p-2 rounded-lg border border-emerald-100">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Resolved:
                  </span>
                  <span className="font-bold">
                    {formatDate(issue.resolvedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full-size Image Preview Modal */}
      {isImageModalOpen && issue.imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <span className="text-xs font-semibold text-slate-800 truncate pr-4">
                {issue.title}
              </span>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/50 transition-colors"
                aria-label="Close image preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-slate-950/5 flex items-center justify-center overflow-auto max-h-[78vh]">
              <img
                src={issue.imageUrl}
                alt={issue.title}
                className="max-w-full max-h-[72vh] rounded-lg object-contain shadow-md"
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Deletion */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Issue Permanently?"
        message="This action will permanently remove this issue, all associated discussion comments, and audit timeline records. This cannot be undone."
        confirmText="Delete Issue"
        confirmVariant="danger"
        loading={actionLoading}
        onConfirm={handleDeleteIssue}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
};
