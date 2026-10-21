import React from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../ui/StatusBadge';
import { PriorityBadge } from '../ui/PriorityBadge';
import { formatDate, getCategoryBadgeStyle } from '../../utils/formatters';
import { ArrowUpRight } from 'lucide-react';

export const IssueTable = ({ issues = [] }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <th className="py-3 px-4">Ref</th>
            <th className="py-3 px-4">Title & Category</th>
            <th className="py-3 px-4">Priority</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Assignee</th>
            <th className="py-3 px-4">Created</th>
            <th className="py-3 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs">
          {issues.map((issue) => {
            const shortId = issue._id.slice(-6).toUpperCase();
            const categoryStyle = getCategoryBadgeStyle(issue.category);

            return (
              <tr
                key={issue._id}
                className="hover:bg-slate-50/80 transition-colors group"
              >
                {/* Reference ID */}
                <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                  #{shortId}
                </td>

                {/* Title & Category */}
                <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border shrink-0 ${categoryStyle}`}
                    >
                      {issue.category}
                    </span>
                    <Link
                      to={`/issues/${issue._id}`}
                      className="font-medium text-slate-800 hover:text-indigo-600 transition-colors truncate block"
                    >
                      {issue.title}
                    </Link>
                  </div>
                </td>

                {/* Priority */}
                <td className="py-3.5 px-4">
                  <PriorityBadge priority={issue.priority} />
                </td>

                {/* Status */}
                <td className="py-3.5 px-4">
                  <StatusBadge status={issue.status} />
                </td>

                {/* Assignee */}
                <td className="py-3.5 px-4">
                  {issue.assignedTo ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          issue.assignedTo.avatar ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(issue.assignedTo.name)}`
                        }
                        alt={issue.assignedTo.name}
                        className="w-5 h-5 rounded-full object-cover border border-slate-200"
                      />
                      <span className="text-slate-700 font-medium truncate max-w-[120px]">
                        {issue.assignedTo.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Unassigned</span>
                  )}
                </td>

                {/* Created Date */}
                <td className="py-3.5 px-4 text-slate-500">
                  {formatDate(issue.createdAt)}
                </td>

                {/* Action Link */}
                <td className="py-3.5 px-4 text-right">
                  <Link
                    to={`/issues/${issue._id}`}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                  >
                    <span>View</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
