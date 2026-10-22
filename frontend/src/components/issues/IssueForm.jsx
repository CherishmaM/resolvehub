import React, { useState, useEffect, useRef } from 'react';
import { getUsersApi } from '../../api/users.api';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Image as ImageIcon, Upload, Trash2, CheckCircle2 } from 'lucide-react';

const CATEGORIES = [
  'Frontend',
  'Backend',
  'Database',
  'UI/UX',
  'Feature Request',
  'Other',
];

const PRIORITIES = [
  { id: 'Low', label: 'Low', desc: 'Minor cosmetic', style: 'bg-[#dcfce7] text-[#16a34a] border-[#bbf7d0]' },
  { id: 'Medium', label: 'Medium', desc: 'Standard issue', style: 'bg-[#e0f2fe] text-[#0284c7] border-[#bae6fd]' },
  { id: 'High', label: 'High', desc: 'Major flaw', style: 'bg-[#ffedd5] text-[#c2410c] border-[#fed7aa]' },
  { id: 'Critical', label: 'Critical', desc: 'System blocker', style: 'bg-[#ffe4e6] text-[#e11d48] border-[#fecdd3]' },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];

export const IssueForm = ({
  initialValues = {},
  onSubmit,
  loading = false,
  isEdit = false,
  onCancel,
}) => {
  const [users, setUsers] = useState([]);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: initialValues.title || '',
    description: initialValues.description || '',
    category: initialValues.category || 'Frontend',
    priority: initialValues.priority || 'Medium',
    assignedTo: initialValues.assignedTo?._id || initialValues.assignedTo || '',
    imageUrl: initialValues.imageUrl || '',
  });

  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (isEdit && initialValues?._id) {
      setFormData({
        title: initialValues.title || '',
        description: initialValues.description || '',
        category: initialValues.category || 'Frontend',
        priority: initialValues.priority || 'Medium',
        assignedTo:
          initialValues.assignedTo?._id ||
          (typeof initialValues.assignedTo === 'string' ? initialValues.assignedTo : '') ||
          '',
        imageUrl: initialValues.imageUrl || '',
      });
    }
  }, [isEdit, initialValues?._id]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getUsersApi();
        setUsers(res.data || []);
      } catch (err) {
        console.error('Failed to load users for assignment:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrioritySelect = (priId) => {
    setFormData((prev) => ({ ...prev, priority: priId }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setValidationError('Please upload a valid image file (PNG, JPG, WebP, or GIF).');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setValidationError('Image size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    setValidationError('');
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
    };
    reader.onerror = () => {
      setValidationError('Failed to read image file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.title.trim() || formData.title.trim().length < 3) {
      setValidationError('Title must be at least 3 characters long.');
      return;
    }

    if (!formData.description.trim() || formData.description.trim().length < 5) {
      setValidationError('Description must be at least 5 characters long.');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      priority: formData.priority,
      assignedTo: formData.assignedTo ? formData.assignedTo : null,
      imageUrl: formData.imageUrl ? formData.imageUrl : null,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {validationError && <ErrorMessage message={validationError} />}

      {/* 1. Title */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Issue Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Authentication token expiration causing infinite reload loop"
          maxLength={120}
          required
          className="w-full px-4 py-3 text-sm bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5b42d6]/20 focus:border-[#5b42d6] transition-all"
        />
        <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1.5 px-1">
          <span>Be concise and specific about the observed problem</span>
          <span>{formData.title.length}/120</span>
        </div>
      </div>

      {/* 2. Priority Selection with Visual Chips matching Reference Theme */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Priority Level <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PRIORITIES.map((pri) => {
            const isSelected = formData.priority === pri.id;
            return (
              <button
                key={pri.id}
                type="button"
                onClick={() => handlePrioritySelect(pri.id)}
                className={`p-3 rounded-2xl border text-left transition-all relative ${
                  isSelected
                    ? `${pri.style} ring-2 ring-[#5b42d6] shadow-2xs`
                    : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{pri.label}</span>
                  {isSelected && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-current shrink-0" />
                  )}
                </div>
                <p className="text-[10px] opacity-75 mt-0.5 truncate">{pri.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Category & Assignee Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Category */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Category <span className="text-rose-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-3 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5b42d6]/20 focus:border-[#5b42d6] transition-all"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Assignee */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Assign Teammate <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </label>
          <select
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            className="w-full px-4 py-3 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5b42d6]/20 focus:border-[#5b42d6] transition-all"
          >
            <option value="">Unassigned (Default)</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} {u.jobTitle ? `(${u.jobTitle})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Optional Image / Screenshot Attachment Dropzone */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-[#5b42d6]" />
          <span>Screenshot / Visual Attachment</span>
          <span className="text-slate-400 font-normal lowercase">(optional)</span>
        </label>

        {formData.imageUrl ? (
          <div className="flex items-center gap-4 p-3.5 bg-[#fbfbfe] border border-slate-200 rounded-2xl">
            <img
              src={formData.imageUrl}
              alt="Issue preview"
              className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800">Attached Visual Proof</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Saved image will be visible in the tracker and details view
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
                title="Remove image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#ddd6fe] hover:border-[#5b42d6] rounded-2xl p-6 text-center cursor-pointer transition-all bg-[#faf9fe] hover:bg-[#f5f3ff] group"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#ede9fe] text-[#5b42d6] group-hover:bg-[#5b42d6] group-hover:text-white mx-auto flex items-center justify-center mb-2.5 transition-colors shadow-2xs">
              <Upload className="w-5 h-5 stroke-[2]" />
            </div>
            <p className="text-xs font-medium text-slate-700">
              <span className="text-[#5b42d6] font-bold">Click to upload</span> a screenshot or drop file here
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports PNG, JPG, WebP, or GIF up to 5MB
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          onChange={handleImageFileChange}
          className="hidden"
        />
      </div>

      {/* 5. Detailed Description */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Detailed Description <span className="text-rose-500">*</span>
        </label>
        <textarea
          name="description"
          rows={5}
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe steps to reproduce, expected vs actual behavior, error traces, or console warnings..."
          maxLength={2000}
          required
          className="w-full px-4 py-3 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5b42d6]/20 focus:border-[#5b42d6] transition-all font-sans"
        />
        <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1.5 px-1">
          <span>Markdown syntax supported</span>
          <span>{formData.description.length}/2000</span>
        </div>
      </div>

      {/* 6. Form Footer Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 text-xs font-semibold text-white bg-[#5b42d6] hover:bg-[#4c35c2] rounded-xl shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? 'Saving Issue...' : isEdit ? 'Update Issue' : 'Create Issue'}
        </button>
      </div>
    </form>
  );
};
