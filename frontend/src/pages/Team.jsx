import React, { useState, useEffect, useCallback } from 'react';
import { getUsersApi, updateUserRoleApi } from '../api/users.api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { formatDate } from '../utils/formatters';
import { Users, Shield, ShieldCheck, Mail, CheckCircle, AlertTriangle } from 'lucide-react';

export const Team = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Role change confirmation modal state
  const [pendingRoleChange, setPendingRoleChange] = useState(null); // { targetUser, newRole }
  const [updating, setUpdating] = useState(false);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Team Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active engineers and product teammates contributing to ResolveHub
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
          <Users className="w-4 h-4" />
          <span>{team.length} Active Members</span>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16">
          <LoadingSpinner size="md" text="Loading team members..." />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">System Role</th>
                  <th className="py-3 px-4">Joined Date</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Admin Role Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {team.map((member) => {
                  const isCurrent = member._id === currentUser?._id;
                  const isMemberAdmin = member.role === 'admin';

                  return (
                    <tr
                      key={member._id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              member.avatar ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`
                            }
                            alt={member.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 bg-slate-100"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-800">
                                {member.name}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 capitalize">
                              {member.role}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{member.email}</span>
                        </div>
                      </td>

                      {/* System Role Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            isMemberAdmin
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {isMemberAdmin ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                          ) : (
                            <Shield className="w-3.5 h-3.5 text-slate-500" />
                          )}
                          <span className="capitalize">{member.role}</span>
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatDate(member.createdAt)}
                      </td>

                      {/* Admin Role Selector */}
                      {isAdmin && (
                        <td className="py-3.5 px-4 text-right">
                          {isCurrent ? (
                            <span className="text-[11px] text-slate-400 italic">
                              Cannot edit self
                            </span>
                          ) : (
                            <select
                              value={member.role}
                              onChange={(e) =>
                                handleRoleSelect(member, e.target.value)
                              }
                              className="py-1 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                            >
                              <option value="member">Member</option>
                              <option value="admin">Admin</option>
                            </select>
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
    </div>
  );
};
