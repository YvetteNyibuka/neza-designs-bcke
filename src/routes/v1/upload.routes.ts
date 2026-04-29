import { Router } from 'express';
import { upload, uploadSingle, fileUpload, uploadFileSingle, deleteImageHandler } from '../../controllers/uploadController';
import { authenticate, authorize } from '../../middlewares/authenticate';
import { ROLES } from '../../constants/roles';

const router = Router();

router.post('/image', authenticate, authorize(ROLES.ADMIN), upload.single('image'), uploadSingle);
router.delete('/image', authenticate, authorize(ROLES.ADMIN), deleteImageHandler);

// Public file upload — used by job applicants uploading CV/cover letter
router.post('/file', fileUpload.single('file'), uploadFileSingle);

export default router;
