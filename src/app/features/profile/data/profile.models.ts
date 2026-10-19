export interface Profile {
  id: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
  mustChangePassword: boolean;
  passwordChangeCompleted: boolean;
}

export interface UpdateProfileRequest {
  displayName?: string;
  email?: string;
  currentPassword?: string;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
