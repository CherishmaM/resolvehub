import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  PlusCircle,
  Users,
  Settings,
  X,
} from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../ui/UserAvatar';

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

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
    <div className="relative flex flex-col h-full bg-gradient-to-b from-[#F6F3FF] via-[#F5F2FE] to-[#F7F4FF] text-[#302D46] border-r border-[#EAE5F7] select-none overflow-hidden">
      {/* Subtle faint lavender glow in top-left behind brand */}
      <div
        className="absolute -top-16 -left-16 w-44 h-44 rounded-full bg-gradient-to-br from-[#6257D9]/10 via-[#818CF8]/5 to-transparent blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Brand Header with Theme-Matched Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAE5F7] relative z-10">
        <Link to="/dashboard" className="flex items-center hover:opacity-90 transition-opacity">
          <Logo size="md" />
        </Link>

        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-[#85819C] hover:text-[#302D46] p-1.5 rounded-lg hover:bg-[#ECE7FF] transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto relative z-10">
        <p className="px-3 pb-2 text-[10px] font-bold tracking-wider text-[#85819C] uppercase">
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
              className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-200 active:scale-[0.98] group ${
                active
                  ? 'bg-[#EAE4FF] text-[#6257D9] font-semibold shadow-2xs'
                  : 'text-[#85819C] hover:text-[#302D46] hover:bg-[#ECE7FF] font-medium hover:translate-x-0.5'
              }`}
            >
              {/* Slim purple accent indicator on the left of active item */}
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#6257D9] shadow-[0_0_8px_rgba(98,87,217,0.4)]" />
              )}
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                  active
                    ? 'text-[#6257D9] stroke-[2.2]'
                    : 'text-[#85819C] group-hover:text-[#6257D9] stroke-[1.8]'
                }`}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Integrated Profile / Account Area at Bottom */}
      {user ? (
        <div className="p-3 border-t border-[#EAE5F7] bg-[#F3EFFF]/40 relative z-10">
          <Link
            to="/settings"
            onClick={onClose}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#ECE7FF] transition-all duration-200 group"
            title="Account Settings"
          >
            <UserAvatar
              name={user.name}
              avatar={user.avatar}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#302D46] truncate group-hover:text-[#6257D9] transition-colors">
                {user.name}
              </p>
              <p className="text-[10px] text-[#85819C] truncate">
                {user.jobTitle || (user.role === 'admin' ? 'Administrator' : 'Team Member')}
              </p>
            </div>
            <Settings className="w-3.5 h-3.5 text-[#85819C] group-hover:text-[#6257D9] group-hover:rotate-45 transition-all duration-200 shrink-0" />
          </Link>
        </div>
      ) : (
        <div className="px-5 py-3.5 border-t border-[#EAE5F7] bg-[#F3EFFF]/30 flex items-center justify-between text-[11px] text-[#85819C] relative z-10">
          <span className="font-medium text-[#5E597B]">ResolveHub</span>
          <span className="font-mono text-[10px] text-[#85819C]">v1.0.0</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar - integrated seamlessly without heavy drop shadows */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-[#272443]/40 backdrop-blur-xs transition-opacity"
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