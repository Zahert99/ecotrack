import { Router } from 'express';
import { summary } from '../controllers/companyController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', summary);

export default router;
