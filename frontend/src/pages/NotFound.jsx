import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-4">
        <HelpCircle className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <h2 className="text-lg font-bold text-slate-800 mt-1">Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-sm mt-2">
        The page you are looking for doesn't exist or has been moved to another route.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};
