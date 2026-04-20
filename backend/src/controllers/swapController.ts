import { Response } from 'express';
import { SwapRequest } from '../models/SwapRequest.js';
import { Shift } from '../models/Shift.js';
import { Notification } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendSwapRequestEmail } from '../services/emailService.js';
import { User } from '../models/User.js';

export async function createSwapRequest(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { targetEmployeeId, originalShiftId, targetShiftId } = req.body;
    const requesterId = req.user!._id;
    const orgId = req.user!.organizationId;

    const originalShift = await Shift.findOne({ _id: originalShiftId, assignedEmployees: requesterId });
    if (!originalShift) {
      res.status(400).json({ message: 'You are not assigned to the original shift' });
      return;
    }

    const targetShift = await Shift.findOne({ _id: targetShiftId, assignedEmployees: targetEmployeeId });
    if (!targetShift) {
      res.status(400).json({ message: 'Target employee is not assigned to the target shift' });
      return;
    }

    const swap = await SwapRequest.create({
      requesterId,
      targetEmployeeId,
      originalShiftId,
      targetShiftId,
      organizationId: orgId,
    });

    await Notification.create({
      userId: targetEmployeeId,
      title: 'Shift Swap Request',
      message: `${req.user!.firstName} wants to swap shifts with you.`,
      type: 'swap',
      link: '/swaps',
    });

    const target = await User.findById(targetEmployeeId);
    if (target) {
      sendSwapRequestEmail(
        target.email,
        `${req.user!.firstName} ${req.user!.lastName}`,
        originalShift.date.toISOString().split('T')[0]
      ).catch(() => {});
    }

    res.status(201).json(swap);
  } catch {
    res.status(500).json({ message: 'Failed to create swap request' });
  }
}

export async function getSwapRequests(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!._id;
    const swaps = await SwapRequest.find({
      $or: [{ requesterId: userId }, { targetEmployeeId: userId }],
    })
      .populate('requesterId', 'firstName lastName')
      .populate('targetEmployeeId', 'firstName lastName')
      .populate('originalShiftId', 'date shiftType startTime endTime')
      .populate('targetShiftId', 'date shiftType startTime endTime')
      .sort({ createdAt: -1 });

    res.json(swaps);
  } catch {
    res.status(500).json({ message: 'Failed to get swap requests' });
  }
}

export async function getOrgSwapRequests(req: AuthRequest, res: Response): Promise<void> {
  try {
    const swaps = await SwapRequest.find({ organizationId: req.user!.organizationId })
      .populate('requesterId', 'firstName lastName')
      .populate('targetEmployeeId', 'firstName lastName')
      .populate('originalShiftId', 'date shiftType startTime endTime')
      .populate('targetShiftId', 'date shiftType startTime endTime')
      .sort({ createdAt: -1 });

    res.json(swaps);
  } catch {
    res.status(500).json({ message: 'Failed to get swap requests' });
  }
}

export async function respondToSwap(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const swap = await SwapRequest.findById(id);
    if (!swap) {
      res.status(404).json({ message: 'Swap request not found' });
      return;
    }

    if (swap.targetEmployeeId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Only the target employee can respond' });
      return;
    }

    if (action === 'reject') {
      swap.status = 'rejected';
      await swap.save();
      res.json(swap);
      return;
    }

    swap.status = 'pending';
    await swap.save();

    await Notification.create({
      userId: swap.requesterId,
      title: 'Swap Accepted by Employee',
      message: 'Your swap request was accepted. Waiting for manager approval.',
      type: 'swap',
      link: '/swaps',
    });

    res.json(swap);
  } catch {
    res.status(500).json({ message: 'Failed to respond to swap' });
  }
}

export async function approveSwap(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { action, managerNote } = req.body;

    const swap = await SwapRequest.findOne({
      _id: id,
      organizationId: req.user!.organizationId,
    });

    if (!swap) {
      res.status(404).json({ message: 'Swap request not found' });
      return;
    }

    if (action === 'reject') {
      swap.status = 'rejected';
      swap.managerNote = managerNote;
      await swap.save();
      res.json(swap);
      return;
    }

    const originalShift = await Shift.findById(swap.originalShiftId);
    const targetShift = await Shift.findById(swap.targetShiftId);

    if (!originalShift || !targetShift) {
      res.status(400).json({ message: 'One or both shifts no longer exist' });
      return;
    }

    originalShift.assignedEmployees = originalShift.assignedEmployees.map((id) =>
      id.toString() === swap.requesterId.toString() ? swap.targetEmployeeId : id
    );
    targetShift.assignedEmployees = targetShift.assignedEmployees.map((id) =>
      id.toString() === swap.targetEmployeeId.toString() ? swap.requesterId : id
    );

    await originalShift.save();
    await targetShift.save();

    swap.status = 'approved';
    swap.managerNote = managerNote;
    await swap.save();

    const notifs = [
      { userId: swap.requesterId, title: 'Swap Approved', message: 'Your shift swap has been approved.', type: 'swap' as const, link: '/schedule' },
      { userId: swap.targetEmployeeId, title: 'Swap Approved', message: 'A shift swap you were part of has been approved.', type: 'swap' as const, link: '/schedule' },
    ];
    await Notification.insertMany(notifs);

    res.json(swap);
  } catch {
    res.status(500).json({ message: 'Failed to approve swap' });
  }
}
