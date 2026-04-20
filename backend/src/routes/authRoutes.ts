import { Router } from 'express';
import { registerCreateOrg, registerJoinOrg, login, refresh, logout, getMe, updateProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerCreateOrgSchema, registerJoinOrgSchema, loginSchema } from '../../../shared/validation/index.js';

const router = Router();

router.post('/register-create-org', validate(registerCreateOrgSchema), registerCreateOrg);
router.post('/register-join-org', validate(registerJoinOrgSchema), registerJoinOrg);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, updateProfile);

export default router;
