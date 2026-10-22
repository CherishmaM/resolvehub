import React from 'react';
import {
  PlusCircle,
  UserCheck,
  RefreshCw,
  AlertCircle,
  Edit3,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

const getActionIcon = (action) => {
  switch (action) {
    case 'Created':
      return { icon: PlusCircle, color: 'text-[#5b42d6] bg-[#f3f0ff] border-[#e0d9fc]' };
    case 'Assigned':
      return { icon: UserCheck, color: 'text-purple-600 bg-purple-50 border-purple-200' };
    case 'Status Changed':
      return { icon: RefreshCw, color: 'text-[#5b42d6] bg-[#f3f0ff] border-[#e0d9fc]' };
    case 'Priority Changed':
      return { icon: AlertCircle, color: 'text-amber-600 bg-amber-50 border-amber-200' };
    case 'Comment Added':
      return { icon: MessageSquare, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    case 'Updated':
    default:
      return { icon: Edit3, color: 'text-slate-600 bg-slate-50 border-slate-200' };
  }
};

const renderActionDetails = (action, details) => {
  if (!details) return null;

  switch (action) {
    case 'Status Changed':
      return (
        <span className="text-slate-600">
          changed status from <span className="font-semibold text-slate-800">{details.fromStatus}</span> to{' '}
          <span className="font-semibold text-slate-800">{details.toStatus}</span>
        </span>
      );
    case 'Assigned':
      return (
        <span className="text-slate-600">
          reassigned issue to <span className="font-semibold text-slate-800">{details.toAssignee}</span>
        </span>
      );
    case 'Priority Changed':
      return (
        <span className="text-slate-600">
          changed priority from <span className="font-semibold text-slate-800">{details.fromPriority}</span> to{' '}
          <span className="font-semibold text-slate-800">{details.toPriority}</span>
        </span>
      );
    case 'Created':
      return (
        <span className="text-slate-600">
          created this issue with priority <span className="font-semibold text-slate-800">{details.priority}</span>
        </span>
      );
    case 'Comment Added':
      return <span className="text-slate-600">posted a comment on this issue</span>;
    case 'Updated':
      return <span className="text-slate-600">updated issue details</span>;
    default:
      return null;
  }
};

export const ActivityTimeline = ({ activities = [] }) => {
  if (activities.length === 0) {
    return (
      <div className="text-xs text-slate-400 py-4 text-center">
        No recorded activity yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
      {activities.map((act) => {
        const { icon: Icon, color } = getActionIcon(act.action);
        const actorName = act.actorId?.name || 'System / Deleted User';

        return (
          <div key={act._id} className="relative flex items-start gap-3">
            {/* Timeline icon node */}
            <div
              className={`absolute -left-6 mt-0.5 w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${color}`}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>

            {/* Content body */}
            <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-800">{actorName}</span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3" />
                  {formatRelativeTime(act.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-slate-600 leading-relaxed">
                {renderActionDetails(act.action, act.details)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
