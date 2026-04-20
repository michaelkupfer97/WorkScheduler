import { z } from 'zod';

/** Core account fields — user is only persisted together with an organization (see registerCreateOrg / registerJoinOrg). */
export const registerAccountSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  locale: z.enum(['en', 'he']).default('en'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createOrganizationSchema = z.object({
  name: z.string().min(1).max(100),
  timezone: z.string().default('Asia/Jerusalem'),
  weekStartsOn: z.number().min(0).max(6).default(0),
  shiftTypes: z
    .array(
      z.object({
        name: z.string().min(1),
        startTime: z.string(),
        endTime: z.string(),
        color: z.string(),
      })
    )
    .optional(),
});

export const joinOrganizationSchema = z.object({
  inviteCode: z.string().min(1),
});

export const registerCreateOrgSchema = registerAccountSchema.merge(createOrganizationSchema);

export const registerJoinOrgSchema = registerAccountSchema.merge(joinOrganizationSchema);

/** @deprecated Prefer registerCreateOrgSchema / registerJoinOrgSchema — kept for tooling or legacy references */
export const registerSchema = registerAccountSchema.extend({
  role: z.enum(['manager', 'employee']).default('employee'),
});

export const shiftTemplateSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  shiftType: z.string().min(1),
  requiredCount: z.number().min(1),
});

export const createShiftSchema = z.object({
  date: z.string(),
  shiftType: z.string().min(1),
  startTime: z.string(),
  endTime: z.string(),
  requiredCount: z.number().min(1),
  assignedEmployees: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const updateShiftSchema = createShiftSchema.partial().extend({
  status: z.enum(['draft', 'published', 'completed']).optional(),
  assignedEmployees: z.array(z.string()).optional(),
});

export const constraintSchema = z.object({
  weekStartDate: z.string(),
  entries: z.array(
    z.object({
      dayOfWeek: z.number().min(0).max(6),
      shiftType: z.string().min(1),
      preference: z.enum(['available', 'preferred', 'unavailable']),
    })
  ),
});

export const swapRequestSchema = z.object({
  targetEmployeeId: z.string(),
  originalShiftId: z.string(),
  targetShiftId: z.string(),
});

export const timeOffRequestSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().min(1).max(500),
});

export type RegisterAccountInput = z.infer<typeof registerAccountSchema>;
export type RegisterCreateOrgInput = z.infer<typeof registerCreateOrgSchema>;
export type RegisterJoinOrgInput = z.infer<typeof registerJoinOrgSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type JoinOrganizationInput = z.infer<typeof joinOrganizationSchema>;
export type ShiftTemplateInput = z.infer<typeof shiftTemplateSchema>;
export type CreateShiftInput = z.infer<typeof createShiftSchema>;
export type UpdateShiftInput = z.infer<typeof updateShiftSchema>;
export type ConstraintInput = z.infer<typeof constraintSchema>;
export type SwapRequestInput = z.infer<typeof swapRequestSchema>;
export type TimeOffRequestInput = z.infer<typeof timeOffRequestSchema>;
