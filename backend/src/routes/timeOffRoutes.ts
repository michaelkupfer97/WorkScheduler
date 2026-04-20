import { Router } from 'express';
import {
  createTimeOffRequest,
  getMyTimeOffRequests,
  getOrgTimeOffRequests,
  handleTimeOffRequest,
} from '../controllers/timeOffController.js';
import { authenticate, requireRole, requireOrg } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { timeOffRequestSchema } from '../../../shared/validation/index.js';

const router = Router();

router.use(authenticate, requireOrg);

router.post('/', validate(timeOffRequestSchema), createTimeOffRequest);
router.get('/mine', getMyTimeOffRequests);
router.get('/', requireRole('manager', 'admin'), getOrgTimeOffRequests);
router.patch('/:id', requireRole('manager', 'admin'), handleTimeOffRequest);

export default router;
