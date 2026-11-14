import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { getIssuesApi } from '../api/issues.api';
import { IssueTable } from '../components/issues/IssueTable';
import { IssueFilters } from '../components/issues/IssueFilters';
import { Pagination } from '../components/ui/Pagination';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { EmptyState } from '../components/ui/EmptyState';
import { CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';

// High-performance Table Skeleton matching exact columns and rows
const TableSkeleton = () => (
  <div className="overflow-x-auto min-h-[340px]">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-[#EAE4F7] bg-[#F8F7FD] text-[11px] font-bold uppercase tracking-wider text-[#544D75]">
          <th className="py-3.5 px-5">Key</th>
          <th className="py-3.5 px-5">Title</th>
          <th className="py-3.5 px-5">Status</th>
          <th className="py-3.5 px-5">Priority</th>
          <th className="py-3.5 px-5">Assignee</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#F0ECF9]">
        {[...Array(6)].map((_, i) => (
          <tr key={i} className="animate-pulse">
            <td className="py-4 px-5">
              <div className="w-20 h-5 bg-[#F0EBFF] rounded-md" />
            </td>
            <td className="py-4 px-5">
              <div className="w-56 h-4 bg-slate-100 rounded mb-1.5" />
              <div className="w-28 h-3 bg-slate-50 rounded" />
            </td>
            <td className="py-4 px-5">
              <div className="w-24 h-6 bg-[#FFF7ED] border border-[#FED7AA] rounded-full" />
            </td>
            <td className="py-4 px-5">
              <div className="w-16 h-5 bg-slate-100 rounded-md" />
            </td>
            <td className="py-4 px-5">
              <div className="w-24 h-5 bg-slate-100 rounded-md" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Issues = () => {
  const { user } = useAuth();
  const { projects } = useProject();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL query parameters or default
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const searchParam = searchParams.get('search') || '';
  const statusParam = searchParams.get('status') || '';
  const priorityParam = searchParams.get('priority') || '';
  const categoryParam = searchParams.get('category') || '';
  const assignedToParam = searchParams.get('assignedTo') || '';
  const projectIdParam = searchParams.get('projectId') || '';

  // Store current issues path with query parameters so clicking an issue and navigating back retains page
  useEffect(() => {
    if (location.pathname === '/issues') {
      sessionStorage.setItem('resolvehub_issues_path', location.pathname + location.search);
      if (location.search) {
        sessionStorage.setItem('resolvehub_issues_query', location.search);
      }
    }
  }, [location.pathname, location.search]);

  const hasNoFilters =
    !searchParam &&
    !statusParam &&
    !priorityParam &&
    !categoryParam &&
    !assignedToParam &&
    !projectIdParam &&
    pageParam === 1;

  const [issues, setIssues] = useState(() => {
    try {
      if (hasNoFilters) {
        const cached = localStorage.getItem('resolvehub_cached_issues') || sessionStorage.getItem('resolvehub_cached_issues');
        return cached ? JSON.parse(cached) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  const [pagination, setPagination] = useState(() => {
    try {
      if (hasNoFilters) {
        const cached = localStorage.getItem('resolvehub_cached_issues_pagination') || sessionStorage.getItem('resolvehub_cached_issues_pagination');
        return cached ? JSON.parse(cached) : { total: 0, page: 1, limit: 10, totalPages: 1 };
      }
      return { total: 0, page: 1, limit: 10, totalPages: 1 };
    } catch {
      return { total: 0, page: 1, limit: 10, totalPages: 1 };
    }
  });

  const [loading, setLoading] = useState(() => {
    try {
      if (hasNoFilters) {
        return !localStorage.getItem('resolvehub_cached_issues') && !sessionStorage.getItem('resolvehub_cached_issues');
      }
      return true;
    } catch {
      return true;
    }
  });
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');

  const fetchIssues = useCallback(async () => {
    setIsFetching(true);
    setError('');

    try {
      const queryParams = {
        page: pageParam,
        limit: 10,
        search: searchParam || undefined,
        status: statusParam || undefined,
        priority: priorityParam || undefined,
        category: categoryParam || undefined,
        projectId: projectIdParam || undefined,
        assignedTo:
          assignedToParam === 'me' && user?._id
            ? user._id
            : assignedToParam || undefined,
      };

      const res = await getIssuesApi(queryParams);
      const data = res.data || [];
      setIssues(data);
      if (res.pagination) {
        setPagination(res.pagination);
      }

      // Cache default view across sessions for 0ms instantaneous loads
      if (hasNoFilters) {
        try {
          localStorage.setItem('resolvehub_cached_issues', JSON.stringify(data));
          sessionStorage.setItem('resolvehub_cached_issues', JSON.stringify(data));
          if (res.pagination) {
            localStorage.setItem('resolvehub_cached_issues_pagination', JSON.stringify(res.pagination));
            sessionStorage.setItem('resolvehub_cached_issues_pagination', JSON.stringify(res.pagination));
          }
        } catch {}
      }
    } catch (err) {
      setError(err.message || 'Failed to load issues list.');
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [
    pageParam,
    searchParam,
    statusParam,
    priorityParam,
    categoryParam,
    assignedToParam,
    projectIdParam,
    user?._id,
    hasNoFilters,
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

  const handleProjectChange = (val) => {
    updateParams({ projectId: val, page: 1 });
  };

  const handleResetFilters = () => {
    sessionStorage.removeItem('resolvehub_issues_query');
    sessionStorage.removeItem('resolvehub_issues_path');
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    updateParams({ page: newPage });
  };

  const handleIssueStatusChange = (issueId, newStatus) => {
    setIssues((prev) => {
      const next = prev.map((i) => (i._id === issueId ? { ...i, status: newStatus } : i));
      if (hasNoFilters) {
        try {
          localStorage.setItem('resolvehub_cached_issues', JSON.stringify(next));
          sessionStorage.setItem('resolvehub_cached_issues', JSON.stringify(next));
        } catch {}
      }
      return next;
    });
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
        projectId={projectIdParam}
        onProjectChange={handleProjectChange}
        projects={projects}
        onReset={handleResetFilters}
      />

      {error && <ErrorMessage message={error} onRetry={fetchIssues} />}

      {/* Issue Table Card - Clean White Background */}
      <div className="bg-white rounded-2xl border border-[#E2DBF7] shadow-sm overflow-hidden transition-all relative">
        {/* Top edge subtle loading bar when revalidating in background */}
        {isFetching && issues.length > 0 && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#6257D9]/20 overflow-hidden z-20">
            <div className="h-full bg-gradient-to-r from-transparent via-[#6257D9] to-transparent animate-shimmer w-1/2" />
          </div>
        )}

        {loading && issues.length === 0 ? (
          <TableSkeleton />
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
          <div className={`transition-opacity duration-150 ${isFetching ? 'opacity-85' : 'opacity-100'}`}>
            <IssueTable issues={issues} onStatusChange={handleIssueStatusChange} />
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              limit={pagination.limit}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};
