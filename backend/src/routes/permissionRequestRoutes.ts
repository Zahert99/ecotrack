import { Router } from 'express';
import {
  create,
  listPending,
  myStatus,
  resolve,
  resolvePermissionRequestSchema,
} from '../controllers/permissionRequestController';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

router.use(requireAuth);

router.post('/', requireRole('USER'), create);
router.get('/my-status', requireRole('USER'), myStatus);
router.get('/', requireRole('ADMIN'), listPending);
router.patch('/:id', requireRole('ADMIN'), validateBody(resolvePermissionRequestSchema), resolve);

export default router;
