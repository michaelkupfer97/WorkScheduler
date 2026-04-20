import { Response } from 'express';
import { Shift } from '../models/Shift.js';
import { ShiftTemplate } from '../models/ShiftTemplate.js';
import { AuthRequest } from '../middleware/auth.js';
import { generateWeeklySchedule, applySchedule } from '../services/scheduleEngine.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { sendSchedulePublishedEmail } from '../services/emailService.js';

export async function getShifts(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { start, end, status } = req.query;
    const orgId = req.user!.organizationId;

    const filter: Record<string, unknown> = { organizationId: orgId };
    if (start && end) {
      filter.date = { $gte: new Date(start as string), $lte: new Date(end as string) };
    }
    if (status) filter.status = status;

    const shifts = await Shift.find(filter)
      .populate('assignedEmployees', 'firstName lastName email')
      .sort({ date: 1, startTime: 1 });

    res.json(shifts);
  } catch {
    res.status(500).json({ message: 'Failed to get shifts' });
  }
}

export async function getMyShifts(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { start, end } = req.query;
    const filter: Record<string, unknown> = {
      assignedEmployees: req.user!._id,
      status: 'published',
    };
    if (start && end) {
      filter.date = { $gte: new Date(start as string), $lte: new Date(end as string) };
    }

    const shifts = await Shift.find(filter)
      .populate('assignedEmployees', 'firstName lastName')
      .sort({ date: 1, startTime: 1 });

    res.json(shifts);
  } catch {
    res.status(500).json({ message: 'Failed to get shifts' });
  }
}

export async function createShift(req: AuthRequest, res: Response): Promise<void> {
  try {
    const orgId = req.user!.organizationId;
    const shift = await Shift.create({ ...req.body, organizationId: orgId });
    res.status(201).json(shift);
  } catch {
    res.status(500).json({ message: 'Failed to create shift' });
  }
}

export async function updateShift(req: AuthRequest, res: Response): Promise<void> {
  try {
    const shift = await Shift.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user!.organizationId },
      req.body,
      { new: true }
    ).populate('assignedEmployees', 'firstName lastName email');

    if (!shift) {
      res.status(404).json({ message: 'Shift not found' });
      return;
    }
    res.json(shift);
  } catch {
    res.status(500).json({ message: 'Failed to update shift' });
  }
}

export async function deleteShift(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await Shift.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.user!.organizationId,
      status: 'draft',
    });
    if (!result) {
      res.status(404).json({ message: 'Shift not found or cannot be deleted' });
      return;
    }
    res.json({ message: 'Shift deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete shift' });
  }
}

export async function autoGenerate(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { weekStartDate } = req.body;
    const orgId = req.user!.organizationId!.toString();

    const result = await generateWeeklySchedule(orgId, new Date(weekStartDate));
    await applySchedule(orgId, new Date(weekStartDate), result.shifts, 'draft');

    res.json({
      message: 'Schedule generated',
      shiftsCreated: result.shifts.length,
      conflicts: result.conflicts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Auto-generation failed' });
  }
}

export async function publishWeek(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { weekStartDate } = req.body;
    const orgId = req.user!.organizationId;
    const weekEnd = new Date(weekStartDate);
    weekEnd.setDate(weekEnd.getDate() + 7);

    await Shift.updateMany(
      { organizationId: orgId, date: { $gte: new Date(weekStartDate), $lt: weekEnd }, status: 'draft' },
      { status: 'published' }
    );

    const employees = await User.find({ organizationId: orgId, role: 'employee' });
    const notifications = employees.map((emp) => ({
      userId: emp._id,
      title: 'New Schedule Published',
      message: `The schedule for the week of ${weekStartDate} has been published.`,
      type: 'schedule' as const,
      link: '/schedule',
    }));
    await Notification.insertMany(notifications);

    for (const emp of employees) {
      sendSchedulePublishedEmail(
        emp.email,
        weekStartDate,
        emp.firstName
      ).catch(() => {});
    }

    res.json({ message: 'Schedule published and employees notified' });
  } catch {
    res.status(500).json({ message: 'Failed to publish schedule' });
  }
}

// Shift Templates
export async function getTemplates(req: AuthRequest, res: Response): Promise<void> {
  try {
    const templates = await ShiftTemplate.find({ organizationId: req.user!.organizationId })
      .sort({ dayOfWeek: 1, shiftType: 1 });
    res.json(templates);
  } catch {
    res.status(500).json({ message: 'Failed to get templates' });
  }
}

export async function upsertTemplate(req: AuthRequest, res: Response): Promise<void> {
  try {
    const orgId = req.user!.organizationId;
    const { dayOfWeek, shiftType, requiredCount } = req.body;

    const template = await ShiftTemplate.findOneAndUpdate(
      { organizationId: orgId, dayOfWeek, shiftType },
      { requiredCount },
      { new: true, upsert: true }
    );

    res.json(template);
  } catch {
    res.status(500).json({ message: 'Failed to update template' });
  }
}

export async function deleteTemplate(req: AuthRequest, res: Response): Promise<void> {
  try {
    await ShiftTemplate.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.user!.organizationId,
    });
    res.json({ message: 'Template deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete template' });
  }
}
