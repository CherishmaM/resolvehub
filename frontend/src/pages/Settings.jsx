import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatters';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import {
  Shield,
  User,
  Mail,
  Calendar,
  Server,
  LogOut,
  CheckCircle,
  Camera,
  Save,
  Sparkles,
  Link as LinkIcon,
  RotateCcw,
} from 'lucide-react';

const AVATAR_PRESETS = [
  {
    label: 'Lead Architect',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    label: 'Senior Engineer',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    label: 'Product Designer',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    label: 'Backend Specialist',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  },
  {
    label: 'DevOps / SRE',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    label: 'Cybersecurity',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
];

export const Settings = () => {
  const { user, logout, isAdmin, updateProfile } = useAuth();

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Keep state synced with current user
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg('Full Name must be at least 2 characters.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        avatar: avatar.trim(),
      });
      setSuccessMsg('Your profile has been successfully updated!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectPreset = (url) => {
    setAvatar(url);
    setSuccessMsg('');
  };

  const handleResetToInitials = () => {
    const initialsUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'User')}`;
    setAvatar(initialsUrl);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Account & Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Customize your profile identity, avatar image, and review access privileges
        </p>
      </div>

      {errorMsg && <ErrorMessage message={errorMsg} />}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-fade-in shadow-2xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Interactive Profile Editor Card */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-card space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              Edit Profile & Personal Details
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Updates will instantly reflect across your reported issues, comments, and team activity
            </p>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Avatar Section: Live Preview + Presets */}
          <div className="flex flex-col sm:flex-row items-start gap-6 p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="relative group">
                <img
                  src={
                    avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'User')}`
                  }
                  alt={name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md bg-white ring-2 ring-indigo-500/20"
                />
                <div className="absolute inset-0 rounded-2xl bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Live Preview</span>
            </div>

            <div className="flex-1 space-y-3 w-full">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Avatar Photo URL
                </label>
                <div className="relative">
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full pl-8 pr-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Curated Presets Picker */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-500" /> Or pick a curated team avatar:
                  </span>
                  <button
                    type="button"
                    onClick={handleResetToInitials}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                  >
                    <RotateCcw className="w-2.5 h-2.5" /> Use Initials
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset.url)}
                      title={preset.label}
                      className={`relative p-1 rounded-xl border transition-all text-center flex flex-col items-center gap-1 ${
                        avatar === preset.url
                          ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-9 h-9 rounded-lg object-cover"
                      />
                      <span className="text-[9px] text-slate-600 font-medium truncate w-full px-0.5">
                        {preset.label.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields: Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Display Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                minLength={2}
                maxLength={50}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address (Permanent)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-[11px] text-slate-400">
              Role: <strong className="text-slate-700 uppercase">{user?.role}</strong>
            </span>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Shield className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Role Scope & Permissions ({user?.role?.toUpperCase()})
          </h3>
        </div>

        <div className="space-y-3 text-xs text-slate-600">
          <p>
            ResolveHub enforces strict server-side role boundaries to ensure enterprise data integrity:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
              <span className="font-bold text-slate-800 block flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span> Member Capabilities:
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Create and report new issues & bugs</li>
                <li>View team issues for transparent collaboration</li>
                <li>Edit details of issues created by you</li>
                <li>Update progress of assigned tickets</li>
                <li>Add discussion comments to any issue</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 space-y-2">
              <span className="font-bold text-purple-900 block flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span> Admin Privileges:
              </span>
              <ul className="list-disc list-inside space-y-1 text-purple-800">
                <li>Assign and reassign issues across active members</li>
                <li>Full editing and prioritization of all issues</li>
                <li>Permanent deletion with cascade cleanup</li>
                <li>Promote or demote teammate system roles</li>
                <li>Self-demotion lockout protection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
          <Server className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">API Connection & Diagnostics</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-400 block">Service Name</span>
            <span className="font-semibold text-slate-800 block mt-0.5">ResolveHub v1.0.0</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-400 block">Auth Session</span>
            <span className="font-semibold text-emerald-600 block mt-0.5">
              HttpOnly Secure Cookie
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-400 block">Environment</span>
            <span className="font-mono text-slate-700 block mt-0.5">Development (Active)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
