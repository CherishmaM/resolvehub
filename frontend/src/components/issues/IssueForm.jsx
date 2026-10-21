import React, { useState, useEffect } from 'react';
import { getUsersApi } from '../../api/users.api';
import { useAuth } from '../../context/AuthContext';
import { ErrorMessage } from '../ui/ErrorMessage';

const CATEGORIES = [
  'Frontend',
  'Backend',
  'Database',
  'UI/UX',
  'Feature Request',
  'Other',
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export const IssueForm = ({
  initialValues = {},
  onSubmit,
  loading = false,
  isEdit = false,
  onCancel,
}) => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    title: initialValues.title || '',
    description: initialValues.description || '',
    category: initialValues.category || 'Frontend',
    priority: initialValues.priority || 'Medium',
    assignedTo: initialValues.assignedTo?._id || initialValues.assignedTo || '',
  });

  const [validationError, setValidationError] = useState('');

  // Fetch team members for assignment dropdown if admin
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
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {validationError && <ErrorMessage message={validationError} />}

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Issue Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Stripe webhook signature verification failing"
          maxLength={120}
          required
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
        <p className="text-[11px] text-slate-400 mt-1">
          {formData.title.length}/120 characters
        </p>
      </div>

      {/* Category and Priority Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Category <span className="text-rose-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Priority <span className="text-rose-500">*</span>
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            {PRIORITIES.map((pri) => (
              <option key={pri} value={pri}>
                {pri}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignee (visible to all, active selector for admin) */}
      {isAdmin && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Assign Team Member (Admin Only)
          </label>
          <select
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Detailed Description <span className="text-rose-500">*</span>
        </label>
        <textarea
          name="description"
          rows={6}
          value={formData.description}
          onChange={handleChange}
          placeholder="Provide clear steps to reproduce, error traces, or expected outcomes..."
          maxLength={2000}
          required
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono text-xs"
        />
        <p className="text-[11px] text-slate-400 mt-1">
          {formData.description.length}/2000 characters
        </p>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 transition-all disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Issue' : 'Create Issue'}
        </button>
      </div>
    </form>
  );
};
