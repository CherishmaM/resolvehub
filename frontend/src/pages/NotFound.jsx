import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home } from 'lucide-react';
import { WireframeBackground } from '../components/ui/WireframeBackground';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9ff] via-[#f3f4fe] to-[#ebeeff] flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
      <WireframeBackground variant="auth" />
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="p-4 bg-[#f3f0ff] text-[#5b42d6] border border-[#e0d9fc] rounded-2xl mb-4 shadow-sm animate-subtle-bounce">
          <HelpCircle className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">404</h1>
        <h2 className="text-lg font-bold text-slate-800 mt-1">Page Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mt-2">
          The page you are looking for doesn't exist or has been moved to another route.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#5b42d6] hover:bg-[#4c35c2] rounded-xl shadow-sm shadow-[#5b42d6]/20 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};
