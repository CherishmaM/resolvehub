import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import {
  getProjectByIdApi,
  getProjectStatsApi,
  updateProjectApi,
  deleteProjectApi,
  addProjectMemberApi,
  updateProjectMemberRoleApi,
  removeProjectMemberApi,
} from '../api/projects.api';
import { getIssuesApi } from '../api/issues.api';
import { getUsersApi } from '../api/users.api';
import { IssueTable } from '../components/issues/IssueTable';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { UserAvatar } from '../components/ui/UserAvatar';
import { formatRelativeTime } from '../utils/formatters';
import {
  FolderKanban,
  Users,
  CheckSquare,
  Settings,
  Plus,
  Shield,
  Trash2,
  X,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Lock,
  UserPlus,
  Sparkles,
} from 'lucide-react';

export const ProjectDetails = () => {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const { currentProjectId, setCurrentProject, refreshProjects } = useProject();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [stats, setStats] = useState(null);
  const [issues, setIssues] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('issues'); // 'issues' | 'members' | 'settings'

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);

  // Add Member State
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedMemberRole, setSelectedMemberRole] = useState('project_member');
  const [addingMember, setAddingMember] = useState(false);

  // Settings Edit State
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    status: 'Active',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Member Action State
  const [pendingRemoveMember, setPendingRemoveMember] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProjectData = useCallback(async () => {
    setLoading(true);
    setError('');
    setAccessDenied(false);

    try {
      const [projRes, statsRes, issuesRes, usersRes] = await Promise.all([
        getProjectByIdApi(id),
        getProjectStatsApi(id).catch(() => ({ data: null })),
        getIssuesApi({ projectId: id, limit: 30 }),
        getUsersApi().catch(() => ({ data: [] })),
      ]);

      setProject(projRes.data);
      setEditForm({
        name: projRes.data.name,
        description: projRes.data.description || '',
        status: projRes.data.status || 'Active',
      });
      if (statsRes.data) setStats(statsRes.data);
      setIssues(issuesRes.data || []);
      setAllUsers(usersRes.data || []);
    } catch (err) {
      if (err.statusCode === 403 || err.status === 403) {
        setAccessDenied(true);
      } else {
        setError(err.message || 'Failed to load project details.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  const canManage = Boolean(
    isAdmin || (project && project.currentUserRole === 'project_admin')
  );

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setAddingMember(true);
    setError('');
    try {
      await addProjectMemberApi(id, {
        userId: selectedUserId,
        role: selectedMemberRole,
      });

      setSuccessMessage('Member successfully added to this project team!');
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsAddMemberOpen(false);
      setSelectedUserId('');
      setSelectedMemberRole('project_member');
      await fetchProjectData();
      await refreshProjects();
    } catch (err) {
      setError(err.message || 'Failed to add member to project.');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRoleChange = async (targetUserId, newRole) => {
    try {
      await updateProjectMemberRoleApi(id, targetUserId, newRole);
      setSuccessMessage('Project role updated.');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchProjectData();
      await refreshProjects();
    } catch (err) {
      setError(err.message || 'Failed to update member role.');
    }
  };

  const confirmRemoveMember = async () => {
    if (!pendingRemoveMember) return;
    setActionLoading(true);
    try {
      await removeProjectMemberApi(id, pendingRemoveMember._id || pendingRemoveMember.user?._id || pendingRemoveMember.user);
      setSuccessMessage('Member removed from this project.');
      setTimeout(() => setSuccessMessage(''), 3500);
      setPendingRemoveMember(null);
      await fetchProjectData();
      await refreshProjects();
    } catch (err) {
      setError(err.message || 'Failed to remove member.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setError('');
    try {
      await updateProjectApi(id, editForm);
      setSuccessMessage('Project settings saved successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await fetchProjectData();
      await refreshProjects();
    } catch (err) {
      setError(err.message || 'Failed to update project settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'On Hold':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Archived':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner size="lg" text="Loading project workspace..." />
      </div>
    );
  }

  // Access Denied Fallback for unauthorized URLs
  if (accessDenied) {
    return (
      <div className="max-w-xl mx-auto py-16 px-6 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          You are not an assigned member of this project workspace. ResolveHub enforces project-level role-based isolation to safeguard tickets and data.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/projects"
            className="px-4 py-2 text-xs font-semibold text-white bg-[#6257D9] hover:bg-[#5246c7] rounded-xl shadow-xs transition-all"
          >
            View Accessible Projects
          </Link>
          <Link
            to="/dashboard"
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return <ErrorMessage message="Project not found or was removed." />;
  }

  const totals = stats?.totals || { total: issues.length, open: 0, inProgress: 0, resolved: 0, memberCount: project.members?.length || 0 };
  const existingMemberIds = (project.members || []).map((m) => (m.user?._id || m.user).toString());
  const eligibleUsers = allUsers.filter((u) => !existingMemberIds.includes(u._id.toString()));

  const isActiveWorkspace = currentProjectId === project._id;

  return (
    <div className="space-y-6 animate-fade-up max-w-7xl mx-auto pb-12">
      {/* 1. Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#6257D9] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Projects</span>
        </Link>

        {!isActiveWorkspace ? (
          <button
            type="button"
            onClick={() => {
              setCurrentProject(project);
              setSuccessMessage(`Set "${project.name}" as your active workspace!`);
              setTimeout(() => setSuccessMessage(''), 3000);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#6257D9] bg-[#F0EBFF] hover:bg-[#E4DCFF] rounded-xl transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Set Active Workspace</span>
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active Workspace</span>
          </span>
        )}
      </div>

      {/* 2. Project Header Banner */}
      <div className="bg-white rounded-3xl border border-[#EAE5F7] p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-xl bg-[#F0EBFF] text-[#6257D9] border border-[#E3D9FF]">
                {project.key}
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {project.name}
              </h1>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${getStatusBadge(project.status)}`}>
                {project.status}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              {project.description || 'Dedicated project workspace for team issues and collaboration.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/issues/new?project=${project._id}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#6257D9] hover:bg-[#5246c7] text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>New Ticket</span>
            </Link>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="bg-[#FAF9FF] p-3 rounded-2xl border border-slate-100">
            <span className="text-[11px] text-slate-400 font-medium">Total Tickets</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{totals.total}</p>
          </div>
          <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100/60">
            <span className="text-[11px] text-amber-600 font-medium">Open Issues</span>
            <p className="text-xl font-bold text-amber-700 mt-0.5">{totals.open}</p>
          </div>
          <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-100/60">
            <span className="text-[11px] text-purple-600 font-medium">In Progress</span>
            <p className="text-xl font-bold text-purple-700 mt-0.5">{totals.inProgress}</p>
          </div>
          <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/60">
            <span className="text-[11px] text-emerald-600 font-medium">Resolved</span>
            <p className="text-xl font-bold text-emerald-700 mt-0.5">{totals.resolved}</p>
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

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#EAE5F7] pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('issues')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-2xl transition-all ${
            activeTab === 'issues'
              ? 'bg-[#6257D9] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Project Issues ({issues.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-2xl transition-all ${
            activeTab === 'members'
              ? 'bg-[#6257D9] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Members ({project.members?.length || 0})</span>
        </button>

        {canManage && (
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-2xl transition-all ${
              activeTab === 'settings'
                ? 'bg-[#6257D9] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Workspace Settings</span>
          </button>
        )}
      </div>

      {/* TAB 1: ISSUES */}
      {activeTab === 'issues' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Assigned Tickets for {project.name}
            </h3>
            <span className="text-xs text-slate-400">
              Only project members have access to these tickets
            </span>
          </div>

          <IssueTable
            issues={issues}
            loading={false}
            onStatusChange={fetchProjectData}
          />
        </div>
      )}

      {/* TAB 2: MEMBERS */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-3xl border border-[#EAE5F7] p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Project Team Roster</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Members assigned to this project have access to its issues, comments, tasks, and activities
              </p>
            </div>

            {canManage && eligibleUsers.length > 0 && (
              <button
                type="button"
                onClick={() => setIsAddMemberOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#6257D9] hover:bg-[#5246c7] rounded-xl shadow-xs transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            )}
          </div>

          {/* Members List Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-1">Member</th>
                  <th className="pb-3">Project Role</th>
                  <th className="pb-3">Organization Role</th>
                  <th className="pb-3">Joined</th>
                  {canManage && <th className="pb-3 text-right pr-2">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {project.members?.map((member) => {
                  const mUser = member.user;
                  const isTargetAdmin = member.role === 'project_admin';
                  const isCurrentLoggedUser = (mUser?._id || mUser) === user?._id;

                  return (
                    <tr key={mUser?._id || member._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 pl-1">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={mUser?.name || 'Member'}
                            avatar={mUser?.avatar}
                            size="md"
                          />
                          <div>
                            <p className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{mUser?.name || 'Team Member'}</span>
                              {isCurrentLoggedUser && (
                                <span className="text-[10px] bg-[#EDE9FE] text-[#6257D9] px-1.5 py-0.2 rounded font-semibold">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-400">{mUser?.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5">
                        {canManage && !isCurrentLoggedUser ? (
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(mUser._id, e.target.value)}
                            className="text-xs py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6257D9]/20"
                          >
                            <option value="project_member">Project Member</option>
                            <option value="project_admin">Project Admin</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border ${
                              isTargetAdmin
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            <Shield className="w-3 h-3" />
                            <span>{isTargetAdmin ? 'Project Admin' : 'Project Member'}</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 text-slate-600">
                        <span className="capitalize">{mUser?.role === 'admin' ? 'Organization Admin' : 'Member'}</span>
                      </td>

                      <td className="py-3.5 text-slate-400 text-[11px]">
                        {formatRelativeTime(member.joinedAt)}
                      </td>

                      {canManage && (
                        <td className="py-3.5 text-right pr-2">
                          {!isCurrentLoggedUser ? (
                            <button
                              type="button"
                              onClick={() => setPendingRemoveMember(mUser)}
                              className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                              title="Remove from project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-300 italic">Owner</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SETTINGS */}
      {activeTab === 'settings' && canManage && (
        <div className="bg-white rounded-3xl border border-[#EAE5F7] p-6 shadow-2xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Project Configuration</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Update project details, status, or workspace parameters
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                maxLength={60}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6257D9]/20 focus:border-[#6257D9] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Key (Fixed)
              </label>
              <input
                type="text"
                value={project.key}
                disabled
                className="w-full px-3.5 py-2.5 text-xs font-mono font-bold bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                maxLength={500}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6257D9]/20 focus:border-[#6257D9] transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Workspace Status
              </label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6257D9]/20 focus:border-[#6257D9] transition-all"
              >
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#6257D9] hover:bg-[#5246c7] rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddMemberOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsAddMemberOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#EAE5F7] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F0EBFF] text-[#6257D9] flex items-center justify-center">
                  <UserPlus className="w-4 h-4 stroke-[2]" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Add Team Member</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddMemberOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select User from Organization
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6257D9]/20"
                >
                  <option value="">-- Choose a user --</option>
                  {eligibleUsers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email}) - {u.jobTitle || u.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Role
                </label>
                <select
                  value={selectedMemberRole}
                  onChange={(e) => setSelectedMemberRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6257D9]/20"
                >
                  <option value="project_member">Project Member (View, Create & Update Issues)</option>
                  <option value="project_admin">Project Admin (Manage Members & Settings)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingMember || !selectedUserId}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#6257D9] hover:bg-[#5246c7] rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  {addingMember ? 'Adding...' : 'Add to Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation */}
      <ConfirmDialog
        isOpen={!!pendingRemoveMember}
        title="Remove Member from Project?"
        message={`Are you sure you want to remove ${pendingRemoveMember?.name} from "${project.name}"? They will lose access to all issues, comments, and activities in this project workspace.`}
        confirmText="Remove Member"
        confirmVariant="danger"
        loading={actionLoading}
        onConfirm={confirmRemoveMember}
        onClose={() => setPendingRemoveMember(null)}
      />
    </div>
  );
};
