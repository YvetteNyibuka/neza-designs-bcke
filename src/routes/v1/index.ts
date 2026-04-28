import { Router } from 'express';
import authRoutes from './auth.routes';
import projectRoutes from './project.routes';
import postRoutes from './post.routes';
import serviceRoutes from './service.routes';
import teamRoutes from './team.routes';
import contactRoutes from './contact.routes';
import uploadRoutes from './upload.routes';
import settingsRoutes from './settings.routes';
import analyticsRoutes from './analytics.routes';
import healthRoutes from './health.routes';
import careerRoutes from './career.routes';
import publicationRoutes from './publication.routes';

const v1Router = Router();

v1Router.use('/health', healthRoutes);
v1Router.use('/auth', authRoutes);
v1Router.use('/projects', projectRoutes);
v1Router.use('/posts', postRoutes);
v1Router.use('/services', serviceRoutes);
v1Router.use('/team', teamRoutes);
v1Router.use('/contact', contactRoutes);
v1Router.use('/upload', uploadRoutes);
v1Router.use('/settings', settingsRoutes);
v1Router.use('/analytics', analyticsRoutes);
v1Router.use('/careers', careerRoutes);
v1Router.use('/publications', publicationRoutes);

export default v1Router;
