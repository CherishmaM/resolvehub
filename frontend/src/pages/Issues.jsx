import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getIssuesApi } from '../api/issues.api';
import { IssueTable } from '../components/issues/IssueTable';
import { IssueFilters } from '../components/issues/IssueFilters';
import { Pagination } from '../components/ui/Pagination';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { EmptyState } from '../components/ui/EmptyState';
import { CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Issues = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL query parameters or default
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const searchParam = searchParams.get('search') || '';
  const statusParam = searchParams.get('status') || '';
  const priorityParam = searchParams.get('priority') || '';
  const categoryParam = searchParams.get('category') || '';
  const assignedToParam = searchParams.get('assignedTo') || '';

  const [issues, setIssues] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const queryParams = {
        page: pageParam,
        limit: 10,
        search: searchParam || undefined,
        status: statusParam || undefined,
        priority: priorityParam || undefined,
        category: categoryParam || undefined,
        assignedTo:
          assignedToParam === 'me' && user?._id
            ? user._id
            : assignedToParam || undefined,
      };

      const res = await getIssuesApi(queryParams);
      setIssues(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load issues list.');
    } finally {
      setLoading(false);
    }
  }, [
    pageParam,
    searchParam,
    statusParam,
    priorityParam,
    categoryParam,
    assignedToParam,
    user?._id,
  ]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Update query params helper
  const updateParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  };

  const handleSearchChange = (val) => {
    updateParams({ search: val, page: 1 });
  };

  const handleStatusChange = (val) => {
    updateParams({ status: val, page: 1 });
  };

  const handlePriorityChange = (val) => {
    updateParams({ priority: val, page: 1 });
  };

  const handleCategoryChange = (val) => {
    updateParams({ category: val, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    updateParams({ page: newPage });
  };

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header with Title matching Reference Design Image 2 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bug Tracker</h1>
        <p className="text-xs text-slate-500 mt-1">
          Visualize and manage your issues across engineering projects
        </p>
      </div>

      {/* Filter Bar */}
      <IssueFilters
        search={searchParam}
        onSearchChange={handleSearchChange}
        status={statusParam}
        onStatusChange={handleStatusChange}
        priority={priorityParam}
        onPriorityChange={handlePriorityChange}
        category={categoryParam}
        onCategoryChange={handleCategoryChange}
        onReset={handleResetFilters}
      />

      {error && <ErrorMessage message={error} onRetry={fetchIssues} />}

      {/* Issue Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16">
            <LoadingSpinner size="md" text="Loading issues..." />
          </div>
        ) : issues.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={CheckSquare}
              title="No issues found"
              description="No issues match the selected search or filter criteria."
              action={
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-xs font-semibold text-[#5b42d6] bg-[#f3f0ff] hover:bg-[#ede9fe] rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              }
            />
          </div>
        ) : (
          <>
            <IssueTable issues={issues} />
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              limit={pagination.limit}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
};
