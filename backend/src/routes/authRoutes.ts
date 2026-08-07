import { Router } from 'express';
import { login, loginSchema, signup, signupSchema } from '../controllers/authController';
import { validateBody } from '../middleware/validate';

const router = Router();

router.post('/signup', validateBody(signupSchema), signup);
router.post('/login', validateBody(loginSchema), login);

export default router;
