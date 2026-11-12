import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createIssueApi } from '../api/issues.api';
import { IssueForm } from '../components/issues/IssueForm';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { PlusCircle, Lightbulb } from 'lucide-react';

export const CreateIssue = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedProjectId = searchParams.get('project');

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

      {/* Distinction callout for ideas vs bugs */}
      <div className="bg-[#FAF9FF] border border-[#E3D9FF] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F0EBFF] text-[#6257D9] flex items-center justify-center shrink-0">
            <Lightbulb className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#272443]">
              Have a feature proposal or design suggestion rather than a bug?
            </p>
            <p className="text-[11px] text-slate-500">
              Ideas aren’t defects! Use our team brainstorming space to vote and discuss concepts.
            </p>
          </div>
        </div>
        <Link
          to="/ideas"
          className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white hover:bg-[#F0EBFF] text-[#6257D9] border border-[#E3D9FF] transition-all"
        >
          Go to Brainstorming ➔
        </Link>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Main Form Container Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xs">
        <IssueForm
          initialValues={{ projectId: preselectedProjectId || undefined }}
          onSubmit={handleSubmit}
          loading={loading}
          onCancel={() => navigate('/issues')}
        />
      </div>
    </div>
  );
};
