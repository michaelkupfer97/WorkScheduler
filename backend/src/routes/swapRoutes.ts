import { Router } from 'express';
import {
  createSwapRequest,
  getSwapRequests,
  getOrgSwapRequests,
  respondToSwap,
  approveSwap,
} from '../controllers/swapController.js';
import { authenticate, requireRole, requireOrg } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { swapRequestSchema } from '../../../shared/validation/index.js';

const router = Router();

router.use(authenticate, requireOrg);

router.post('/', validate(swapRequestSchema), createSwapRequest);
router.get('/', getSwapRequests);
router.get('/org', requireRole('manager', 'admin'), getOrgSwapRequests);
router.patch('/:id/respond', respondToSwap);
router.patch('/:id/approve', requireRole('manager', 'admin'), approveSwap);

export default router;
