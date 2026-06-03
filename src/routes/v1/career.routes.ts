import { Router } from 'express';
import * as careerController from '../../controllers/careerController';
import { authenticate, authorize } from '../../middlewares/authenticate';
import { validate } from '../../middlewares/validate';
import { createCareerSchema, updateCareerSchema } from '../../validators/career.validator';
import { ROLES } from '../../constants/roles';
import * as applicationController from '../../controllers/jobApplicationController';

const router = Router();

router.get('/', careerController.getCareers);
router.get('/admin/all', authenticate, authorize(ROLES.ADMIN), careerController.getCareersAdmin);
router.get('/:slug', careerController.getCareer);
// Job applications (public submit)
router.post('/:slug/apply', applicationController.applyForCareer);
// Job applications (admin)
router.get('/:slug/applications', authenticate, authorize(ROLES.ADMIN), applicationController.getCareerApplications);
router.get('/applications/all', authenticate, authorize(ROLES.ADMIN), applicationController.getAllApplications);
router.patch('/applications/:id', authenticate, authorize(ROLES.ADMIN), applicationController.updateApplicationStatus);
router.delete('/applications/:id', authenticate, authorize(ROLES.ADMIN), applicationController.deleteApplication);

router.post('/', authenticate, authorize(ROLES.ADMIN), validate(createCareerSchema), careerController.createCareer);
router.patch('/:slug', authenticate, authorize(ROLES.ADMIN), validate(updateCareerSchema), careerController.updateCareer);
router.delete('/:slug', authenticate, authorize(ROLES.ADMIN), careerController.deleteCareer);

export default router;
