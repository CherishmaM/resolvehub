import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Lightbulb,
  PlusCircle,
  Users,
  X,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Logo } from '../ui/Logo';
import { NavHoverPreview } from './NavHoverPreview';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { projects, currentProject, setCurrentProject } = useProject();

  const [hoveredNavPath, setHoveredNavPath] = useState(null);
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = (path) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredNavPath(path);
    }, 180);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredNavPath(null);
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Projects',
      path: '/projects',
      icon: FolderKanban,
    },
    {
      name: 'Bug Tracker',
      path: '/issues',
      icon: CheckSquare,
    },
    {
      name: 'Brainstorming',
      path: '/ideas',
      icon: Lightbulb,
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
    if (path === '/projects') {
      return location.pathname === '/projects' || location.pathname.startsWith('/projects/');
    }
    if (path === '/issues/new') {
      return location.pathname === '/issues/new';
    }
    if (path === '/issues') {
      return (
        location.pathname === '/issues' ||
        (location.pathname.startsWith('/issues/') && location.pathname !== '/issues/new')
      );
    }
    if (path === '/ideas') {
      return (
        location.pathname === '/ideas' ||
        location.pathname.startsWith('/ideas/') ||
        location.pathname === '/brainstorm'
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
    <div className="relative flex flex-col h-full bg-transparent text-[#302D46] border-r border-[#EAE5F7]/70 select-none overflow-visible">
      {/* Brand Header with Theme-Matched Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAE5F7]/70 relative z-10 bg-transparent">
        <Link to="/dashboard" className="flex items-center hover:opacity-90 transition-opacity">
          <Logo size="md" />
        </Link>

        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-[#85819C] hover:text-[#302D46] p-1.5 rounded-lg hover:bg-[#6257D9]/10 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-visible relative z-10 bg-transparent">
        <p className="px-3 pb-2 text-[10px] font-bold tracking-wider text-[#85819C] uppercase">
          MAIN
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item.path);
          return (
            <div
              key={item.path}
              className="relative"
              onMouseEnter={() => handleMouseEnter(item.path)}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                to={item.path}
                onClick={onClose}
                className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-200 active:scale-[0.98] group ${
                  active
                    ? 'bg-[#6257D9]/10 text-[#6257D9] font-semibold border border-[#6257D9]/20 shadow-2xs'
                    : 'text-[#302D46] hover:text-[#272443] hover:bg-[#6257D9]/[0.06] font-medium hover:translate-x-0.5'
                }`}
              >
                {/* Slim purple accent indicator on the left of active item */}
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#6257D9] shadow-[0_0_8px_rgba(98,87,217,0.5)]" />
                )}
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                    active
                      ? 'text-[#6257D9] stroke-[2.2]'
                      : 'text-[#6257D9]/70 group-hover:text-[#6257D9] stroke-[1.8]'
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </Link>

              {/* Navigation Hover Preview (Feature 2) */}
              <NavHoverPreview
                path={item.path}
                isVisible={hoveredNavPath === item.path}
                currentProject={currentProject}
              />
            </div>
          );
        })}

        {/* Assigned Projects Section (Feature 1) */}
        {projects && projects.length > 0 && (
          <div className="pt-4 space-y-1">
            <div className="flex items-center justify-between px-3 pb-1.5">
              <p className="text-[10px] font-bold tracking-wider text-[#85819C] uppercase">
                YOUR PROJECTS
              </p>
              <Link
                to="/projects"
                onClick={onClose}
                className="text-[10px] font-bold text-[#6257D9] hover:underline"
              >
                All
              </Link>
            </div>

            <div className="space-y-0.5">
              {projects.slice(0, 5).map((proj) => {
                const isCurrent = currentProject?._id === proj._id;
                return (
                  <button
                    key={proj._id}
                    type="button"
                    onClick={() => {
                      setCurrentProject(proj);
                      if (onClose) onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left ${
                      isCurrent
                        ? 'bg-[#6257D9]/10 text-[#6257D9] font-bold border border-[#6257D9]/20 shadow-2xs'
                        : 'text-[#302D46] hover:bg-[#6257D9]/[0.06] font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#F0EBFF] text-[#6257D9] border border-[#E3D9FF] shrink-0">
                        {proj.key}
                      </span>
                      <span className="truncate text-xs">{proj.name}</span>
                    </div>
                    {isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6257D9] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Clean minimal footer */}
      <div className="px-5 py-3 border-t border-[#EAE5F7]/50 flex items-center justify-between text-[11px] text-[#85819C]/70 relative z-10 bg-transparent">
        <span className="font-medium text-[#4A4568]">ResolveHub</span>
        <span className="font-mono text-[10px] text-[#85819C]/60">v1.1.0</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 z-20 bg-transparent">
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-[#272443]/30 transition-opacity"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 w-64 max-w-full z-10 shadow-xl bg-[#FAF9FF]/95">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
