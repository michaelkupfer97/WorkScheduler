export type Role = 'admin' | 'manager' | 'employee';
export type ShiftStatus = 'draft' | 'published' | 'completed';
export type SwapStatus = 'pending' | 'approved' | 'rejected';
export type Preference = 'available' | 'preferred' | 'unavailable';
export type TimeOffStatus = 'pending' | 'approved' | 'rejected';
export type Locale = 'en' | 'he';

export interface ShiftTypeConfig {
  name: string;
  startTime: string;
  endTime: string;
  color: string;
}

export interface ConstraintEntry {
  dayOfWeek: number;
  shiftType: string;
  preference: Preference;
}

export interface IUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  organizationId?: string;
  phone?: string;
  locale: Locale;
  createdAt: string;
  updatedAt: string;
}

export interface IOrganization {
  _id: string;
  name: string;
  timezone: string;
  weekStartsOn: number;
  shiftTypes: ShiftTypeConfig[];
  inviteCode: string;
  createdAt: string;
}

export interface IShiftTemplate {
  _id: string;
  organizationId: string;
  dayOfWeek: number;
  shiftType: string;
  requiredCount: number;
}

export interface IShift {
  _id: string;
  organizationId: string;
  date: string;
  shiftType: string;
  startTime: string;
  endTime: string;
  assignedEmployees: string[] | IUser[];
  requiredCount: number;
  status: ShiftStatus;
  notes?: string;
  color?: string;
}

export interface IConstraint {
  _id: string;
  userId: string | IUser;
  organizationId: string;
  weekStartDate: string;
  entries: ConstraintEntry[];
  submittedAt: string;
  deadline: string;
}

export interface ISwapRequest {
  _id: string;
  requesterId: string | IUser;
  targetEmployeeId: string | IUser;
  originalShiftId: string | IShift;
  targetShiftId: string | IShift;
  status: SwapStatus;
  managerNote?: string;
  createdAt: string;
}

export interface ITimeOffRequest {
  _id: string;
  userId: string | IUser;
  organizationId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: TimeOffStatus;
  managerNote?: string;
  createdAt: string;
}

export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'schedule' | 'swap' | 'timeoff' | 'reminder' | 'general';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: IUser;
  tokens: AuthTokens;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
