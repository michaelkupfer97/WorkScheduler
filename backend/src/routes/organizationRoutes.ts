import { Router } from 'express';
import {
  createOrganization,
  joinOrganization,
  getOrganization,
  updateOrganization,
  getMembers,
  getInviteCode,
} from '../controllers/organizationController.js';
import { authenticate, requireRole, requireOrg } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createOrganizationSchema, joinOrganizationSchema } from '../../../shared/validation/index.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createOrganizationSchema), createOrganization);
router.post('/join', validate(joinOrganizationSchema), joinOrganization);
router.get('/', requireOrg, getOrganization);
router.patch('/', requireOrg, requireRole('manager', 'admin'), updateOrganization);
router.get('/members', requireOrg, getMembers);
router.get('/invite-code', requireOrg, requireRole('manager', 'admin'), getInviteCode);

export default router;
