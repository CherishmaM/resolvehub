import React from 'react';
import { AlertCircle } from 'lucide-react';

export const ErrorMessage = ({ message, errors = [], onRetry }) => {
  if (!message) return null;

  return (
    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm animate-slide-down">
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-rose-900">{message}</p>
          {errors && errors.length > 0 && (
            <ul className="list-disc list-inside mt-1.5 space-y-0.5 text-xs text-rose-700">
              {errors.map((err, idx) => (
                <li key={idx}>
                  {err.field ? <span className="font-medium">{err.field}: </span> : null}
                  {err.message}
                </li>
              ))}
            </ul>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-xs font-semibold text-rose-700 underline hover:text-rose-900"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
