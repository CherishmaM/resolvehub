import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createIssueApi } from '../api/issues.api';
import { IssueForm } from '../components/issues/IssueForm';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { PlusCircle } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      {/* Header matching App Design System */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#ede9fe] text-[#5b42d6] flex items-center justify-center shrink-0 shadow-2xs">
          <PlusCircle className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create New Issue</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Log a new bug, report a defect, or file a feature request for your engineering team
          </p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Main Form Container Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xs">
        <IssueForm
          onSubmit={handleSubmit}
          loading={loading}
          onCancel={() => navigate('/issues')}
        />
      </div>
    </div>
  );
};
