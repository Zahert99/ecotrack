import { Router } from 'express';
import { mine, propose } from '../controllers/tripEditRequestController';
import { tripInputSchema } from '../controllers/tripController';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post('/', requireRole('USER'), validateBody(tripInputSchema), propose);
router.get('/mine', mine);

export default router;
