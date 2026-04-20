import { Response } from 'express';
import { Notification } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';

export async function getNotifications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const notifications = await Notification.find({ userId: req.user!._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch {
    res.status(500).json({ message: 'Failed to get notifications' });
  }
}

export async function getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
  try {
    const count = await Notification.countDocuments({ userId: req.user!._id, read: false });
    res.json({ count });
  } catch {
    res.status(500).json({ message: 'Failed to get count' });
  }
}

export async function markAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await Notification.findOneAndUpdate(
      { _id: id, userId: req.user!._id },
      { read: true }
    );
    res.json({ message: 'Marked as read' });
  } catch {
    res.status(500).json({ message: 'Failed to mark as read' });
  }
}

export async function markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    await Notification.updateMany(
      { userId: req.user!._id, read: false },
      { read: true }
    );
    res.json({ message: 'All marked as read' });
  } catch {
    res.status(500).json({ message: 'Failed to mark all as read' });
  }
}
