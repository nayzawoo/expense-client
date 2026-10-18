export interface CurrentUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  mustChangePassword: boolean;
}

export interface Household {
  id: string;
  name: string;
  currency: string;
  currencyScale: number;
  timezone: string;
}

export interface CsrfBootstrap {
  token: string;
  headerName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
