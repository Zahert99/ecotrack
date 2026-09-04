import { Router } from 'express';
import {
  create,
  createUserSchema,
  list,
  remove,
  updatePermissions,
  updatePermissionsSchema,
} from '../controllers/userController';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

router.use(requireAuth);
router.use(requireRole('ADMIN'));

router.post('/', validateBody(createUserSchema), create);
router.get('/', list);
router.patch('/:id/permissions', validateBody(updatePermissionsSchema), updatePermissions);
router.delete('/:id', remove);

export default router;
