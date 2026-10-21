import React from 'react';
import { Menu, Plus, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Topbar = ({ onToggleSidebar, title }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200/70 px-4 sm:px-6 py-3 flex items-center justify-between shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && <h2 className="text-base font-bold text-slate-900 tracking-tight">{title}</h2>}
      </div>

      <div className="flex items-center gap-3.5">
        <Link
          to="/issues/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Report Issue</span>
        </Link>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        <Link
          to="/settings"
          title="Account Settings & Profile"
          className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-colors group"
        >
          <img
            src={
              user?.avatar ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`
            }
            alt={user?.name}
            className="w-8 h-8 rounded-full object-cover border border-slate-200/80 group-hover:border-indigo-400 transition-colors shadow-2xs"
          />
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
              {user?.name}
            </span>
            <span className="text-[10px] text-slate-400 capitalize">
              {user?.role}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};
