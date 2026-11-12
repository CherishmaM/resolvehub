import * as projectService from '../services/project.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getProjects(req.user);
    res.status(200).json(ApiResponse.success(projects, 'Projects retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id, req.user);
    res.status(200).json(ApiResponse.success(project, 'Project retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { name, key, description, status, initialMemberIds } = req.body;
    const project = await projectService.createProject(
      { name, key, description, status, initialMemberIds },
      req.user
    );
    res.status(201).json(ApiResponse.created(project, 'Project created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body, req.user);
    res.status(200).json(ApiResponse.success(project, 'Project updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const result = await projectService.deleteProject(req.params.id, req.user);
    res.status(200).json(ApiResponse.success(result, 'Project deleted successfully'));
  } catch (error) {
    next(error);
  }
};

export const addProjectMember = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const project = await projectService.addProjectMember(req.params.id, { userId, role }, req.user);
    res.status(200).json(ApiResponse.success(project, 'Member added to project successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateProjectMemberRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const project = await projectService.updateProjectMemberRole(
      req.params.id,
      req.params.userId,
      role,
      req.user
    );
    res.status(200).json(ApiResponse.success(project, 'Member role updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const removeProjectMember = async (req, res, next) => {
  try {
    const project = await projectService.removeProjectMember(
      req.params.id,
      req.params.userId,
      req.user
    );
    res.status(200).json(ApiResponse.success(project, 'Member removed from project successfully'));
  } catch (error) {
    next(error);
  }
};

export const getProjectStats = async (req, res, next) => {
  try {
    const stats = await projectService.getProjectStats(req.params.id, req.user);
    res.status(200).json(ApiResponse.success(stats, 'Project statistics retrieved successfully'));
  } catch (error) {
    next(error);
  }
};
