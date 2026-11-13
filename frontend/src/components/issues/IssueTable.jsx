import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { StatusBadge } from '../ui/StatusBadge';
import { StatusDropdown } from '../ui/StatusDropdown';
import { PriorityBadge } from '../ui/PriorityBadge';
import { UserAvatar } from '../ui/UserAvatar';
import { IssueHoverCard } from './IssueHoverCard';
import { Image as ImageIcon, X, FolderKanban } from 'lucide-react';

export const IssueTable = ({
  issues = [],
  onStatusChange,
  onIssueUpdated,
}) => {
  const location = useLocation();
  const [previewImage, setPreviewImage] = useState(null);
  const [hoveredIssue, setHoveredIssue] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(null);
  const hoverTimeoutRef = useRef(null);

  const handleRowMouseEnter = (e, issue) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    const targetEl = e.currentTarget;

    hoverTimeoutRef.current = setTimeout(() => {
      const rect = targetEl.getBoundingClientRect();
      const popoverWidth = 380;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const placeAbove = spaceBelow < 280 && spaceAbove > 280;

      const top = placeAbove ? 'auto' : `${rect.bottom + 6}px`;
      const bottom = placeAbove ? `${window.innerHeight - rect.top + 6}px` : 'auto';
      const left = Math.max(16, Math.min(rect.left + 80, window.innerWidth - popoverWidth - 20));

      setHoverPosition({ top, bottom, left, placeAbove });
      setHoveredIssue(issue);
    }, 160);
  };

  const handleRowMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredIssue(null);
    setHoverPosition(null);
  };

  useEffect(() => {
    const handleScrollOrBlur = () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      setHoveredIssue(null);
      setHoverPosition(null);
    };

    window.addEventListener('scroll', handleScrollOrBlur, { passive: true });
    window.addEventListener('blur', handleScrollOrBlur);

    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      window.removeEventListener('scroll', handleScrollOrBlur);
      window.removeEventListener('blur', handleScrollOrBlur);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setPreviewImage(null);
      }
    };
    if (previewImage) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImage]);

  return (
    <>
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
          <tbody className="divide-y divide-[#F0ECF9] text-xs">
            {issues.map((issue, idx) => {
              const projectKey = issue.projectId?.key || 'TF';
              const keyFormatted = `${projectKey}-${issue._id.slice(-4).toUpperCase()}`;

              return (
                <tr
                  key={issue._id}
                  onMouseEnter={(e) => handleRowMouseEnter(e, issue)}
                  onMouseLeave={handleRowMouseLeave}
                  style={{ animationDelay: `${Math.min(idx * 25, 250)}ms` }}
                  className="even:bg-[#FAF9FE]/60 odd:bg-white hover:bg-[#F3EEFD] transition-all duration-150 group animate-fade-in"
                >
                  {/* Key */}
                  <td className="py-3.5 px-5 font-mono whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#F0EBFF] text-[#6257D9] font-bold text-xs border border-[#DDD3FA] shadow-2xs group-hover:border-[#6257D9]/50 transition-colors">
                      {keyFormatted}
                    </span>
                  </td>

                  {/* Title & Attachment Preview */}
                  <td className="py-3.5 px-5 max-w-sm sm:max-w-md">
                    <div className="flex items-center gap-2.5">
                      {issue.imageUrl && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage({
                              url: issue.imageUrl,
                              title: issue.title,
                            });
                          }}
                          className="shrink-0 p-1.5 rounded-lg text-[#6257D9] bg-[#F0EBFF] hover:bg-[#E3D9FF] transition-colors border border-[#DDD3FA]"
                          title="View screenshot attachment"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <div className="min-w-0">
                        <Link
                          to={`/issues/${issue._id}`}
                          state={{ from: location.pathname + location.search }}
                          className="font-semibold text-slate-900 group-hover:text-[#6257D9] transition-all duration-150 group-hover:translate-x-0.5 truncate block"
                          title={issue.title}
                        >
                          {issue.title}
                        </Link>
                        {issue.projectId?.name && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#5B42D6] bg-[#F5F2FE] px-2 py-0.5 rounded-md border border-[#E8E1FB]">
                              <FolderKanban className="w-3 h-3 text-[#6257D9]" />
                              <span>{issue.projectId.name}</span>
                            </span>
                            {issue.category && (
                              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">
                                {issue.category}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Status Dropdown to mark issue status (e.g. Resolved) directly in the table */}
                  <td className="py-3.5 px-5 whitespace-nowrap overflow-visible relative">
                    <StatusDropdown
                      issueId={issue._id}
                      currentStatus={issue.status}
                      onStatusChange={(newStatus, updatedData) => {
                        issue.status = newStatus;
                        if (onStatusChange) onStatusChange(issue._id, newStatus, updatedData);
                        if (onIssueUpdated) onIssueUpdated(issue._id, newStatus, updatedData);
                      }}
                    />
                  </td>

                  {/* Priority Pill with distinct colors per state */}
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <PriorityBadge priority={issue.priority} />
                  </td>

                  {/* Assignee */}
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    {issue.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          name={issue.assignedTo.name}
                          title={issue.assignedTo.jobTitle || issue.assignedTo.role}
                          avatar={issue.assignedTo.avatar}
                          size="sm"
                        />
                        <span
                          className="text-slate-800 font-semibold truncate max-w-[140px]"
                          title={issue.assignedTo.name}
                        >
                          {issue.assignedTo.name}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-slate-400 bg-slate-50 border border-dashed border-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <span>Unassigned</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Lightbox Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-700 truncate max-w-md">
                {previewImage.title}
              </span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close image preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center max-h-[75vh] overflow-auto">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
      {/* Floating Hover Description Preview Card */}
      <IssueHoverCard issue={hoveredIssue} position={hoverPosition} />
    </>
  );
};
