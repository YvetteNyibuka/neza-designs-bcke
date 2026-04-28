import { Router } from 'express';
import * as publicationController from '../../controllers/publicationController';
import { authenticate, authorize } from '../../middlewares/authenticate';
import { validate } from '../../middlewares/validate';
import { createPublicationSchema, updatePublicationSchema } from '../../validators/publication.validator';
import { ROLES } from '../../constants/roles';

const router = Router();

router.get('/', publicationController.getPublications);
router.get('/:slug', publicationController.getPublication);

router.post('/', authenticate, authorize(ROLES.ADMIN), validate(createPublicationSchema), publicationController.createPublication);
router.patch('/:slug', authenticate, authorize(ROLES.ADMIN), validate(updatePublicationSchema), publicationController.updatePublication);
router.delete('/:slug', authenticate, authorize(ROLES.ADMIN), publicationController.deletePublication);

export default router;
