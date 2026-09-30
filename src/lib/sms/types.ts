export interface SendOtpResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}

export interface ISmsProvider {
  name: string;
  sendOtp(toPhone: string, otp: string): Promise<SendOtpResult>;
}
