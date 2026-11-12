import React from 'react';
import { StatusBadge } from '../ui/StatusBadge';
import { PriorityBadge } from '../ui/PriorityBadge';
import { UserAvatar } from '../ui/UserAvatar';
import { 
  FolderKanban, 
  FileText, 
  Image as ImageIcon, 
  ArrowRight,
  Calendar
} from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

export const IssueHoverCard = ({ issue, position }) => {
  if (!issue || !position) return null;

  const projectKey = issue.projectId?.key || 'TF';
  const keyFormatted = `${projectKey}-${issue._id.slice(-4).toUpperCase()}`;
  const projectName = issue.projectId?.name || 'Core Platform';

  return (
    <div
      style={{
        position: 'fixed',
        top: position.top,
        bottom: position.bottom,
        left: `${position.left}px`,
        width: '380px',
        maxWidth: 'calc(100vw - 32px)',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
      className="hidden md:block bg-white/98 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl shadow-[#6257D9]/15 p-4 space-y-3 animate-fade-in transition-all duration-150"
    >
      {/* Top Header: Key, Project, Priority, Status */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-mono text-[10px] font-bold text-[#6257D9] bg-[#EDE9FE] border border-[#DDD6FE] px-2 py-0.5 rounded-md">
            {keyFormatted}
          </span>
          <span className="text-[11px] font-medium text-slate-500 truncate flex items-center gap-1">
            <FolderKanban className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{projectName}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <PriorityBadge priority={issue.priority} />
          <StatusBadge status={issue.status} />
        </div>
      </div>

      {/* Bug Title & Category */}
      <div>
        <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
          {issue.title}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Category: <span className="text-slate-600 font-medium normal-case">{issue.category}</span>
          </span>
          {issue.imageUrl && (
            <span className="inline-flex items-center gap-1 text-[10px] text-[#6257D9] bg-[#F0EBFF] px-1.5 py-0.5 rounded font-medium">
              <ImageIcon className="w-3 h-3" />
              <span>Screenshot</span>
            </span>
          )}
        </div>
      </div>

      {/* Description Preview Box */}
      <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-100 space-y-1.5">
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <FileText className="w-3 h-3 text-slate-400" />
          <span>Description Preview</span>
        </div>

        {issue.description ? (
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line line-clamp-5 max-h-36 overflow-hidden">
            {issue.description}
          </p>
        ) : (
          <p className="text-xs text-slate-400 italic">No description provided for this issue.</p>
        )}
      </div>

      {/* Footer: Assignee & Created Time */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-2 min-w-0">
          {issue.assignedTo ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <UserAvatar
                name={issue.assignedTo.name}
                avatar={issue.assignedTo.avatar}
                size="xs"
              />
              <span className="text-[11px] font-medium text-slate-700 truncate max-w-[120px]">
                {issue.assignedTo.name}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 italic">Unassigned</span>
          )}
          {issue.createdAt && (
            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
              • {formatRelativeTime(issue.createdAt)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[10px] font-semibold text-[#6257D9] shrink-0">
          <span>View Issue</span>
          <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};
