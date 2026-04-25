import { Router } from 'express';
import * as projectController from '../../controllers/projectController';
import { authenticate, authorize } from '../../middlewares/authenticate';
import { validate } from '../../middlewares/validate';
import { createProjectSchema, updateProjectSchema } from '../../validators/project.validator';
import { ROLES } from '../../constants/roles';

const router = Router();

// Public
router.get('/', projectController.getProjects);
router.get('/:slug', projectController.getProject);

// Admin only
router.post('/', authenticate, authorize(ROLES.ADMIN), validate(createProjectSchema), projectController.createProject);
router.patch('/:slug', authenticate, authorize(ROLES.ADMIN), validate(updateProjectSchema), projectController.updateProject);
router.delete('/:slug', authenticate, authorize(ROLES.ADMIN), projectController.deleteProject);

export default router;
