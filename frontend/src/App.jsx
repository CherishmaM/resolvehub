import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

// Code-split all page routes to shrink initial bundle and ensure instantaneous page loading
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then((m) => ({ default: m.Register })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Projects = lazy(() => import('./pages/Projects').then((m) => ({ default: m.Projects })));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails').then((m) => ({ default: m.ProjectDetails })));
const Issues = lazy(() => import('./pages/Issues').then((m) => ({ default: m.Issues })));
const CreateIssue = lazy(() => import('./pages/CreateIssue').then((m) => ({ default: m.CreateIssue })));
const IssueDetails = lazy(() => import('./pages/IssueDetails').then((m) => ({ default: m.IssueDetails })));
const Brainstorming = lazy(() => import('./pages/Brainstorming').then((m) => ({ default: m.Brainstorming })));
const Team = lazy(() => import('./pages/Team').then((m) => ({ default: m.Team })));
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));

// Sleek, minimal route fallback
const PageFallback = () => (
  <div className="w-full py-20 flex items-center justify-center animate-fade-in">
    <div className="w-7 h-7 rounded-full border-2 border-[#6257D9]/20 border-t-[#6257D9] animate-spin" />
  </div>
);

// Automatically scroll to the top of the viewport whenever route changes
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
};

export const App = () => {
  return (
    <AuthProvider>
      <ProjectProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/signup" element={<Register />} />

              {/* Protected Application Routes wrapped in AppLayout */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetails />} />
                <Route path="/issues" element={<Issues />} />
                <Route path="/issues/new" element={<CreateIssue />} />
                <Route path="/issues/:id" element={<IssueDetails />} />
                <Route path="/ideas" element={<Brainstorming />} />
                <Route path="/brainstorm" element={<Navigate to="/ideas" replace />} />
                <Route path="/team" element={<Team />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ProjectProvider>
    </AuthProvider>
  );
};

export default App;
