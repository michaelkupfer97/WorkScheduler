import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { AuthRequest } from '../middleware/auth.js';

function generateTokens(userId: string) {
  const accessToken = jwt.sign({ id: userId }, env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

/** Atomically create organization + manager user (no orphan accounts). Requires MongoDB replica set (Atlas OK). */
export async function registerCreateOrg(req: Request, res: Response): Promise<void> {
  const { email, password, firstName, lastName, locale, name, timezone, weekStartsOn, shiftTypes } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400).json({ message: 'Email already registered' });
    return;
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const [org] = await Organization.create([{ name, timezone, weekStartsOn, shiftTypes }], { session });
    const [user] = await User.create(
      [{ email, password, firstName, lastName, locale, role: 'manager', organizationId: org._id }],
      { session }
    );
    const tokens = generateTokens(user._id.toString());
    user.refreshToken = tokens.refreshToken;
    await user.save({ session });
    await session.commitTransaction();
    res.status(201).json({ user: user.toJSON(), tokens });
  } catch (error: unknown) {
    await session.abortTransaction();
    if ((error as { code?: number })?.code === 11000) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }
    res.status(500).json({ message: 'Registration failed' });
  } finally {
    session.endSession();
  }
}

/** Atomically join organization + create employee user (no orphan accounts). */
export async function registerJoinOrg(req: Request, res: Response): Promise<void> {
  const { email, password, firstName, lastName, locale, inviteCode } = req.body;
  const code = String(inviteCode).trim().toLowerCase();

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400).json({ message: 'Email already registered' });
    return;
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const org = await Organization.findOne({ inviteCode: code }).session(session);
    if (!org) {
      await session.abortTransaction();
      res.status(404).json({ message: 'Invalid invite code' });
      return;
    }
    const [user] = await User.create(
      [{ email, password, firstName, lastName, locale, role: 'employee', organizationId: org._id }],
      { session }
    );
    const tokens = generateTokens(user._id.toString());
    user.refreshToken = tokens.refreshToken;
    await user.save({ session });
    await session.commitTransaction();
    res.status(201).json({ user: user.toJSON(), tokens });
  } catch (error: unknown) {
    await session.abortTransaction();
    if ((error as { code?: number })?.code === 11000) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }
    res.status(500).json({ message: 'Registration failed' });
  } finally {
    session.endSession();
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const tokens = generateTokens(user._id.toString());
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({ user: user.toJSON(), tokens });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ message: 'Refresh token required' });
      return;
    }

    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    const tokens = generateTokens(user._id.toString());
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({ tokens });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
}

export async function logout(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (req.user) {
      req.user.refreshToken = undefined;
      await req.user.save();
    }
    res.json({ message: 'Logged out' });
  } catch {
    res.status(500).json({ message: 'Logout failed' });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  res.json(req.user);
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { firstName, lastName, phone, locale } = req.body;
    const user = req.user!;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (locale) user.locale = locale;

    await user.save();
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Update failed' });
  }
}
