export interface User {
  id: string;
  email: string;
  nickname?: string;
  fullName?: string;
  about?: string;
  experience?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ProfileData {
  nickname: string;
  fullName: string;
  about: string;
  experience: string;
  acceptTerms: boolean;
}

export interface VulnerabilityReport {
  id: string;
  user_id: string;
  domain: string;
  affected_url: string;
  vulnerability_type: string;
  steps_to_reproduce: string;
  impact: string;
  proof_of_concept?: string;
  attachments?: string[];
  status: 'pending' | 'on_hold' | 'accepted' | 'rejected' | 'patched';
  admin_comment?: string;
  submitted_at: string;
  updated_at: string;
  email?: string;
  nickname?: string;
  full_name?: string;
  user?: User;
}

export interface ReportFormData {
  domain: string;
  affected_url: string;
  vulnerability_type: string;
  steps_to_reproduce: string;
  impact: string;
  proof_of_concept?: string;
}

export interface Analytics {
  totalReports: number;
  pendingReports: number;
  acceptedReports: number;
  rejectedReports: number;
  patchedReports: number;
  reportsByMonth: { month: string; count: number }[];
  reportsByType: { type: string; count: number }[];
  recentReports: VulnerabilityReport[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  duplicate?: boolean;
  nextSubmissionTime?: string;
}
