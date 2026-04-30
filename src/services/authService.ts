import { User, IUser } from '../models/User';
import { Otp } from '../models/Otp';
import { AuthSession } from '../models/AuthSession';
import { sendMail } from '../config/mail';
import { generateOtp, hashOtp, getOtpExpiry } from '../utils/otp';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens';
import { env } from '../config/env';
import { HTTP_STATUS } from '../constants/httpStatus';
import { createError } from '../middlewares/errorHandler';
import { ROLES } from '../constants/roles';
import type {
  RegisterInput,
  LoginInput,
  VerifyOtpInput,
  ChangePasswordInput,
  UpdateSecuritySettingsInput,
} from '../validators/auth.validator';

interface SessionMeta {
  userAgent?: string;
  ipAddress?: string;
}

interface SessionView {
  id: string;
  device: string;
  location: string;
  userAgent: string;
  ipAddress: string;
  lastActiveAt: Date;
  createdAt: Date;
  current: boolean;
}

function parseDeviceName(userAgent?: string): string {
  const ua = (userAgent || '').toLowerCase();
  if (ua.includes('iphone')) return 'Safari on iPhone';
  if (ua.includes('android')) return 'Android device';
  if (ua.includes('edg/')) return 'Edge browser';
  if (ua.includes('chrome/')) return 'Chrome browser';
  if (ua.includes('firefox/')) return 'Firefox browser';
  if (ua.includes('safari/') && !ua.includes('chrome/')) return 'Safari browser';
  return 'Unknown device';
}

function sendLoginAlert(user: IUser, meta?: SessionMeta): void {
  if (!user.loginAlerts) return;
  const device = parseDeviceName(meta?.userAgent);
  const ipAddress = meta?.ipAddress || 'Unknown IP';

  void sendMail({
    to: user.email,
    subject: 'New login detected on your account',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2>Security Alert</h2>
        <p>A new login was detected on your account.</p>
        <p><strong>Device:</strong> ${device}</p>
        <p><strong>IP Address:</strong> ${ipAddress}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p>If this was not you, please reset your password immediately.</p>
      </div>
    `,
  }).catch(() => {
    // Non-blocking notification.
  });
}

export async function registerUser(input: RegisterInput): Promise<IUser> {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw createError('Email already registered', HTTP_STATUS.CONFLICT);
  }

  const user = await User.create({
    email: input.email,
    password: input.password,
    role: ROLES.USER,
    isVerified: false,
    loginAlerts: true,
  });

  await sendVerificationOtp(user);
  return user;
}

export async function sendVerificationOtp(user: IUser): Promise<void> {
  const otp = generateOtp();
  const hashedOtp = hashOtp(otp);

  await Otp.deleteMany({ userId: user._id });
  await Otp.create({
    userId: user._id,
    hashedOtp,
    expiresAt: getOtpExpiry(),
    attempts: 0,
  });

  await sendMail({
    to: user.email,
    subject: 'Verify your Neza Designs account',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>Email Verification</h2>
        <p>Your OTP code is:</p>
        <h1 style="letter-spacing:8px;font-size:36px;color:#B75E1A">${otp}</h1>
        <p>This code expires in ${env.OTP_EXPIRES_IN_MINUTES} minutes.</p>
        <p>If you did not request this, ignore this email.</p>
      </div>
    `,
  });
}

export async function verifyOtp(
  input: VerifyOtpInput,
  meta?: SessionMeta
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: IUser;
}> {
  const user = await User.findOne({ email: input.email });
  if (!user) throw createError('User not found', HTTP_STATUS.NOT_FOUND);

  const otpRecord = await Otp.findOne({ userId: user._id });
  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    throw createError('OTP expired or not found', HTTP_STATUS.BAD_REQUEST);
  }

  if (otpRecord.attempts >= env.OTP_MAX_ATTEMPTS) {
    await Otp.deleteOne({ _id: otpRecord._id });
    throw createError('Maximum OTP attempts exceeded. Please request a new code.', HTTP_STATUS.TOO_MANY_REQUESTS);
  }

  const hash = hashOtp(input.otp);
  if (hash !== otpRecord.hashedOtp) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw createError('Invalid OTP', HTTP_STATUS.BAD_REQUEST);
  }

  await Otp.deleteOne({ _id: otpRecord._id });
  user.isVerified = true;
  user.lastLogin = new Date();
  await user.save();

  const tokens = await issueTokens(user, meta);
  sendLoginAlert(user, meta);
  return tokens;
}

export async function loginUser(
  input: LoginInput,
  meta?: SessionMeta
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: IUser;
  requiresOtp?: boolean;
}> {
  const user = await User.findOne({ email: input.email }).select('+password');
  if (!user) throw createError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED);

  const valid = await user.comparePassword(input.password);
  if (!valid) throw createError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED);

  if (!user.isVerified) {
    await sendVerificationOtp(user);
    return { accessToken: '', refreshToken: '', user, requiresOtp: true };
  }

  if (user.twoFAEnabled) {
    await sendVerificationOtp(user);
    return { accessToken: '', refreshToken: '', user, requiresOtp: true };
  }

  user.lastLogin = new Date();
  const tokens = await issueTokens(user, meta);
  sendLoginAlert(user, meta);
  return { ...tokens, user };
}

export async function refreshAccessToken(
  refreshToken: string,
  meta?: SessionMeta
): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw createError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED);
  }

  const session = await AuthSession.findOne({ refreshToken, revokedAt: null });
  if (!session) {
    throw createError('Refresh token revoked', HTTP_STATUS.UNAUTHORIZED);
  }

  if ((session.userId as unknown as { toString(): string }).toString() !== payload.userId) {
    throw createError('Refresh token revoked', HTTP_STATUS.UNAUTHORIZED);
  }

  const user = await User.findById(payload.userId);
  if (!user) throw createError('User not found', HTTP_STATUS.NOT_FOUND);

  const tokens = await issueTokens(user, meta, (session._id as unknown as { toString(): string }).toString());
  return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
}

export async function logoutUser(userId: string, refreshToken?: string): Promise<void> {
  if (refreshToken) {
    await AuthSession.findOneAndUpdate(
      { userId, refreshToken, revokedAt: null },
      { revokedAt: new Date() }
    );
    return;
  }
  await AuthSession.updateMany({ userId, revokedAt: null }, { revokedAt: new Date() });
}

export async function sendPasswordResetOtp(email: string): Promise<void> {
  const user = await User.findOne({ email });
  if (!user) return; // silently succeed to prevent enumeration
  await sendVerificationOtp(user);
}

export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string
): Promise<void> {
  const user = await User.findOne({ email });
  if (!user) throw createError('User not found', HTTP_STATUS.NOT_FOUND);

  const otpRecord = await Otp.findOne({ userId: user._id });
  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    throw createError('OTP expired or not found', HTTP_STATUS.BAD_REQUEST);
  }

  if (otpRecord.attempts >= env.OTP_MAX_ATTEMPTS) {
    await Otp.deleteOne({ _id: otpRecord._id });
    throw createError('Maximum OTP attempts exceeded', HTTP_STATUS.TOO_MANY_REQUESTS);
  }

  const hash = hashOtp(otp);
  if (hash !== otpRecord.hashedOtp) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw createError('Invalid OTP', HTTP_STATUS.BAD_REQUEST);
  }

  await Otp.deleteOne({ _id: otpRecord._id });
  user.password = newPassword;
  await user.save();
  await AuthSession.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() });
}

export async function changePassword(
  userId: string,
  input: ChangePasswordInput
): Promise<void> {
  const user = await User.findById(userId).select('+password');
  if (!user) throw createError('User not found', HTTP_STATUS.NOT_FOUND);

  const valid = await user.comparePassword(input.currentPassword);
  if (!valid) throw createError('Current password is incorrect', HTTP_STATUS.BAD_REQUEST);

  user.password = input.newPassword;
  await user.save();
  await AuthSession.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() });
}

export async function getSecuritySettings(userId: string): Promise<{
  twoFAEnabled: boolean;
  loginAlerts: boolean;
}> {
  const user = await User.findById(userId).lean();
  if (!user) throw createError('User not found', HTTP_STATUS.NOT_FOUND);
  return {
    twoFAEnabled: Boolean(user.twoFAEnabled),
    loginAlerts: user.loginAlerts !== false,
  };
}

export async function updateSecuritySettings(
  userId: string,
  updates: UpdateSecuritySettingsInput
): Promise<{
  twoFAEnabled: boolean;
  loginAlerts: boolean;
}> {
  const user = await User.findById(userId);
  if (!user) throw createError('User not found', HTTP_STATUS.NOT_FOUND);

  if (typeof updates.twoFAEnabled === 'boolean') user.twoFAEnabled = updates.twoFAEnabled;
  if (typeof updates.loginAlerts === 'boolean') user.loginAlerts = updates.loginAlerts;

  await user.save();

  return {
    twoFAEnabled: user.twoFAEnabled,
    loginAlerts: user.loginAlerts,
  };
}

export async function getActiveSessions(
  userId: string,
  currentRefreshToken?: string
): Promise<SessionView[]> {
  const sessions = await AuthSession.find({ userId, revokedAt: null })
    .sort({ lastActiveAt: -1 })
    .lean();

  return sessions.map((session) => ({
    id: (session._id as unknown as { toString(): string }).toString(),
    device: session.device || parseDeviceName(session.userAgent),
    location: session.location || 'Unknown location',
    userAgent: session.userAgent || 'Unknown user agent',
    ipAddress: session.ipAddress || 'Unknown IP',
    lastActiveAt: session.lastActiveAt,
    createdAt: session.createdAt,
    current: Boolean(currentRefreshToken && session.refreshToken === currentRefreshToken),
  }));
}

export async function revokeSession(userId: string, sessionId: string): Promise<void> {
  const result = await AuthSession.findOneAndUpdate(
    { _id: sessionId, userId, revokedAt: null },
    { revokedAt: new Date() }
  );
  if (!result) throw createError('Session not found', HTTP_STATUS.NOT_FOUND);
}

export async function revokeOtherSessions(userId: string, currentRefreshToken?: string): Promise<void> {
  if (!currentRefreshToken) {
    await AuthSession.updateMany({ userId, revokedAt: null }, { revokedAt: new Date() });
    return;
  }

  const current = await AuthSession.findOne({ userId, refreshToken: currentRefreshToken, revokedAt: null });
  if (!current) {
    await AuthSession.updateMany({ userId, revokedAt: null }, { revokedAt: new Date() });
    return;
  }

  await AuthSession.updateMany(
    {
      userId,
      revokedAt: null,
      _id: { $ne: current._id },
    },
    { revokedAt: new Date() }
  );
}

export async function deleteMyAccount(userId: string): Promise<void> {
  await Promise.all([
    AuthSession.deleteMany({ userId }),
    Otp.deleteMany({ userId }),
    User.findByIdAndDelete(userId),
  ]);
}

async function issueTokens(
  user: IUser,
  meta?: SessionMeta,
  existingSessionId?: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: IUser;
}> {
  const payload = {
    userId: (user._id as unknown as { toString(): string }).toString(),
    email: user.email,
    role: user.role,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const sessionPayload = {
    refreshToken,
    userAgent: meta?.userAgent,
    ipAddress: meta?.ipAddress,
    location: meta?.ipAddress ? `IP: ${meta.ipAddress}` : 'Unknown location',
    device: parseDeviceName(meta?.userAgent),
    lastActiveAt: new Date(),
  };

  if (existingSessionId) {
    await AuthSession.findByIdAndUpdate(existingSessionId, sessionPayload);
  } else {
    await AuthSession.create({
      userId: user._id,
      ...sessionPayload,
    });
  }

  return { accessToken, refreshToken, user };
}
