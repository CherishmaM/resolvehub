import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { ErrorMessage } from '../ui/ErrorMessage';

export const CommentForm = ({ onSubmit, loading = false }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!text.trim()) {
      setError('Comment cannot be empty.');
      return;
    }

    if (text.trim().length > 1000) {
      setError('Comment cannot exceed 1000 characters.');
      return;
    }

    onSubmit(text.trim(), () => {
      setText('');
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      {error && <ErrorMessage message={error} />}

      <div className="relative">
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment or status update..."
          maxLength={1000}
          disabled={loading}
          className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-slate-50"
        />
        <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
          <span>{text.length}/1000 characters</span>
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{loading ? 'Posting...' : 'Post Comment'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
