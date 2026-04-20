import mongoose from 'mongoose';
import { Shift } from '../models/Shift.js';
import { ShiftTemplate } from '../models/ShiftTemplate.js';
import { Constraint } from '../models/Constraint.js';
import { TimeOffRequest } from '../models/TimeOffRequest.js';
import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';

interface ScheduleResult {
  shifts: Array<{
    date: Date;
    shiftType: string;
    startTime: string;
    endTime: string;
    assignedEmployees: string[];
    requiredCount: number;
    color?: string;
  }>;
  conflicts: Array<{
    type: 'understaffed' | 'constraint_violation' | 'overworked' | 'time_off_conflict';
    message: string;
    date: string;
    shiftType: string;
  }>;
}

export async function generateWeeklySchedule(
  organizationId: string,
  weekStartDate: Date
): Promise<ScheduleResult> {
  const org = await Organization.findById(organizationId);
  if (!org) throw new Error('Organization not found');

  const templates = await ShiftTemplate.find({ organizationId });
  const employees = await User.find({ organizationId, role: 'employee' });
  const constraints = await Constraint.find({
    organizationId,
    weekStartDate,
  });
  const timeOffRequests = await TimeOffRequest.find({
    organizationId,
    status: 'approved',
    startDate: { $lte: new Date(weekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000) },
    endDate: { $gte: weekStartDate },
  });

  const shiftTypeMap = new Map(org.shiftTypes.map((st) => [st.name, st]));
  const constraintMap = new Map(constraints.map((c) => [c.userId.toString(), c]));

  const timeOffByEmployee = new Map<string, Set<number>>();
  for (const req of timeOffRequests) {
    const empId = req.userId.toString();
    if (!timeOffByEmployee.has(empId)) timeOffByEmployee.set(empId, new Set());
    const start = new Date(req.startDate);
    const end = new Date(req.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      timeOffByEmployee.get(empId)!.add(d.getDay());
    }
  }

  const employeeHours = new Map<string, number>(employees.map((e) => [e._id.toString(), 0]));
  const shifts: ScheduleResult['shifts'] = [];
  const conflicts: ScheduleResult['conflicts'] = [];

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(weekStartDate);
    date.setDate(date.getDate() + dayOffset);
    const dayOfWeek = date.getDay();

    const dayTemplates = templates.filter((t) => t.dayOfWeek === dayOfWeek);

    for (const template of dayTemplates) {
      const shiftConfig = shiftTypeMap.get(template.shiftType);
      if (!shiftConfig) continue;

      const available: Array<{ id: string; score: number }> = [];

      for (const emp of employees) {
        const empId = emp._id.toString();

        if (timeOffByEmployee.get(empId)?.has(dayOfWeek)) continue;

        const constraint = constraintMap.get(empId);
        const entry = constraint?.entries.find(
          (e) => e.dayOfWeek === dayOfWeek && e.shiftType === template.shiftType
        );

        if (entry?.preference === 'unavailable') continue;

        let score = 0;
        if (entry?.preference === 'preferred') score = 2;
        else if (entry?.preference === 'available') score = 1;
        else score = 0.5;

        const hours = employeeHours.get(empId) || 0;
        score -= hours * 0.01;

        available.push({ id: empId, score });
      }

      available.sort((a, b) => b.score - a.score);

      const assigned = available.slice(0, template.requiredCount).map((a) => a.id);

      for (const empId of assigned) {
        const start = parseInt(shiftConfig.startTime.split(':')[0]);
        const end = parseInt(shiftConfig.endTime.split(':')[0]);
        const hours = end > start ? end - start : 24 - start + end;
        employeeHours.set(empId, (employeeHours.get(empId) || 0) + hours);
      }

      if (assigned.length < template.requiredCount) {
        conflicts.push({
          type: 'understaffed',
          message: `Need ${template.requiredCount} employees but only ${assigned.length} available`,
          date: date.toISOString().split('T')[0],
          shiftType: template.shiftType,
        });
      }

      shifts.push({
        date,
        shiftType: template.shiftType,
        startTime: shiftConfig.startTime,
        endTime: shiftConfig.endTime,
        assignedEmployees: assigned,
        requiredCount: template.requiredCount,
        color: shiftConfig.color,
      });
    }
  }

  for (const [empId, hours] of employeeHours) {
    if (hours > 48) {
      const emp = employees.find((e) => e._id.toString() === empId);
      conflicts.push({
        type: 'overworked',
        message: `${emp?.firstName} ${emp?.lastName} scheduled for ${hours}h (max 48h)`,
        date: weekStartDate.toISOString().split('T')[0],
        shiftType: 'all',
      });
    }
  }

  return { shifts, conflicts };
}

export async function applySchedule(
  organizationId: string,
  weekStartDate: Date,
  schedule: ScheduleResult['shifts'],
  status: 'draft' | 'published' = 'draft'
): Promise<void> {
  const weekEnd = new Date(weekStartDate);
  weekEnd.setDate(weekEnd.getDate() + 7);

  await Shift.deleteMany({
    organizationId,
    date: { $gte: weekStartDate, $lt: weekEnd },
    status: 'draft',
  });

  const shifts = schedule.map((s) => ({
    organizationId: new mongoose.Types.ObjectId(organizationId),
    date: s.date,
    shiftType: s.shiftType,
    startTime: s.startTime,
    endTime: s.endTime,
    assignedEmployees: s.assignedEmployees.map((id) => new mongoose.Types.ObjectId(id)),
    requiredCount: s.requiredCount,
    status,
    color: s.color,
  }));

  await Shift.insertMany(shifts);
}
