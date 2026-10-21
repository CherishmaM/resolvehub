import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Helper to dynamically get current page title from pathname
  const getPageTitle = (pathname) => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/issues') return 'Issues Tracker';
    if (pathname === '/issues/new') return 'Create New Issue';
    if (pathname.startsWith('/issues/')) return 'Issue Details';
    if (pathname === '/team') return 'Team Directory';
    if (pathname === '/settings') return 'Account & Settings';
    return '';
  };

  const title = getPageTitle(location.pathname);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onToggleSidebar={() => setSidebarOpen(true)} title={title} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
