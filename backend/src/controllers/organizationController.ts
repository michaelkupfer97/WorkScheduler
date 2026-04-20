import { Response } from 'express';
import { Organization } from '../models/Organization.js';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';

export async function createOrganization(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, timezone, weekStartsOn, shiftTypes } = req.body;
    const user = req.user!;

    if (user.organizationId) {
      res.status(400).json({ message: 'You are already in an organization' });
      return;
    }

    const org = await Organization.create({ name, timezone, weekStartsOn, shiftTypes });

    user.organizationId = org._id;
    user.role = 'manager';
    await user.save();

    res.status(201).json(org);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create organization' });
  }
}

export async function joinOrganization(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { inviteCode } = req.body;
    const user = req.user!;

    if (user.organizationId) {
      res.status(400).json({ message: 'You are already in an organization' });
      return;
    }

    const org = await Organization.findOne({ inviteCode });
    if (!org) {
      res.status(404).json({ message: 'Invalid invite code' });
      return;
    }

    user.organizationId = org._id;
    await user.save();

    res.json({ message: 'Joined organization', organization: org });
  } catch (error) {
    res.status(500).json({ message: 'Failed to join organization' });
  }
}

export async function getOrganization(req: AuthRequest, res: Response): Promise<void> {
  try {
    const org = await Organization.findById(req.user!.organizationId);
    if (!org) {
      res.status(404).json({ message: 'Organization not found' });
      return;
    }
    res.json(org);
  } catch {
    res.status(500).json({ message: 'Failed to get organization' });
  }
}

export async function updateOrganization(req: AuthRequest, res: Response): Promise<void> {
  try {
    const org = await Organization.findById(req.user!.organizationId);
    if (!org) {
      res.status(404).json({ message: 'Organization not found' });
      return;
    }

    const { name, timezone, weekStartsOn, shiftTypes } = req.body;
    if (name) org.name = name;
    if (timezone) org.timezone = timezone;
    if (weekStartsOn !== undefined) org.weekStartsOn = weekStartsOn;
    if (shiftTypes) org.shiftTypes = shiftTypes;

    await org.save();
    res.json(org);
  } catch {
    res.status(500).json({ message: 'Failed to update organization' });
  }
}

export async function getMembers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const members = await User.find({ organizationId: req.user!.organizationId })
      .select('-password -refreshToken')
      .sort({ role: 1, firstName: 1 });
    res.json(members);
  } catch {
    res.status(500).json({ message: 'Failed to get members' });
  }
}

export async function getInviteCode(req: AuthRequest, res: Response): Promise<void> {
  try {
    const org = await Organization.findById(req.user!.organizationId);
    if (!org) {
      res.status(404).json({ message: 'Organization not found' });
      return;
    }
    res.json({ inviteCode: org.inviteCode });
  } catch {
    res.status(500).json({ message: 'Failed to get invite code' });
  }
}
