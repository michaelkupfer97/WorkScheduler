import { Response } from 'express';
import { Constraint } from '../models/Constraint.js';
import { AuthRequest } from '../middleware/auth.js';

export async function submitConstraint(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { weekStartDate, entries } = req.body;
    const userId = req.user!._id;
    const orgId = req.user!.organizationId;

    const constraint = await Constraint.findOneAndUpdate(
      { userId, weekStartDate: new Date(weekStartDate) },
      {
        userId,
        organizationId: orgId,
        weekStartDate: new Date(weekStartDate),
        entries,
        submittedAt: new Date(),
        deadline: new Date(new Date(weekStartDate).getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      { new: true, upsert: true }
    );

    res.json(constraint);
  } catch {
    res.status(500).json({ message: 'Failed to submit constraints' });
  }
}

export async function getMyConstraints(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { weekStartDate } = req.query;
    const filter: Record<string, unknown> = { userId: req.user!._id };
    if (weekStartDate) filter.weekStartDate = new Date(weekStartDate as string);

    const constraints = await Constraint.find(filter).sort({ weekStartDate: -1 }).limit(10);
    res.json(constraints);
  } catch {
    res.status(500).json({ message: 'Failed to get constraints' });
  }
}

export async function getOrgConstraints(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { weekStartDate } = req.query;
    const filter: Record<string, unknown> = { organizationId: req.user!.organizationId };
    if (weekStartDate) filter.weekStartDate = new Date(weekStartDate as string);

    const constraints = await Constraint.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ submittedAt: -1 });
    res.json(constraints);
  } catch {
    res.status(500).json({ message: 'Failed to get constraints' });
  }
}

export async function setDeadline(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { weekStartDate, deadline } = req.body;
    const orgId = req.user!.organizationId;

    await Constraint.updateMany(
      { organizationId: orgId, weekStartDate: new Date(weekStartDate) },
      { deadline: new Date(deadline) }
    );

    res.json({ message: 'Deadline updated' });
  } catch {
    res.status(500).json({ message: 'Failed to set deadline' });
  }
}
