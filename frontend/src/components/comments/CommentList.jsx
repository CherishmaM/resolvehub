import React from 'react';
import { formatRelativeTime } from '../../utils/formatters';
import { MessageSquare } from 'lucide-react';

export const CommentList = ({ comments = [] }) => {
  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50/60 rounded-xl border border-dashed border-slate-200 text-center">
        <MessageSquare className="w-6 h-6 text-slate-300 mb-2" />
        <p className="text-xs font-medium text-slate-600">No comments yet</p>
        <p className="text-[11px] text-slate-400">
          Be the first to share an update or question on this issue.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {comments.map((comment) => {
        const author = comment.userId || {};
        const isAdmin = author.role === 'admin';

        return (
          <div
            key={comment._id}
            className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-2 transition-all hover:border-slate-300"
          >
            {/* Header with Author and Timestamp */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={
                    author.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(author.name || 'User')}`
                  }
                  alt={author.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200 bg-slate-100"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-800">
                      {author.name || 'Deleted User'}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        isAdmin
                          ? 'bg-[#f3f0ff] text-[#5b42d6] border border-[#e0d9fc]'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {author.role || 'member'}
                    </span>
                    {author.jobTitle && (
                      <span className="text-[10px] text-slate-400">
                        • {author.jobTitle}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-slate-400">
                {formatRelativeTime(comment.createdAt)}
              </span>
            </div>

            {/* Comment Body */}
            <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed pl-9">
              {comment.text}
            </p>
          </div>
        );
      })}
    </div>
  );
};
