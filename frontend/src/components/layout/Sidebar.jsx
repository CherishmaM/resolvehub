import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  PlusCircle,
  Users,
  X,
  ChevronsLeft,
} from 'lucide-react';
import { Logo } from '../ui/Logo';

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Bug Tracker',
      path: '/issues',
      icon: CheckSquare,
    },
    {
      name: 'New Issue',
      path: '/issues/new',
      icon: PlusCircle,
    },
    {
      name: 'Team Members',
      path: '/team',
      icon: Users,
    },
  ];

  const isItemActive = (path) => {
    if (path === '/issues/new') {
      return location.pathname === '/issues/new';
    }
    if (path === '/issues') {
      return (
        location.pathname === '/issues' ||
        (location.pathname.startsWith('/issues/') && location.pathname !== '/issues/new')
      );
    }
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    if (path === '/team') {
      return location.pathname === '/team' || location.pathname.startsWith('/team/');
    }
    return location.pathname === path;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-slate-700 border-r border-[#eef0f6] select-none">
      {/* Brand Header with Theme-Matched Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#f1f2f7]">
        <Link to="/dashboard" className="flex items-center hover:opacity-95 transition-opacity">
          <Logo size="md" />
        </Link>

        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          className="hidden md:inline-flex text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          title="Sidebar view"
          aria-label="Sidebar view"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3.5 py-5 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          MAIN
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs transition-all duration-200 active:scale-[0.98] ${
                active
                  ? 'bg-[#ede9fe]/90 text-[#5b42d6] font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#f8f9fc] font-medium'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 stroke-[1.8] ${
                  active ? 'text-[#5b42d6]' : 'text-slate-400'
                }`}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Minimal Footer */}
      <div className="px-5 py-3.5 border-t border-[#f1f2f7] bg-[#fbfbfe]/50 flex items-center justify-between text-[11px] text-slate-400">
        <span className="font-medium text-slate-500">ResolveHub</span>
        <span className="font-mono text-[10px] text-slate-400">v1.0.0</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 shadow-xs z-20">
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 w-64 max-w-full z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
