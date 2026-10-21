import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createIssueApi } from '../api/issues.api';
import { IssueForm } from '../components/issues/IssueForm';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { ChevronLeft } from 'lucide-react';

export const CreateIssue = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');

    try {
      const response = await createIssueApi(formData);
      const createdIssue = response.data;
      navigate(`/issues/${createdIssue._id}`, {
        state: { message: 'Issue created successfully!' },
      });
    } catch (err) {
      setError(err.message || 'Failed to create issue. Please check your fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Back link */}
      <div>
        <Link
          to="/issues"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to all issues</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Create New Issue</h2>
          <p className="text-xs text-slate-500 mt-1">
            Fill in the details below to log a bug, UI flaw, database problem, or feature request.
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        <IssueForm
          onSubmit={handleSubmit}
          loading={loading}
          onCancel={() => navigate('/issues')}
        />
      </div>
    </div>
  );
};
