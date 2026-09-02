import { Router } from 'express';
import {
  listPending,
  resolve,
  resolveTripEditRequestSchema,
} from '../controllers/tripEditRequestController';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

router.use(requireAuth);

router.get('/', requireRole('ADMIN'), listPending);
router.patch('/:id', requireRole('ADMIN'), validateBody(resolveTripEditRequestSchema), resolve);

export default router;
