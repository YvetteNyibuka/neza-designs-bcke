import { Router } from 'express';
import * as contactController from '../../controllers/contactController';
import { authenticate, authorize } from '../../middlewares/authenticate';
import { validate } from '../../middlewares/validate';
import {
	createContactSchema,
	replyContactSchema,
	updateContactStatusSchema,
} from '../../validators/contact.validator';
import { ROLES } from '../../constants/roles';

const router = Router();

// Public submission
router.post('/', validate(createContactSchema), contactController.submitContact);

// Admin
router.get('/', authenticate, authorize(ROLES.ADMIN), contactController.getContacts);
router.patch('/:id/read', authenticate, authorize(ROLES.ADMIN), contactController.markRead);
router.patch('/:id/status', authenticate, authorize(ROLES.ADMIN), validate(updateContactStatusSchema), contactController.updateStatus);
router.post('/:id/reply', authenticate, authorize(ROLES.ADMIN), validate(replyContactSchema), contactController.replyContact);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), contactController.deleteContact);

export default router;
