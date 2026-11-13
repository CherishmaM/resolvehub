import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { WireframeBackground } from '../ui/WireframeBackground';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/projects') return 'Projects & Workspaces';
    if (pathname.startsWith('/projects/')) return 'Project Workspace';
    if (pathname === '/issues') return 'Bug Tracker';
    if (pathname === '/issues/new') return 'New Issue';
    if (pathname.startsWith('/issues/')) return 'Issue Details';
    if (pathname === '/ideas' || pathname === '/brainstorm') return 'Brainstorming Ideas';
    if (pathname === '/team') return 'Team Directory';
    if (pathname === '/settings') return 'Settings';
    return '';
  };

  const title = getPageTitle(location.pathname);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#F7F5FE] via-[#F1ECFB] to-[#E9E1F7] text-[#302D46] font-sans selection:bg-[#6257D9] selection:text-white relative overflow-x-hidden">
      {/* Dynamic 3D wireframe background & ambient lighting */}
      <WireframeBackground variant="app" />

      {/* Top-left subtle ambient glow to unify canvas behind sidebar */}
      <div
        className="fixed -top-32 -left-32 pointer-events-none select-none z-0 overflow-hidden w-[480px] h-[480px] rounded-full bg-gradient-to-br from-[#e0e7ff]/40 to-[#ddd6fe]/20 blur-3xl opacity-40 animate-ambient-drift"
        aria-hidden="true"
      />

      {/* Subtle organic accent on bottom-right - lowered opacity so 3D background stays clearly visible */}
      <div
        className="fixed bottom-0 right-0 pointer-events-none select-none z-0 overflow-hidden w-[420px] h-[420px] sm:w-[600px] sm:h-[600px] lg:w-[760px] lg:h-[760px] opacity-20"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 600 600"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer large lavender arc */}
          <circle cx="600" cy="600" r="520" fill="url(#waveGrad1)" />
          {/* Middle soft periwinkle arc */}
          <circle cx="600" cy="600" r="370" fill="url(#waveGrad2)" />
          {/* Inner lavender wave highlight */}
          <circle cx="600" cy="600" r="220" fill="url(#waveGrad3)" />

          <defs>
            <radialGradient
              id="waveGrad1"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(600 600) rotate(-90) scale(520)"
            >
              <stop stopColor="#e8eafc" stopOpacity="0.55" />
              <stop offset="1" stopColor="#edf0ff" stopOpacity="0.1" />
            </radialGradient>
            <radialGradient
              id="waveGrad2"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(600 600) rotate(-90) scale(370)"
            >
              <stop stopColor="#ddd8fd" stopOpacity="0.6" />
              <stop offset="1" stopColor="#e8eafc" stopOpacity="0.25" />
            </radialGradient>
            <radialGradient
              id="waveGrad3"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(600 600) rotate(-90) scale(220)"
            >
              <stop stopColor="#c7bffd" stopOpacity="0.65" />
              <stop offset="1" stopColor="#ddd8fd" stopOpacity="0.35" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Main Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Right Column Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Topbar onToggleSidebar={() => setSidebarOpen(true)} title={title} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-[81px] sm:pt-[89px] lg:pt-[97px] max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
