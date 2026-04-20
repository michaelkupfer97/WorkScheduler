import { Router } from 'express';
import {
  submitConstraint,
  getMyConstraints,
  getOrgConstraints,
  setDeadline,
} from '../controllers/constraintController.js';
import { authenticate, requireRole, requireOrg } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { constraintSchema } from '../../../shared/validation/index.js';

const router = Router();

router.use(authenticate, requireOrg);

router.post('/', validate(constraintSchema), submitConstraint);
router.get('/mine', getMyConstraints);
router.get('/', requireRole('manager', 'admin'), getOrgConstraints);
router.post('/deadline', requireRole('manager', 'admin'), setDeadline);

export default router;
