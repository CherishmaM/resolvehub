import React, { useState, useEffect, useCallback } from 'react';
import { getUsersApi, updateUserRoleApi, createUserApi, deleteUserApi } from '../api/users.api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { UserAvatar } from '../components/ui/UserAvatar';
import { formatDate } from '../utils/formatters';
import {
  Users,
  Shield,
  ShieldCheck,
  Mail,
  CheckCircle,
  Plus,
  Trash2,
  X,
  UserPlus,
  Search,
} from 'lucide-react';

export const Team = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Role change confirmation modal state
  const [pendingRoleChange, setPendingRoleChange] = useState(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Add Teammate modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: 'member',
    jobTitle: 'Software Engineer',
    password: '',
  });

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getUsersApi();
      setTeam(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch team members.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const handleRoleSelect = (targetUser, newRole) => {
    if (targetUser.role === newRole) return;

    if (targetUser._id === currentUser._id) {
      setError('You cannot modify your own role to prevent accidental lockout.');
      return;
    }

    setPendingRoleChange({ targetUser, newRole });
  };

  const confirmRoleChange = async () => {
    if (!pendingRoleChange) return;
    setUpdating(true);
    setError('');
    setSuccessMessage('');

    const { targetUser, newRole } = pendingRoleChange;

    try {
      await updateUserRoleApi(targetUser._id, newRole);
      setSuccessMessage(`Successfully updated ${targetUser.name}'s role to ${newRole}.`);
      setTeam((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      setError(err.message || 'Failed to update user role.');
    } finally {
      setUpdating(false);
      setPendingRoleChange(null);
    }
  };

  const confirmDeleteUser = async () => {
    if (!pendingDeleteUser) return;
    setUpdating(true);
    setError('');
    setSuccessMessage('');

    try {
      await deleteUserApi(pendingDeleteUser._id);
      setSuccessMessage(`User ${pendingDeleteUser.name} was removed from the workspace.`);
      setTeam((prev) => prev.filter((u) => u._id !== pendingDeleteUser._id));
    } catch (err) {
      setError(err.message || 'Failed to remove user.');
    } finally {
      setUpdating(false);
      setPendingDeleteUser(null);
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setAddError('');

    if (!newUserData.name.trim()) {
      setAddError('Full name is required.');
      return;
    }
    if (!newUserData.email.trim()) {
      setAddError('Email address is required.');
      return;
    }

    setAddLoading(true);
    try {
      const res = await createUserApi({
        name: newUserData.name.trim(),
        email: newUserData.email.trim(),
        role: newUserData.role,
        jobTitle: newUserData.jobTitle.trim() || 'Software Engineer',
        password: newUserData.password.trim() || 'Welcome@123',
      });

      const created = res.data?.data || res.data;
      setTeam((prev) => [...prev, created]);
      setSuccessMessage(`Successfully added ${newUserData.name} to the team!`);
      setIsAddModalOpen(false);
      setNewUserData({
        name: '',
        email: '',
        role: 'member',
        jobTitle: 'Software Engineer',
        password: '',
      });
    } catch (err) {
      setAddError(err.message || 'Failed to add team member.');
    } finally {
      setAddLoading(false);
    }
  };

  // Filtered members list
  const filteredTeam = team.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.jobTitle && member.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter ? member.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header with Member Count & Add Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team Directory</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage engineering members, system permissions, and workspace access
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#5b42d6] hover:bg-[#4c35c2] text-white text-xs font-semibold shadow-2xs hover:shadow-xs transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Teammate</span>
            </button>
          )}
        </div>
      </div>

      {error && <ErrorMessage message={error} />}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-medium flex items-center gap-2.5 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 2. Search & Filter Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teammates by name, email, or title..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5b42d6]/20 focus:border-[#5b42d6] transition-all"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full sm:w-44 py-2 px-3 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5b42d6]/20 focus:border-[#5b42d6] transition-all"
        >
          <option value="">All Roles</option>
          <option value="admin">Administrators</option>
          <option value="member">Members</option>
        </select>
      </div>

      {/* 3. Team Members Table Card */}
      {loading ? (
        <div className="py-16">
          <LoadingSpinner size="md" text="Loading team members..." />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-white text-xs font-semibold text-slate-900">
                  <th className="py-4 px-5">Member</th>
                  <th className="py-4 px-5">Email</th>
                  <th className="py-4 px-5">System Role</th>
                  <th className="py-4 px-5">Joined Date</th>
                  {isAdmin && <th className="py-4 px-5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 text-xs">
                {filteredTeam.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="py-12 text-center text-slate-400">
                      No team members match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTeam.map((member) => {
                    const isCurrent = member._id === currentUser?._id;
                    const isMemberAdmin = member.role === 'admin';

                    return (
                      <tr
                        key={member._id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* Member Identity with Initials Avatar */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              name={member.name}
                              title={member.jobTitle || member.role}
                              avatar={member.avatar}
                              size="md"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 group-hover:text-[#5b42d6] transition-colors">
                                  {member.name}
                                </span>
                                {isCurrent && (
                                  <span className="text-[10px] bg-[#ede9fe] text-[#5b42d6] px-1.5 py-0.2 rounded-md font-bold">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400">
                                {member.jobTitle || 'Engineer'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-5 text-slate-600 font-mono">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{member.email}</span>
                          </div>
                        </td>

                        {/* System Role Pill */}
                        <td className="py-4 px-5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
                              isMemberAdmin
                                ? 'bg-[#ede9fe] text-[#5b42d6] border border-[#ddd6fe]'
                                : 'bg-slate-100 text-slate-700 border border-slate-200/80'
                            }`}
                          >
                            {isMemberAdmin ? (
                              <ShieldCheck className="w-3.5 h-3.5 text-[#5b42d6]" />
                            ) : (
                              <Shield className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <span className="capitalize">{member.role}</span>
                          </span>
                        </td>

                        {/* Joined Date */}
                        <td className="py-4 px-5 text-slate-500 whitespace-nowrap">
                          {formatDate(member.createdAt)}
                        </td>

                        {/* Admin Actions */}
                        {isAdmin && (
                          <td className="py-4 px-5 text-right whitespace-nowrap">
                            {isCurrent ? (
                              <span className="text-[11px] text-slate-400 italic">
                                Active session
                              </span>
                            ) : (
                              <div className="inline-flex items-center gap-2">
                                <select
                                  value={member.role}
                                  onChange={(e) =>
                                    handleRoleSelect(member, e.target.value)
                                  }
                                  className="py-1 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:border-[#5b42d6] focus:outline-none focus:ring-2 focus:ring-[#5b42d6]/20 transition-all font-medium"
                                >
                                  <option value="member">Member</option>
                                  <option value="admin">Admin</option>
                                </select>

                                <button
                                  type="button"
                                  onClick={() => setPendingDeleteUser(member)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                  title={`Remove ${member.name}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Teammate Modal matching Design System */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => !addLoading && setIsAddModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#fbfbfe]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#ede9fe] text-[#5b42d6] flex items-center justify-center shadow-2xs">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add New Teammate</h3>
                  <p className="text-[11px] text-slate-400">Invite an engineer to your ResolveHub workspace</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                disabled={addLoading}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="p-6 space-y-4">
              {addError && <ErrorMessage message={addError} />}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newUserData.name}
                  onChange={(e) =>
                    setNewUserData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Maya Patel"
                  required
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5b42d6]/20 focus:border-[#5b42d6] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) =>
                    setNewUserData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="e.g. maya@resolvehub.io"
                  required
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5b42d6]/20 focus:border-[#5b42d6] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={newUserData.jobTitle}
                    onChange={(e) =>
                      setNewUserData((prev) => ({ ...prev, jobTitle: e.target.value }))
                    }
                    placeholder="e.g. Frontend Dev"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5b42d6]/20 focus:border-[#5b42d6] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    System Role
                  </label>
                  <select
                    value={newUserData.role}
                    onChange={(e) =>
                      setNewUserData((prev) => ({ ...prev, role: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5b42d6]/20 focus:border-[#5b42d6] transition-all"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Initial Password <span className="text-slate-400 font-normal lowercase">(default: Welcome@123)</span>
                </label>
                <input
                  type="text"
                  value={newUserData.password}
                  onChange={(e) =>
                    setNewUserData((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="Welcome@123"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5b42d6]/20 focus:border-[#5b42d6] transition-all font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={addLoading}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#5b42d6] hover:bg-[#4c35c2] rounded-xl shadow-2xs hover:shadow-xs transition-all disabled:opacity-50"
                >
                  {addLoading ? 'Adding...' : 'Add Teammate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Role Modification */}
      <ConfirmDialog
        isOpen={!!pendingRoleChange}
        title="Confirm Role Change"
        message={`Are you sure you want to change ${pendingRoleChange?.targetUser?.name}'s role to ${pendingRoleChange?.newRole?.toUpperCase()}? This will update their administrative privileges.`}
        confirmText="Change Role"
        confirmVariant="primary"
        loading={updating}
        onConfirm={confirmRoleChange}
        onClose={() => setPendingRoleChange(null)}
      />

      {/* Confirmation Dialog for User Deletion */}
      <ConfirmDialog
        isOpen={!!pendingDeleteUser}
        title="Remove Team Member?"
        message={`Are you sure you want to remove ${pendingDeleteUser?.name} (${pendingDeleteUser?.email}) from the workspace? Any assigned issues will be reverted to unassigned.`}
        confirmText="Remove Member"
        confirmVariant="danger"
        loading={updating}
        onConfirm={confirmDeleteUser}
        onClose={() => setPendingDeleteUser(null)}
      />
    </div>
  );
};
