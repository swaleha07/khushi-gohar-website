import { ISmsProvider, SendOtpResult } from './types';

/**
 * Fast2SMS Provider (Default for India / +91 numbers)
 * Uses Dev API: https://www.fast2sms.com/dev/bulkV2
 * Requires FAST2SMS_API_KEY (or SMS_PROVIDER_API_KEY) in environment variables
 */
export class Fast2SmsProvider implements ISmsProvider {
  name = 'Fast2SMS';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey.trim();
  }

  async sendOtp(toPhone: string, otp: string): Promise<SendOtpResult> {
    try {
      // Clean phone number to 10 digits for Indian mobile numbers
      const cleanPhone = toPhone.replace(/\D/g, '').slice(-10);
      if (cleanPhone.length !== 10) {
        return {
          success: false,
          error: 'Fast2SMS requires a valid 10-digit Indian mobile number.',
          provider: this.name,
        };
      }

      // Fast2SMS bulkV2 POST request with route 'otp'
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: this.apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: cleanPhone,
        }),
      });

      const data = await response.json().catch(() => ({}));

      // Fast2SMS strictly returns { return: true } on successful SMS queuing
      if (response.ok && data.return === true) {
        return {
          success: true,
          messageId: data.request_id || `fast2sms_${Date.now()}`,
          provider: this.name,
        };
      } else {
        let errorMsg = 'Failed to dispatch SMS through Fast2SMS gateway.';

        if (Array.isArray(data.message) && data.message.length > 0) {
          errorMsg = data.message.join(', ');
        } else if (typeof data.message === 'string' && data.message.trim()) {
          errorMsg = data.message;
        } else if (response.status === 401) {
          errorMsg = 'Invalid Fast2SMS authorization key. Please verify FAST2SMS_API_KEY in Vercel settings.';
        } else if (data.status_code === 416) {
          errorMsg = 'Fast2SMS wallet balance is insufficient to send OTP SMS.';
        }

        console.error('[SMS ERROR] Fast2SMS dispatch failed:', {
          status: response.status,
          statusCode: data.status_code,
          message: data.message,
        });

        return {
          success: false,
          error: errorMsg,
          provider: this.name,
        };
      }
    } catch (err: any) {
      console.error('[SMS ERROR] Fast2SMS network error:', err);
      return {
        success: false,
        error: err.message || 'Unable to connect to SMS delivery gateway. Please try again.',
        provider: this.name,
      };
    }
  }
}

/**
 * Twilio SMS Provider (Global delivery)
 * Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 */
export class TwilioProvider implements ISmsProvider {
  name = 'Twilio';
  private accountSid: string;
  private authToken: string;
  private fromPhone: string;

  constructor(accountSid: string, authToken: string, fromPhone: string) {
    this.accountSid = accountSid.trim();
    this.authToken = authToken.trim();
    this.fromPhone = fromPhone.trim();
  }

  async sendOtp(toPhone: string, otp: string): Promise<SendOtpResult> {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      const basicAuth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');

      const formattedTo = toPhone.startsWith('+') ? toPhone : `+${toPhone}`;
      const params = new URLSearchParams();
      params.append('To', formattedTo);
      params.append('From', this.fromPhone);
      params.append('Body', `Your Khushi & Gohar verification code is: ${otp}. Valid for 5 minutes. Do not share this with anyone.`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok && data.sid) {
        return {
          success: true,
          messageId: data.sid,
          provider: this.name,
        };
      } else {
        const errorMsg = data.message || `Twilio SMS delivery failed (${response.status})`;
        console.error('[SMS ERROR] Twilio dispatch failed:', { status: response.status, data });
        return {
          success: false,
          error: errorMsg,
          provider: this.name,
        };
      }
    } catch (err: any) {
      console.error('[SMS ERROR] Twilio network error:', err);
      return {
        success: false,
        error: err.message || 'Failed to dispatch SMS via Twilio gateway.',
        provider: this.name,
      };
    }
  }
}

/**
 * MSG91 SMS Provider
 * Requires MSG91_AUTH_KEY, MSG91_TEMPLATE_ID
 */
export class Msg91Provider implements ISmsProvider {
  name = 'MSG91';
  private authKey: string;
  private templateId?: string;

  constructor(authKey: string, templateId?: string) {
    this.authKey = authKey.trim();
    this.templateId = templateId?.trim();
  }

  async sendOtp(toPhone: string, otp: string): Promise<SendOtpResult> {
    try {
      const cleanPhone = toPhone.replace(/\D/g, '');
      const url = new URL('https://api.msg91.com/api/v5/otp');
      url.searchParams.append('template_id', this.templateId || 'default_otp');
      url.searchParams.append('mobile', cleanPhone);
      url.searchParams.append('authkey', this.authKey);
      url.searchParams.append('otp', otp);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok && (data.type === 'success' || data.return === true)) {
        return {
          success: true,
          messageId: data.message || `msg91_${Date.now()}`,
          provider: this.name,
        };
      } else {
        const errorMsg = data.message || `MSG91 OTP delivery failed (${response.status})`;
        console.error('[SMS ERROR] MSG91 dispatch failed:', { status: response.status, data });
        return {
          success: false,
          error: errorMsg,
          provider: this.name,
        };
      }
    } catch (err: any) {
      console.error('[SMS ERROR] MSG91 network error:', err);
      return {
        success: false,
        error: err.message || 'Failed to dispatch SMS via MSG91 gateway.',
        provider: this.name,
      };
    }
  }
}

/**
 * Unconfigured Provider
 * Triggered when real SMS provider credentials are not yet configured in environment variables.
 * Fails with a clear, honest error message instead of faking delivery.
 */
export class UnconfiguredSmsProvider implements ISmsProvider {
  name = 'Unconfigured SMS Provider';

  async sendOtp(toPhone: string): Promise<SendOtpResult> {
    console.error(
      `[SMS ERROR] Cannot send live SMS to ${toPhone}: SMS Provider credentials are not configured in environment variables.`
    );
    return {
      success: false,
      error:
        'Unable to send OTP. SMS gateway credentials are not configured in Vercel environment variables (FAST2SMS_API_KEY or TWILIO credentials required).',
      provider: this.name,
    };
  }
}

/**
 * Dynamic Provider Resolver based on environment configuration.
 * Inspects all configured provider keys and selects the appropriate provider.
 * Never fakes SMS dispatch if credentials are not configured.
 */
export function getSmsProvider(): ISmsProvider {
  const providerType = process.env.SMS_PROVIDER?.toLowerCase().trim();

  // Helper to test if a key is a placeholder
  const isRealKey = (val?: string): boolean => {
    if (!val) return false;
    const v = val.trim().toLowerCase();
    return (
      v.length > 5 &&
      !v.includes('your_') &&
      !v.includes('change_me') &&
      !v.includes('placeholder') &&
      !v.includes('sample')
    );
  };

  // 1. Fast2SMS (Check FAST2SMS_API_KEY, SMS_PROVIDER_API_KEY, SMS_API_KEY)
  const fast2smsKey =
    process.env.FAST2SMS_API_KEY ||
    process.env.SMS_PROVIDER_API_KEY ||
    process.env.SMS_API_KEY;

  if ((providerType === 'fast2sms' || !providerType) && isRealKey(fast2smsKey)) {
    return new Fast2SmsProvider(fast2smsKey!);
  }

  // 2. Twilio (Check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
  const twilioSid = process.env.TWILIO_ACCOUNT_SID || process.env.SMS_PROVIDER_AUTH_TOKEN;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER || process.env.SMS_PROVIDER_SENDER_ID;

  if (
    (providerType === 'twilio' || !providerType) &&
    isRealKey(twilioSid) &&
    isRealKey(twilioToken) &&
    isRealKey(twilioFrom)
  ) {
    return new TwilioProvider(twilioSid!, twilioToken!, twilioFrom!);
  }

  // 3. MSG91 (Check MSG91_AUTH_KEY)
  const msg91Key = process.env.MSG91_AUTH_KEY;
  if ((providerType === 'msg91' || !providerType) && isRealKey(msg91Key)) {
    return new Msg91Provider(msg91Key!, process.env.MSG91_TEMPLATE_ID);
  }

  // If explicitly designated Fast2SMS but key is invalid
  if (providerType === 'fast2sms' && fast2smsKey && isRealKey(fast2smsKey)) {
    return new Fast2SmsProvider(fast2smsKey);
  }

  // 4. Default: Unconfigured Provider (Returns clear error, never pretends success)
  return new UnconfiguredSmsProvider();
}
