import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProjectsApi } from '../api/projects.api';
import { useAuth } from './AuthContext';

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [projects, setProjects] = useState(() => {
    try {
      const cached = localStorage.getItem('resolvehub_cached_projects') || sessionStorage.getItem('resolvehub_cached_projects');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [currentProject, setCurrentProjectState] = useState(() => {
    try {
      const cached = localStorage.getItem('resolvehub_cached_projects') || sessionStorage.getItem('resolvehub_cached_projects');
      const list = cached ? JSON.parse(cached) : [];
      const savedId = localStorage.getItem('fixflow_current_project_id');
      return list.find((p) => p._id === savedId) || list[0] || null;
    } catch {
      return null;
    }
  });
  const [loadingProjects, setLoadingProjects] = useState(() => {
    try {
      return !localStorage.getItem('resolvehub_cached_projects') && !sessionStorage.getItem('resolvehub_cached_projects');
    } catch {
      return true;
    }
  });

  const fetchProjects = useCallback(async () => {
    if (!isAuthenticated) {
      setProjects([]);
      setCurrentProjectState(null);
      setLoadingProjects(false);
      try {
        localStorage.removeItem('resolvehub_cached_projects');
        sessionStorage.removeItem('resolvehub_cached_projects');
      } catch {}
      return;
    }

    try {
      const res = await getProjectsApi();
      const projectList = res.data || [];
      setProjects(projectList);
      try {
        localStorage.setItem('resolvehub_cached_projects', JSON.stringify(projectList));
        sessionStorage.setItem('resolvehub_cached_projects', JSON.stringify(projectList));
      } catch {}

      if (projectList.length > 0) {
        // Check saved project preference from localStorage
        const savedId = localStorage.getItem('fixflow_current_project_id');
        const matched = projectList.find((p) => p._id === savedId);
        const selected = matched || projectList[0];
        setCurrentProjectState(selected);
        try {
          localStorage.setItem('fixflow_current_project_id', selected._id);
        } catch {}
      } else {
        setCurrentProjectState(null);
      }
    } catch (err) {
      console.warn('Failed to fetch projects list:', err);
    } finally {
      setLoadingProjects(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const setCurrentProject = (projectOrId) => {
    if (!projectOrId) {
      setCurrentProjectState(null);
      return;
    }

    let targetProject = null;
    if (typeof projectOrId === 'string') {
      targetProject = projects.find((p) => p._id === projectOrId) || null;
    } else {
      targetProject = projectOrId;
    }

    if (targetProject) {
      setCurrentProjectState(targetProject);
      try {
        localStorage.setItem('fixflow_current_project_id', targetProject._id);
      } catch {}
    }
  };

  // Helper to determine if current user is admin of the current or specified project
  const isProjectAdmin = Boolean(
    isAdmin ||
      (currentProject &&
        currentProject.members?.some(
          (m) =>
            (m.user?._id || m.user) === user?._id && m.role === 'project_admin'
        ))
  );

  const canManageProject = (project) => {
    if (!user || !project) return false;
    if (isAdmin) return true;
    return Boolean(
      project.members?.some(
        (m) =>
          (m.user?._id || m.user) === user._id && m.role === 'project_admin'
      )
    );
  };

  const value = {
    projects,
    currentProject,
    currentProjectId: currentProject?._id || null,
    setCurrentProject,
    loadingProjects,
    refreshProjects: fetchProjects,
    isProjectAdmin,
    isOrgAdmin: isAdmin,
    canManageProject,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
