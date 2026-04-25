import crypto from 'crypto';
import { env } from '../config/env';

export function generateOtp(): string {
  // Cryptographically random 6-digit OTP
  const bytes = crypto.randomBytes(4);
  const num = bytes.readUInt32BE(0) % 1000000;
  return num.toString().padStart(6, '0');
}

export function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export function getOtpExpiry(): Date {
  const now = new Date();
  now.setMinutes(now.getMinutes() + env.OTP_EXPIRES_IN_MINUTES);
  return now;
}
