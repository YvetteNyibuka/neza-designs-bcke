import { Router } from 'express';
import * as postController from '../../controllers/postController';
import { authenticate, authorize } from '../../middlewares/authenticate';
import { validate } from '../../middlewares/validate';
import { createPostSchema, updatePostSchema } from '../../validators/post.validator';
import { ROLES } from '../../constants/roles';

const router = Router();

router.get('/', postController.getPosts);
router.get('/:slug', postController.getPost);

router.post('/', authenticate, authorize(ROLES.ADMIN), validate(createPostSchema), postController.createPost);
router.patch('/:slug', authenticate, authorize(ROLES.ADMIN), validate(updatePostSchema), postController.updatePost);
router.delete('/:slug', authenticate, authorize(ROLES.ADMIN), postController.deletePost);

export default router;
