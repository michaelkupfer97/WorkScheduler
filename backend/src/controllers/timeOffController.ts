import { Response } from 'express';
import { TimeOffRequest } from '../models/TimeOffRequest.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';

export async function createTimeOffRequest(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { startDate, endDate, reason } = req.body;

    const request = await TimeOffRequest.create({
      userId: req.user!._id,
      organizationId: req.user!.organizationId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
    });

    const managers = await User.find({
      organizationId: req.user!.organizationId,
      role: 'manager',
    });

    const notifs = managers.map((mgr) => ({
      userId: mgr._id,
      title: 'New Time-Off Request',
      message: `${req.user!.firstName} ${req.user!.lastName} requested time off from ${startDate} to ${endDate}.`,
      type: 'timeoff' as const,
      link: '/time-off',
    }));
    await Notification.insertMany(notifs);

    res.status(201).json(request);
  } catch {
    res.status(500).json({ message: 'Failed to create time-off request' });
  }
}

export async function getMyTimeOffRequests(req: AuthRequest, res: Response): Promise<void> {
  try {
    const requests = await TimeOffRequest.find({ userId: req.user!._id })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch {
    res.status(500).json({ message: 'Failed to get requests' });
  }
}

export async function getOrgTimeOffRequests(req: AuthRequest, res: Response): Promise<void> {
  try {
    const requests = await TimeOffRequest.find({
      organizationId: req.user!.organizationId,
    })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch {
    res.status(500).json({ message: 'Failed to get requests' });
  }
}

export async function handleTimeOffRequest(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { action, managerNote } = req.body;

    const request = await TimeOffRequest.findOne({
      _id: id,
      organizationId: req.user!.organizationId,
    });

    if (!request) {
      res.status(404).json({ message: 'Request not found' });
      return;
    }

    request.status = action === 'approve' ? 'approved' : 'rejected';
    request.managerNote = managerNote;
    await request.save();

    await Notification.create({
      userId: request.userId,
      title: `Time-Off ${request.status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your time-off request has been ${request.status}.${managerNote ? ' Note: ' + managerNote : ''}`,
      type: 'timeoff',
      link: '/time-off',
    });

    res.json(request);
  } catch {
    res.status(500).json({ message: 'Failed to handle request' });
  }
}
