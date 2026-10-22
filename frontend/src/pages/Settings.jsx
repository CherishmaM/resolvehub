import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import {
  User,
  LogOut,
  CheckCircle,
  Camera,
  Upload,
  Trash2,
  Save,
  Briefcase,
  Sparkles,
} from 'lucide-react';

const COMMON_ROLES = [
  'Frontend Engineer',
  'Backend Engineer',
  'Full-Stack Developer',
  'QA / Test Engineer',
  'DevOps / SRE',
  'UI/UX Designer',
  'Product Manager',
  'Engineering Lead',
];

export const Settings = () => {
  const { user, logout, isAdmin, updateProfile } = useAuth();
  const fileInputRef = useRef(null);

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || 'Software Engineer');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Keep state synced with current user
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setJobTitle(user.jobTitle || 'Software Engineer');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  // Handle local image file upload and convert to base64 data URL
  const handleImageFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP, etc.).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size should be less than 5MB.');
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
      setSuccessMsg('Picture uploaded! Click "Save Profile Changes" to apply.');
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    const initialsUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'User')}`;
    setAvatar(initialsUrl);
    setSuccessMsg('Profile picture reset to initials. Click "Save Profile Changes" to save.');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
        jobTitle: jobTitle.trim(),
        avatar: avatar.trim(),
      });
      setSuccessMsg('Your profile has been successfully saved!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const currentPreview =
    avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'User')}`;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Account & Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal profile, custom profile picture, and role
        </p>
      </div>

      {errorMsg && <ErrorMessage message={errorMsg} />}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-fade-in shadow-2xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Profile & Identity Card */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-card space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-[#5b42d6]" />
              Profile & Personal Details
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Updates reflect immediately across all your issues, comments, and team activity
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
          {/* Custom Picture Upload Section */}
          <div className="p-4 sm:p-5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Picture Preview */}
              <div className="relative group shrink-0">
                <img
                  src={currentPreview}
                  alt={name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md bg-white ring-2 ring-[#5b42d6]/20"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-2xl bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                  title="Upload new picture"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-800">Profile Picture</h4>
                  <span className="text-[10px] text-slate-400">JPG, PNG, WebP up to 5MB</span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageFileSelect}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#5b42d6] hover:bg-[#4c35c2] rounded-xl shadow-2xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Your Picture</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset to Initials</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Role / Job Title Section */}
          <div className="p-4 sm:p-5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#5b42d6]" />
                <span>Job Title / Professional Role</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Displayed next to your name</span>
            </div>

            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              maxLength={50}
              required
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5b42d6] font-medium"
            />

            {/* Quick role selection chips */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#5b42d6]" />
                Or pick a common title:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setJobTitle(role)}
                    className={`px-2.5 py-1 text-[11px] rounded-lg border transition-all ${
                      jobTitle === role
                        ? 'bg-[#f3f0ff] border-[#8c7cf0] text-[#5b42d6] font-semibold ring-1 ring-[#8c7cf0]/30'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Name & Email Fields */}
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
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5b42d6] focus:border-[#5b42d6] transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address (Account ID)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-mono"
              />
            </div>
          </div>

          {/* Form Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">System Role:</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                isAdmin
                  ? 'bg-[#f3f0ff] text-[#5b42d6] border border-[#e0d9fc]'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {user?.role}
              </span>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#5b42d6] hover:bg-[#4c35c2] rounded-xl shadow-sm shadow-[#5b42d6]/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
