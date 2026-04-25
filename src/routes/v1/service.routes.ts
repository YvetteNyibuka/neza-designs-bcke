import { Router } from 'express';
import * as serviceController from '../../controllers/serviceController';
import { authenticate, authorize } from '../../middlewares/authenticate';
import { validate } from '../../middlewares/validate';
import { createServiceSchema, updateServiceSchema } from '../../validators/service.validator';
import { ROLES } from '../../constants/roles';

const router = Router();

router.get('/', serviceController.getServices);
router.get('/:id', serviceController.getService);

router.post('/', authenticate, authorize(ROLES.ADMIN), validate(createServiceSchema), serviceController.createService);
router.patch('/reorder', authenticate, authorize(ROLES.ADMIN), serviceController.reorderServices);
router.patch('/:id', authenticate, authorize(ROLES.ADMIN), validate(updateServiceSchema), serviceController.updateService);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), serviceController.deleteService);

export default router;
