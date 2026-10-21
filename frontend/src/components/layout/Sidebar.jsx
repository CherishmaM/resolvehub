import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  PlusCircle,
  Users,
  Settings,
  LogOut,
  Layers,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'All Issues', path: '/issues', icon: CheckSquare },
    { name: 'New Issue', path: '/issues/new', icon: PlusCircle },
    { name: 'Team Members', path: '/team', icon: Users },
    { name: 'Settings & Profile', path: '/settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0a0e1a] text-slate-300 border-r border-slate-800/80">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 ring-1 ring-white/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-white tracking-tight">ResolveHub</h1>
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              Issue Tracking Platform
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3.5 py-5 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          WORKSPACE
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold shadow-sm shadow-indigo-600/30 border border-indigo-400/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
          <img
            src={
              user?.avatar ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`
            }
            alt={user?.name}
            className="w-9 h-9 rounded-full object-cover border border-slate-700 bg-slate-800 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                  isAdmin
                    ? 'bg-purple-900/60 text-purple-300 border border-purple-700/60'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 shadow-xl z-20">
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-full z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
