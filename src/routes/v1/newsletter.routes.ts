import { Router } from 'express';
import * as newsletterController from '../../controllers/newsletterController';
import { authenticate, authorize } from '../../middlewares/authenticate';
import { ROLES } from '../../constants/roles';

const router = Router();

// Public
router.post('/subscribe', newsletterController.subscribe);
router.post('/unsubscribe', newsletterController.unsubscribe);

// Admin only
router.get('/', authenticate, authorize(ROLES.ADMIN), newsletterController.getSubscribers);
router.post('/broadcast', authenticate, authorize(ROLES.ADMIN), newsletterController.broadcastNewsletter);

export default router;
