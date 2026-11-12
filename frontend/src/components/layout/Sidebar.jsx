import React, { useState } from 'react';
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
} from 'lucide-react';
import { Logo, LogoMark } from '../ui/Logo';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { projects, currentProject, setCurrentProject } = useProject();
  const [isHovered, setIsHovered] = useState(false);

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

  const renderContent = (isExpanded) => (
    <div className="relative flex flex-col h-full text-[#302D46] select-none overflow-hidden">
      {/* Brand Header */}
      <div className={`flex items-center ${isExpanded ? 'justify-between px-5' : 'justify-center px-2'} py-4 border-b border-[#EAE5F7]/70 shrink-0 h-[65px] transition-all duration-200`}>
        <Link
          to="/dashboard"
          className="flex items-center hover:opacity-90 transition-opacity"
          title="ResolveHub"
        >
          {isExpanded ? (
            <Logo size="md" />
          ) : (
            <LogoMark size="md" />
          )}
        </Link>

        {onClose && isExpanded && (
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
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {isExpanded && (
          <p className="px-3 pb-2 text-[10px] font-bold tracking-wider text-[#85819C] uppercase animate-fade-in">
            MAIN
          </p>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                if (onClose) onClose();
                setIsHovered(false);
              }}
              title={!isExpanded ? item.name : undefined}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-200 active:scale-[0.98] group ${
                !isExpanded ? 'justify-center px-0' : ''
              } ${
                active
                  ? 'bg-[#6257D9]/10 text-[#6257D9] font-semibold border border-[#6257D9]/20 shadow-2xs'
                  : 'text-[#302D46] hover:text-[#272443] hover:bg-[#6257D9]/[0.06] font-medium'
              }`}
            >
              {/* Active left indicator */}
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

              {isExpanded && (
                <span className="truncate whitespace-nowrap animate-fade-in">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}

        {/* Assigned Projects Section */}
        {projects && projects.length > 0 && (
          <div className="pt-4 space-y-1">
            {isExpanded ? (
              <>
                <div className="flex items-center justify-between px-3 pb-1.5">
                  <p className="text-[10px] font-bold tracking-wider text-[#85819C] uppercase">
                    YOUR PROJECTS
                  </p>
                  <Link
                    to="/projects"
                    onClick={() => {
                      if (onClose) onClose();
                      setIsHovered(false);
                    }}
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
                          setIsHovered(false);
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
              </>
            ) : (
              <div className="pt-2 border-t border-[#EAE5F7]/70 flex flex-col items-center gap-1.5">
                <Link
                  to="/projects"
                  title="View Projects"
                  className="p-1.5 rounded-xl hover:bg-[#6257D9]/10 text-slate-400 hover:text-[#6257D9] transition-colors"
                >
                  <FolderKanban className="w-4 h-4" />
                </Link>
                {currentProject && (
                  <span
                    className="font-mono text-[8px] font-bold px-1 py-0.5 rounded bg-[#F0EBFF] text-[#6257D9] border border-[#E3D9FF]"
                    title={`Active: ${currentProject.name}`}
                  >
                    {currentProject.key.slice(0, 3)}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className={`px-4 py-3 border-t border-[#EAE5F7]/50 flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} text-[11px] text-[#85819C]/70 shrink-0 h-[45px] transition-all duration-200`}>
        {isExpanded ? (
          <>
            <span className="font-medium text-[#4A4568]">ResolveHub</span>
            <span className="font-mono text-[10px] text-[#85819C]/60">v1.1.0</span>
          </>
        ) : (
          <span className="font-mono text-[9px] text-[#85819C]/60">v1.1</span>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop collapsible rail with hover-to-expand */}
      <div
        className="hidden md:block w-[70px] shrink-0 h-screen relative z-30 select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <aside
          className={`fixed left-0 top-0 h-screen flex flex-col transition-all duration-300 ease-in-out border-r border-[#EAE5F7]/80 ${
            isHovered
              ? 'w-64 bg-white/98 backdrop-blur-md shadow-2xl shadow-[#6257D9]/15'
              : 'w-[70px] bg-white/80 backdrop-blur-sm shadow-xs'
          }`}
        >
          {renderContent(isHovered)}
        </aside>
      </div>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-[#272443]/30 transition-opacity"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 w-64 max-w-full z-10 shadow-xl bg-white">
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
