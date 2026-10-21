import { Router } from 'express';
import authRoutes from './auth.routes.js';
import issueRoutes from './issue.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import userRoutes from './user.routes.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json(
    ApiResponse.success(
      {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        service: 'ResolveHub API',
        version: '1.0.0',
      },
      'ResolveHub API is running smoothly'
    )
  );
});

// Mounted feature routers
router.use('/auth', authRoutes);
router.use('/issues', issueRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);

export default router;
