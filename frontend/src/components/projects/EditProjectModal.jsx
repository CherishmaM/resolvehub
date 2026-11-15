import React, { useState, useEffect } from 'react';
import {
  X,
  Edit2,
  Sparkles,
  Palette,
  Image as ImageIcon,
  Smile,
  Type,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  ProjectLogo,
  PROJECT_ICON_OPTIONS,
  PROJECT_COLOR_PRESETS,
  PROJECT_EMOJI_PRESETS,
} from '../ui/ProjectLogo';
import { updateProjectApi } from '../../api/projects.api';
import { useProject } from '../../context/ProjectContext';

export const EditProjectModal = ({
  isOpen,
  onClose,
  project,
  onSuccess,
}) => {
  const { currentProject, setCurrentProject, refreshProjects } = useProject();

  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    status: 'Active',
    logoType: 'icon',
    logo: 'FolderKanban',
    logoColor: '#6257D9',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Sync form when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        key: project.key || '',
        description: project.description || '',
        status: project.status || 'Active',
        logoType: project.logoType || 'icon',
        logo: project.logo || 'FolderKanban',
        logoColor: project.logoColor || '#6257D9',
      });
      setError('');
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Project name is required.');
      return;
    }

    const trimmedKey = formData.key.trim().toUpperCase();
    if (!trimmedKey || trimmedKey.length < 2 || trimmedKey.length > 10) {
      setError('Project key must be between 2 and 10 uppercase alphanumeric characters (e.g., DEV, APP, CORE).');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        name: formData.name.trim(),
        key: trimmedKey,
        description: formData.description.trim(),
        status: formData.status,
        logoType: formData.logoType,
        logo: formData.logo || (formData.logoType === 'icon' ? 'FolderKanban' : ''),
        logoColor: formData.logoColor,
      };

      const res = await updateProjectApi(project._id, payload);
      const updatedProject = res.data;

      // Update currentProject if editing the active project
      if (currentProject?._id === updatedProject._id) {
        setCurrentProject(updatedProject);
      }

      await refreshProjects();
      if (onSuccess) onSuccess(updatedProject);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update project settings.');
    } finally {
      setSaving(false);
    }
  };

  const previewProject = {
    ...project,
    name: formData.name || 'Project Name',
    key: formData.key.trim().toUpperCase() || 'KEY',
    logoType: formData.logoType,
    logo: formData.logo,
    logoColor: formData.logoColor,
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-[#EAE5F7] my-8 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <ProjectLogo project={previewProject} size="md" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Edit Project & Logo
              </h3>
              <p className="text-[11px] text-slate-400">
                Customize project name, unique key identifier, and logo branding
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Live Preview Box */}
          <div className="p-3.5 rounded-2xl bg-[#F8F6FE] border border-[#E5DEFA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-[#6257D9] uppercase tracking-wider block mb-1">
                Live Branding Preview
              </span>
              <div className="flex items-center gap-2.5">
                <ProjectLogo project={previewProject} size="sm" />
                <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-white text-[#6257D9] border border-[#DDD3F5] shadow-2xs">
                  {previewProject.key}
                </span>
                <span className="text-xs font-bold text-slate-800 truncate max-w-[150px]">
                  {previewProject.name}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-white/80 px-2.5 py-1 rounded-xl border border-[#EAE5F7] sm:text-right">
              <span className="text-[10px] text-slate-400 block">Sample Ticket Ref:</span>
              <span className="font-mono font-bold text-[#6257D9]">
                {previewProject.key}-101
              </span>
            </div>
          </div>

          {/* Name & Key Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
                maxLength={60}
                placeholder="e.g. Eurozen Platform"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6257D9]/20 focus:border-[#6257D9] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Key <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.key}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    key: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''),
                  }))
                }
                required
                maxLength={10}
                placeholder="e.g. CORE"
                className="w-full px-3.5 py-2 text-xs font-mono font-bold uppercase bg-slate-50 border border-slate-200/80 rounded-xl text-[#6257D9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6257D9]/20 focus:border-[#6257D9] transition-all"
              />
            </div>
          </div>

          {/* Logo Type Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Logo Type</span>
              <span className="text-[11px] text-slate-400 font-normal">Choose icon, emoji, monogram, or custom image</span>
            </label>

            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60">
              {[
                { type: 'icon', label: 'Preset Icon', icon: Sparkles },
                { type: 'emoji', label: 'Emoji', icon: Smile },
                { type: 'initials', label: 'Initials', icon: Type },
                { type: 'image', label: 'Image URL', icon: ImageIcon },
              ].map((tab) => {
                const TabIcon = tab.icon;
                const active = formData.logoType === tab.type;
                return (
                  <button
                    key={tab.type}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => {
                        let defaultVal = prev.logo;
                        if (tab.type === 'icon' && !PROJECT_ICON_OPTIONS.some((o) => o.name === defaultVal)) {
                          defaultVal = 'FolderKanban';
                        } else if (tab.type === 'emoji' && !PROJECT_EMOJI_PRESETS.includes(defaultVal)) {
                          defaultVal = '🚀';
                        }
                        return { ...prev, logoType: tab.type, logo: defaultVal };
                      });
                    }}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? 'bg-white text-[#6257D9] shadow-xs border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Logo Content depending on active Logo Type */}
          {formData.logoType === 'icon' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                Select Icon Preset
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 max-h-36 overflow-y-auto p-1.5 border border-slate-200/70 rounded-2xl bg-slate-50/50">
                {PROJECT_ICON_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const selected = formData.logo === opt.name;
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, logo: opt.name }))}
                      title={opt.label}
                      className={`h-9 rounded-xl flex items-center justify-center transition-all ${
                        selected
                          ? 'bg-[#6257D9] text-white shadow-xs scale-105'
                          : 'bg-white text-slate-600 hover:bg-[#F2EDFC] hover:text-[#6257D9] border border-slate-200/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {formData.logoType === 'emoji' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                Choose Emoji
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 border border-slate-200/70 rounded-2xl bg-slate-50/50 mb-2">
                {PROJECT_EMOJI_PRESETS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, logo: em }))}
                    className={`w-8 h-8 rounded-xl text-sm flex items-center justify-center transition-all ${
                      formData.logo === em
                        ? 'bg-white border-2 border-[#6257D9] shadow-xs scale-110'
                        : 'hover:bg-white text-slate-700'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={formData.logo}
                onChange={(e) => setFormData((prev) => ({ ...prev, logo: e.target.value }))}
                placeholder="Or paste any custom emoji..."
                maxLength={4}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6257D9]/20"
              />
            </div>
          )}

          {formData.logoType === 'image' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Image or SVG URL
              </label>
              <input
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData((prev) => ({ ...prev, logo: e.target.value }))}
                placeholder="https://example.com/logo.png"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6257D9]/20"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Enter an external PNG, JPG, or SVG image link.
              </p>
            </div>
          )}

          {formData.logoType === 'initials' && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 flex items-center gap-2.5">
              <Type className="w-4 h-4 text-[#6257D9] shrink-0" />
              <span>
                Displays a crisp monogram badge using the project key{' '}
                <strong className="text-slate-900 font-mono font-bold">
                  {formData.key.slice(0, 2) || 'PR'}
                </strong>.
              </span>
            </div>
          )}

          {/* Theme Color Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Theme / Accent Color</span>
              <span className="text-[10px] font-mono text-slate-400">{formData.logoColor}</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {PROJECT_COLOR_PRESETS.map((color) => {
                const isSelected = formData.logoColor.toLowerCase() === color.value.toLowerCase();
                return (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, logoColor: color.value }))}
                    title={color.label}
                    style={{ backgroundColor: color.value }}
                    className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center ${
                      isSelected ? 'ring-2 ring-offset-2 ring-[#6257D9] scale-110 shadow-xs' : 'hover:scale-105'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                );
              })}
              <input
                type="color"
                value={formData.logoColor}
                onChange={(e) => setFormData((prev) => ({ ...prev, logoColor: e.target.value }))}
                title="Custom Color"
                className="w-7 h-7 p-0 border border-slate-200 rounded-lg cursor-pointer bg-white"
              />
            </div>
          </div>

          {/* Description & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                maxLength={500}
                placeholder="Brief summary of workspace goals"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6257D9]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6257D9]/20"
              >
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.name.trim() || !formData.key.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#6257D9] hover:bg-[#5246c7] rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving Changes...' : 'Save Project & Logo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;
