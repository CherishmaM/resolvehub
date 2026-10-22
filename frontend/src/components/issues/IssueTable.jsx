import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../ui/StatusBadge';
import { PriorityBadge } from '../ui/PriorityBadge';
import { UserAvatar } from '../ui/UserAvatar';
import { Image as ImageIcon, X } from 'lucide-react';

export const IssueTable = ({ issues = [] }) => {
  const [previewImage, setPreviewImage] = useState(null);

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
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-white text-xs font-semibold text-slate-900">
              <th className="py-3.5 px-5">Key</th>
              <th className="py-3.5 px-5">Title</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5">Priority</th>
              <th className="py-3.5 px-5">Assignee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80 text-xs">
            {issues.map((issue) => {
              const keyFormatted = `TF-${issue._id.slice(-4).toUpperCase()}`;

              return (
                <tr
                  key={issue._id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Key */}
                  <td className="py-4 px-5 font-medium text-slate-500 whitespace-nowrap">
                    {keyFormatted}
                  </td>

                  {/* Title & Attachment Preview */}
                  <td className="py-4 px-5 max-w-sm sm:max-w-md">
                    <div className="flex items-center gap-2.5">
                      {issue.imageUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewImage({
                              url: issue.imageUrl,
                              title: issue.title,
                            })
                          }
                          className="shrink-0 p-1 rounded-md text-slate-400 hover:text-[#5b42d6] hover:bg-slate-100 transition-colors"
                          title="View screenshot attachment"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <Link
                        to={`/issues/${issue._id}`}
                        className="font-semibold text-slate-900 group-hover:text-[#5b42d6] transition-colors truncate block"
                        title={issue.title}
                      >
                        {issue.title}
                      </Link>
                    </div>
                  </td>

                  {/* Status Pill matching Reference Image 2 */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <StatusBadge status={issue.status} />
                  </td>

                  {/* Priority Pill matching Reference Image 2 */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <PriorityBadge priority={issue.priority} />
                  </td>

                  {/* Assignee with Violet Circle Initials Avatar matching Image 2 */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    {issue.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          name={issue.assignedTo.name}
                          title={issue.assignedTo.jobTitle || issue.assignedTo.role}
                          avatar={issue.assignedTo.avatar}
                          size="sm"
                        />
                        <span
                          className="text-slate-700 font-medium truncate max-w-[140px]"
                          title={issue.assignedTo.name}
                        >
                          {issue.assignedTo.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
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
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2"
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
    </>
  );
};
