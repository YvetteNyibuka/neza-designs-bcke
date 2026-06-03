import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/authenticate';
import * as categoryController from '../../controllers/categoryController';

const router = Router();

// Career Categories - Public
router.get('/careers', categoryController.getCareerCategories);
router.get('/careers/:id', categoryController.getCareerCategoryById);

// Career Categories - Admin
router.post('/careers', authenticate, authorize('admin'), categoryController.createCareerCategory);
router.put('/careers/:id', authenticate, authorize('admin'), categoryController.updateCareerCategory);
router.delete('/careers/:id', authenticate, authorize('admin'), categoryController.deleteCareerCategory);

// Blog Categories - Public
router.get('/blogs', categoryController.getBlogCategories);
router.get('/blogs/:id', categoryController.getBlogCategoryById);

// Blog Categories - Admin
router.post('/blogs', authenticate, authorize('admin'), categoryController.createBlogCategory);
router.put('/blogs/:id', authenticate, authorize('admin'), categoryController.updateBlogCategory);
router.delete('/blogs/:id', authenticate, authorize('admin'), categoryController.deleteBlogCategory);

// Project Categories - Public
router.get('/projects', categoryController.getProjectCategories);
router.get('/projects/:id', categoryController.getProjectCategoryById);

// Project Categories - Admin
router.post('/projects', authenticate, authorize('admin'), categoryController.createProjectCategory);
router.put('/projects/:id', authenticate, authorize('admin'), categoryController.updateProjectCategory);
router.delete('/projects/:id', authenticate, authorize('admin'), categoryController.deleteProjectCategory);

export default router;
