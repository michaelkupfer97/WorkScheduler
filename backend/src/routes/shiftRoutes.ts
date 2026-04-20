import { Router } from 'express';
import {
  getShifts,
  getMyShifts,
  createShift,
  updateShift,
  deleteShift,
  autoGenerate,
  publishWeek,
  getTemplates,
  upsertTemplate,
  deleteTemplate,
} from '../controllers/shiftController.js';
import { authenticate, requireRole, requireOrg } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createShiftSchema, updateShiftSchema, shiftTemplateSchema } from '../../../shared/validation/index.js';

const router = Router();

router.use(authenticate, requireOrg);

router.get('/', getShifts);
router.get('/mine', getMyShifts);
router.post('/', requireRole('manager', 'admin'), validate(createShiftSchema), createShift);
router.patch('/:id', requireRole('manager', 'admin'), validate(updateShiftSchema), updateShift);
router.delete('/:id', requireRole('manager', 'admin'), deleteShift);

router.post('/auto-generate', requireRole('manager', 'admin'), autoGenerate);
router.post('/publish', requireRole('manager', 'admin'), publishWeek);

router.get('/templates', getTemplates);
router.post('/templates', requireRole('manager', 'admin'), validate(shiftTemplateSchema), upsertTemplate);
router.delete('/templates/:id', requireRole('manager', 'admin'), deleteTemplate);

export default router;
