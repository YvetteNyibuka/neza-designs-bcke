import { Router } from 'express';
import * as teamController from '../../controllers/teamController';
import { authenticate, authorize } from '../../middlewares/authenticate';
import { validate } from '../../middlewares/validate';
import { createTeamMemberSchema, updateTeamMemberSchema } from '../../validators/team.validator';
import { ROLES } from '../../constants/roles';

const router = Router();

router.get('/', teamController.getTeam);
router.get('/:id', teamController.getTeamMember);

router.post('/', authenticate, authorize(ROLES.ADMIN), validate(createTeamMemberSchema), teamController.createTeamMember);
router.patch('/:id', authenticate, authorize(ROLES.ADMIN), validate(updateTeamMemberSchema), teamController.updateTeamMember);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), teamController.deleteTeamMember);

export default router;
