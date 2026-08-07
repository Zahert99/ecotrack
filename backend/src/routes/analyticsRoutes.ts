import { Router } from 'express';
import { byTransport, summary, trends } from '../controllers/analyticsController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/summary', summary);
router.get('/by-transport', byTransport);
router.get('/trends', trends);

export default router;
