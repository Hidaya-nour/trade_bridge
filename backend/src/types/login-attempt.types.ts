export interface ILoginAttempt {
  id: string;
  email: string;
  ip_address: string;
  user_agent?: string;
  success: boolean;
  attempted_at: Date;
}