import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { getProjectsApi, createProjectApi, deleteProjectApi } from '../api/projects.api';
import { getUsersApi } from '../api/users.api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { UserAvatar } from '../components/ui/UserAvatar';
import { formatRelativeTime } from '../utils/formatters';
import {
  FolderKanban,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Shield,
  ArrowRight,
  Trash2,
  X,
  Search,
  ExternalLink,
  Lock,
} from 'lucide-react';

export const Projects = () => {
  const { user, isAdmin } = useAuth();
  const { setCurrentProject, refreshProjects } = useProject();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Project Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    key: '',
    description: '',
    status: 'Active',
    initialMemberIds: [],
  });

  // Delete Confirmation State
  const [pendingDeleteProject, setPendingDeleteProject] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProjectsData = async () => {
    setLoading(true);
    setError('');
    try {
      const [projRes, usersRes] = await Promise.all([
        getProjectsApi(),
        getUsersApi().catch(() => ({ data: [] })),
      ]);
      setProjects(projRes.data || []);
      setAllUsers(usersRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsData();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.key.trim()) return;

    setCreating(true);
    setError('');
    try {
      const res = await createProjectApi({
        name: createForm.name.trim(),
        key: createForm.key.trim().toUpperCase(),
        description: createForm.description.trim(),
        status: createForm.status,
        initialMemberIds: createForm.initialMemberIds,
      });

      setSuccessMessage(`🎉 Project "${res.data.name}" (${res.data.key}) created successfully!`);
      setTimeout(() => setSuccessMessage(''), 4500);

      setCreateForm({
        name: '',
        key: '',
        description: '',
        status: 'Active',
        initialMemberIds: [],
      });
      setIsCreateOpen(false);

      await fetchProjectsData();
      await refreshProjects();
    } catch (err) {
      setError(err.message || 'Failed to create project.');
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDeleteProject) return;
    setActionLoading(true);
    try {
      await deleteProjectApi(pendingDeleteProject._id);
      setSuccessMessage(`Project "${pendingDeleteProject.name}" was deleted.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      setPendingDeleteProject(null);
      await fetchProjectsData();
      await refreshProjects();
    } catch (err) {
      setError(err.message || 'Failed to delete project.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnterProject = (project) => {
    setCurrentProject(project);
    navigate(`/projects/${project._id}`);
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

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-up max-w-7xl mx-auto pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#6257D9]/20 to-[#a78bfa]/25 text-[#6257D9] flex items-center justify-center shadow-xs">
            <FolderKanban className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Projects & Workspaces
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#ede9fe] text-[#6257D9] px-2 py-0.5 rounded-md border border-[#ddd6fe]">
                Multi-Project Hub
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Isolated project workspaces with role-based access control, dedicated issue boards, and team assignments
            </p>
          </div>
        </div>

        {/* Create Project Button (Org Admins) */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#6257D9] hover:bg-[#5246c7] text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {error && <ErrorMessage message={error} />}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-medium flex items-center gap-2.5 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-3xl border border-[#EAE5F7] shadow-2xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name, key, or description..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6257D9]/20 focus:border-[#6257D9] transition-all"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium px-2">
          {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} accessible
        </div>
      </div>

      {/* 2. Projects Grid */}
      {loading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" text="Loading workspaces..." />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EAE5F7] p-12 text-center shadow-2xs">
          <div className="w-16 h-16 rounded-3xl bg-[#F0EBFF] text-[#6257D9] flex items-center justify-center mx-auto mb-4 shadow-xs">
            <FolderKanban className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No projects found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {searchQuery
              ? 'No projects match your search query.'
              : 'You are currently not assigned to any projects. Contact your Organization Administrator to get added to a project team.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const stats = project.issueStats || { total: 0, open: 0, inProgress: 0, resolved: 0 };
            const members = project.members || [];
            const canManage = isAdmin || project.currentUserRole === 'project_admin';

            return (
              <div
                key={project._id}
                className="bg-white rounded-3xl border border-[#EAE5F7] hover:border-[#D6CCF7] shadow-2xs hover:shadow-subtle transition-all duration-200 flex flex-col overflow-hidden group"
              >
                {/* Card Top: Key Badge & Status */}
                <div className="p-5 pb-3 border-b border-slate-100/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-xl bg-[#F0EBFF] text-[#6257D9] border border-[#E3D9FF]">
                      {project.key}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${getStatusBadge(project.status)}`}>
                      {project.status}
                    </span>
                  </div>

                  {/* Role Chip */}
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/70">
                    <Shield className="w-3 h-3 text-[#6257D9]" />
                    <span>
                      {project.currentUserRole === 'org_admin'
                        ? 'Org Admin'
                        : project.currentUserRole === 'project_admin'
                        ? 'Project Lead'
                        : 'Member'}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#6257D9] transition-colors leading-snug">
                      {project.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {project.description || 'No description provided for this project workspace.'}
                    </p>
                  </div>

                  {/* Metrics Badges */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="bg-[#FAF9FF] p-2 rounded-2xl border border-slate-100">
                      <p className="text-sm font-bold text-slate-900">{stats.total}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Tickets</p>
                    </div>
                    <div className="bg-amber-50/50 p-2 rounded-2xl border border-amber-100/60">
                      <p className="text-sm font-bold text-amber-700">{stats.open}</p>
                      <p className="text-[10px] text-amber-600 font-medium">Open</p>
                    </div>
                    <div className="bg-emerald-50/50 p-2 rounded-2xl border border-emerald-100/60">
                      <p className="text-sm font-bold text-emerald-700">{stats.resolved}</p>
                      <p className="text-[10px] text-emerald-600 font-medium">Resolved</p>
                    </div>
                  </div>

                  {/* Team Members Stack */}
                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center -space-x-2 overflow-hidden">
                      {members.slice(0, 4).map((m, idx) => (
                        <div key={idx} className="inline-block ring-2 ring-white rounded-full">
                          <UserAvatar
                            name={m.user?.name || 'Member'}
                            avatar={m.user?.avatar}
                            size="sm"
                          />
                        </div>
                      ))}
                      {members.length > 4 && (
                        <div className="w-7 h-7 rounded-full bg-[#EDE9FE] text-[#6257D9] flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                          +{members.length - 4}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {members.length} {members.length === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                </div>

                {/* Card Footer: Action */}
                <div className="p-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleEnterProject(project)}
                    className="flex-1 py-2 px-3 text-xs font-semibold text-[#6257D9] bg-[#F0EBFF] hover:bg-[#E4DCFF] rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setPendingDeleteProject(project)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Create Project Modal */}
      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#EAE5F7] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F0EBFF] text-[#6257D9] flex items-center justify-center">
                  <FolderKanban className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Create New Project</h3>
                  <p className="text-[11px] text-slate-500">
                    Establish an isolated workspace with designated team access
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Project Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const autoKey = name
                        .replace(/[^a-zA-Z0-9]/g, '')
                        .slice(0, 4)
                        .toUpperCase();
                      setCreateForm((prev) => ({
                        ...prev,
                        name,
                        key: prev.key ? prev.key : autoKey,
                      }));
                    }}
                    placeholder="e.g. Mobile Application"
                    required
                    maxLength={60}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6257D9]/20 focus:border-[#6257D9] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Key <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createForm.key}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        key: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''),
                      }))
                    }
                    placeholder="e.g. MOB"
                    required
                    minLength={2}
                    maxLength={10}
                    className="w-full px-3.5 py-2.5 text-xs font-mono font-bold bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6257D9]/20 focus:border-[#6257D9] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Outline the scope and objectives for this project workspace..."
                  maxLength={500}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6257D9]/20 focus:border-[#6257D9] transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Status
                </label>
                <select
                  value={createForm.status}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6257D9]/20 focus:border-[#6257D9] transition-all"
                >
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              {/* Assign Initial Team Members */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Assign Team Members</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {createForm.initialMemberIds.length} selected
                  </span>
                </label>
                <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50/50">
                  {allUsers
                    .filter((u) => u._id !== user?._id)
                    .map((u) => {
                      const selected = createForm.initialMemberIds.includes(u._id);
                      return (
                        <label
                          key={u._id}
                          className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                            selected ? 'bg-[#F0EBFF] text-[#6257D9] font-semibold' : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setCreateForm((prev) => ({
                                ...prev,
                                initialMemberIds: checked
                                  ? [...prev.initialMemberIds, u._id]
                                  : prev.initialMemberIds.filter((id) => id !== u._id),
                              }));
                            }}
                            className="rounded text-[#6257D9] focus:ring-[#6257D9]"
                          />
                          <UserAvatar name={u.name} avatar={u.avatar} size="xs" />
                          <span className="truncate flex-1">{u.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{u.jobTitle || u.role}</span>
                        </label>
                      );
                    })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#6257D9] hover:bg-[#5246c7] rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{creating ? 'Creating...' : 'Create Workspace'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!pendingDeleteProject}
        title="Delete Project Workspace?"
        message={`Are you sure you want to delete "${pendingDeleteProject?.name}" (${pendingDeleteProject?.key})? All associated tickets, comments, and activities in this workspace will be permanently removed.`}
        confirmText="Delete Project"
        confirmVariant="danger"
        loading={actionLoading}
        onConfirm={confirmDelete}
        onClose={() => setPendingDeleteProject(null)}
      />
    </div>
  );
};
