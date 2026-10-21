import React from 'react';
import { Menu, Plus, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Topbar = ({ onToggleSidebar, title }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-slate-500 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && <h2 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h2>}
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/issues/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Issue</span>
        </Link>

        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2 pl-1">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
            alt={user?.name}
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
          <span className="hidden md:block text-xs font-semibold text-slate-700">
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  );
};
