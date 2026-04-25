import { Router } from 'express';
import * as settingsController from '../../controllers/settingsController';
import { authenticate, authorize } from '../../middlewares/authenticate';
import { validate } from '../../middlewares/validate';
import { updateSettingsSchema } from '../../validators/settings.validator';
import { ROLES } from '../../constants/roles';

const router = Router();

// Public read for frontend to consume (e.g. meta tags, branding)
router.get('/', settingsController.getSettings);

// Admin write
router.patch('/', authenticate, authorize(ROLES.ADMIN), validate(updateSettingsSchema), settingsController.updateSettings);

export default router;
