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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../ui/UserAvatar';

export const Topbar = ({ onToggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close profile dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowProfileMenu(false);
      }
      // Global shortcut ⌘K or Ctrl+K focuses the search input
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
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Global Issue Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Issue Search Form matching Reference Design Image 1 */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-lg">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search issues by title, ref, or keyword..."
              className="w-full pl-9 pr-12 py-2 bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 shadow-2xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5b42d6]/20 focus:border-[#5b42d6] transition-all"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="hidden sm:inline-flex items-center absolute right-3 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 rounded border border-slate-200 pointer-events-none">
                ⌘K
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Right: Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Profile Chip */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1 rounded-2xl hover:bg-slate-50 transition-colors group"
            aria-label="User profile menu"
          >
            <UserAvatar
              name={user?.name}
              title={user?.jobTitle || (isAdmin ? 'Admin' : 'Engineer')}
              avatar={user?.avatar}
              size="md"
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#5b42d6] transition-colors truncate max-w-[120px]">
                {user?.name || 'User'}
              </span>
              <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                {user?.jobTitle || (isAdmin ? 'Project Manager' : 'Engineer')}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 hidden sm:block transition-transform duration-200" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 overflow-hidden animate-fade-in select-none">
              {/* User Identity Header */}
              <div className="p-4 border-b border-slate-100 bg-[#fbfbfe]">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#ede9fe] text-[#5b42d6]">
                    {isAdmin ? 'System Admin' : 'Team Member'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium truncate">
                    {user?.jobTitle || 'Engineer'}
                  </span>
                </div>
              </div>

              {/* Action Links */}
              <div className="p-1.5 space-y-0.5 text-xs text-slate-700">
                <Link
                  to="/issues?assignedTo=me"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#ede9fe]/60 hover:text-[#5b42d6] transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-400" />
                  <span>My Assigned Issues</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#ede9fe]/60 hover:text-[#5b42d6] transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Account & Settings</span>
                </Link>
              </div>

              {/* Sign out */}
              <div className="p-1.5 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
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
