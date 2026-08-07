import { Router } from 'express';
import {
  create,
  getOne,
  list,
  remove,
  tripInputSchema,
  update,
} from '../controllers/tripController';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

router.use(requireAuth);

router.post('/', validateBody(tripInputSchema), create);
router.get('/', list);
router.get('/:tripId', getOne);
router.put('/:tripId', validateBody(tripInputSchema), update);
router.delete('/:tripId', remove);

export default router;
