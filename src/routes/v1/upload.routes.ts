import { Router } from 'express';
import { upload, uploadSingle, deleteImageHandler } from '../../controllers/uploadController';
import { authenticate, authorize } from '../../middlewares/authenticate';
import { ROLES } from '../../constants/roles';

const router = Router();

router.post('/image', authenticate, authorize(ROLES.ADMIN), upload.single('image'), uploadSingle);
router.delete('/image', authenticate, authorize(ROLES.ADMIN), deleteImageHandler);

export default router;
