import { Router } from 'express';
import * as analyticsController from '../../controllers/analyticsController';
import { authenticate, authorize } from '../../middlewares/authenticate';
import { ROLES } from '../../constants/roles';

const router = Router();

router.get('/overview', authenticate, authorize(ROLES.ADMIN), analyticsController.getOverview);

export default router;
