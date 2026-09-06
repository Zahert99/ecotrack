import { Router } from 'express';
import {
  byFuelType,
  byTransport,
  quarterlyComparison,
  summary,
  trends,
} from '../controllers/analyticsController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/summary', summary);
router.get('/by-transport', byTransport);
router.get('/by-fuel-type', byFuelType);
router.get('/trends', trends);
router.get('/quarterly-comparison', quarterlyComparison);

export default router;
