import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  ChevronDown,
  Settings,
  LogOut,
  CheckCircle2,
  X,
  FolderKanban,
  Check,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { UserAvatar } from '../ui/UserAvatar';

export const Topbar = ({ onToggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const { projects, currentProject, setCurrentProject } = useProject();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  const profileRef = useRef(null);
  const projectRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close menus on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (projectRef.current && !projectRef.current.contains(event.target)) {
        setShowProjectMenu(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowProfileMenu(false);
        setShowProjectMenu(false);
      }
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/issues?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/issues');
    }
  };

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 right-0 left-0 md:left-[70px] z-30 h-[65px] bg-[#EDE8FA]/40 backdrop-blur-[1px] border-b border-[#D0C4EC] px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sm:gap-4 transition-colors duration-200">
      {/* Left: Mobile Toggle & Project Switcher & Global Search */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 max-w-2xl">
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-[#6E678E] hover:text-[#282442] p-1.5 rounded-lg hover:bg-white/60 transition-colors"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Project Switcher Pill */}
        <div className="relative" ref={projectRef}>
          <button
            type="button"
            onClick={() => setShowProjectMenu(!showProjectMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-white/90 hover:bg-white border border-[#D9D0F2] hover:border-[#6257D9]/50 rounded-2xl shadow-2xs text-xs transition-all active:scale-[0.98]"
            title="Switch Workspace Project"
          >
            <FolderKanban className="w-3.5 h-3.5 text-[#6257D9]" />
            <div className="flex items-center gap-1.5 text-left max-w-[140px] sm:max-w-[180px] truncate">
              {currentProject ? (
                <>
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#EDE7F9] text-[#6257D9] border border-[#DDD3F5]">
                    {currentProject.key}
                  </span>
                  <span className="font-semibold text-slate-800 text-xs truncate hidden sm:inline">
                    {currentProject.name}
                  </span>
                </>
              ) : (
                <span className="text-[#7A7398] font-medium">Select Project</span>
              )}
            </div>
            <ChevronDown className="w-3 h-3 text-[#7A7398] shrink-0" />
          </button>

          {/* Project Switcher Dropdown */}
          {showProjectMenu && (
            <div className="absolute left-0 mt-2 w-64 bg-[#F2EDFC] rounded-2xl border border-[#D9D0F2] shadow-xl z-50 overflow-hidden animate-dropdown select-none">
              <div className="p-3 border-b border-[#DCD4F2] bg-[#EDE8FA] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Workspace Projects</p>
                  <p className="text-[10px] text-[#7A7398]">Switch active context</p>
                </div>
                <Link
                  to="/projects"
                  onClick={() => setShowProjectMenu(false)}
                  className="text-[10px] font-bold text-[#6257D9] hover:underline"
                >
                  All
                </Link>
              </div>

              <div className="p-1.5 max-h-56 overflow-y-auto space-y-0.5">
                {projects.map((p) => {
                  const isSelected = currentProject?._id === p._id;
                  return (
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => {
                        setCurrentProject(p);
                        setShowProjectMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors text-left ${
                        isSelected
                          ? 'bg-white text-[#5446C9] font-bold border border-[#D9CEF3] shadow-xs'
                          : 'hover:bg-white/60 text-[#3A3554]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#EDE7F9] text-[#6257D9] border border-[#DDD3F5] shadow-2xs shrink-0">
                          {p.key}
                        </span>
                        <span className="truncate">{p.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#6257D9] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {isAdmin && (
                <div className="p-2 border-t border-[#DCD4F2] bg-[#EDE8FA]">
                  <Link
                    to="/projects"
                    onClick={() => setShowProjectMenu(false)}
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl bg-white border border-[#D9D0F2] text-[#6257D9] hover:bg-white/80 text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create or Manage Projects</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global Issue Search Form */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md hidden sm:block">
          <div className="relative flex items-center group">
            <Search className="w-4 h-4 text-[#7A7398] group-focus-within:text-[#6257D9] absolute left-3.5 pointer-events-none transition-colors duration-200" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search issues by title, ref, or keyword..."
              className="w-full pl-9 pr-12 py-1.5 bg-white/90 border border-[#D9D0F2] rounded-2xl text-xs text-[#302D46] placeholder:text-[#7A7398] shadow-2xs focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#6257D9]/15 focus:border-[#6257D9] transition-all duration-200"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-[#7A7398] hover:text-[#302D46] p-0.5 rounded-full hover:bg-white/70 transition-all duration-150 animate-scale-in"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="hidden sm:inline-flex items-center absolute right-3 px-1.5 py-0.5 text-[10px] font-mono text-[#6257D9] bg-[#EDE7F9] rounded border border-[#DDD3F5] pointer-events-none">
                ⌘K
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Right: Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1 rounded-2xl hover:bg-white/60 transition-colors group"
            aria-label="User profile menu"
          >
            <UserAvatar
              name={user?.name}
              title={user?.jobTitle || (isAdmin ? 'Admin' : 'Engineer')}
              avatar={user?.avatar}
              size="md"
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-[#302D46] group-hover:text-[#6257D9] transition-colors truncate max-w-[120px]">
                {user?.name || 'User'}
              </span>
              <span className="text-[10px] text-[#7A7398] truncate max-w-[120px]">
                {user?.jobTitle || (isAdmin ? 'Admin' : 'Engineer')}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#7A7398] group-hover:text-[#302D46] hidden sm:block transition-transform duration-200" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-[#F2EDFC] rounded-2xl border border-[#D9D0F2] shadow-xl z-50 overflow-hidden animate-dropdown select-none">
              <div className="p-4 border-b border-[#DCD4F2] bg-[#EDE8FA]">
                <p className="text-xs font-bold text-[#302D46] truncate">{user?.name}</p>
                <p className="text-[11px] text-[#7A7398] truncate">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#EDE7F9] text-[#6257D9] border border-[#DDD3F5]">
                    {isAdmin ? 'Organization Admin' : 'Team Member'}
                  </span>
                  <span className="text-[10px] text-[#7A7398] font-medium truncate">
                    {user?.jobTitle || 'Engineer'}
                  </span>
                </div>
              </div>

              <div className="p-1.5 space-y-0.5 text-xs text-[#302D46]">
                <Link
                  to="/projects"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/70 hover:text-[#5446C9] transition-colors"
                >
                  <FolderKanban className="w-4 h-4 text-[#7A7398]" />
                  <span>Projects & Workspaces</span>
                </Link>

                <Link
                  to="/issues?assignedTo=me"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/70 hover:text-[#5446C9] transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#7A7398]" />
                  <span>My Assigned Issues</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/70 hover:text-[#5446C9] transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#7A7398]" />
                  <span>Account & Settings</span>
                </Link>
              </div>

              <div className="p-1.5 border-t border-[#DCD4F2] bg-[#EDE8FA]">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-100/70 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
