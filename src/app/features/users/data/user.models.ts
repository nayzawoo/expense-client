export type UserRole = 'ADMIN' | 'MEMBER';
export type UserStatus = 'ACTIVE' | 'DISABLED';

export interface HouseholdUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  mustChangePassword: boolean;
  passwordChangeCompleted: boolean;
}

export interface CreateUserPayload {
  displayName: string;
  email: string;
  temporaryPassword: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  displayName?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface TemporaryPasswordPayload {
  temporaryPassword: string;
}
