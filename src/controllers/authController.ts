import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated } from '../utils/response';
import * as authService from '../services/authService';
import { env } from '../config/env';
import { HTTP_STATUS } from '../constants/httpStatus';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.registerUser(req.body);
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Registration successful. Please verify your email with the OTP sent.',
    data: { email: user.email },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body, {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });

  if (result.requiresOtp) {
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'OTP sent to your email. Please verify.',
      data: { requiresOtp: true, email: result.user.email },
    });
    return;
  }

  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
  sendSuccess(res, 'Login successful', {
    accessToken: result.accessToken,
    user: result.user,
  });
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.verifyOtp(req.body, {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });
  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
  sendSuccess(res, 'OTP verified successfully', {
    accessToken: result.accessToken,
    user: result.user,
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: 'Refresh token required' });
    return;
  }
  const tokens = await authService.refreshAccessToken(token, {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });
  res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);
  sendSuccess(res, 'Token refreshed', { accessToken: tokens.accessToken });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.user) {
    const token = req.cookies?.refreshToken as string | undefined;
    await authService.logoutUser(req.user.userId, token);
  }
  res.clearCookie('refreshToken');
  sendSuccess(res, 'Logged out successfully');
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.sendPasswordResetOtp(req.body.email);
  sendSuccess(res, 'If that email is registered, a reset OTP has been sent.');
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  await authService.resetPassword(email, otp, newPassword);
  sendSuccess(res, 'Password reset successfully. Please log in.');
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, 'Authenticated', req.user);
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
    return;
  }
  await authService.changePassword(req.user.userId, req.body);
  sendSuccess(res, 'Password changed successfully');
});

export const getSecuritySettings = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const settings = await authService.getSecuritySettings(req.user.userId);
  sendSuccess(res, 'Security settings fetched', settings);
});

export const updateSecuritySettings = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const settings = await authService.updateSecuritySettings(req.user.userId, req.body);
  sendSuccess(res, 'Security settings updated', settings);
});

export const getSessions = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const currentRefreshToken = req.cookies?.refreshToken as string | undefined;
  const sessions = await authService.getActiveSessions(req.user.userId, currentRefreshToken);
  sendSuccess(res, 'Sessions fetched', sessions);
});

export const revokeSession = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
    return;
  }
  await authService.revokeSession(req.user.userId, req.params['id'] as string);
  sendSuccess(res, 'Session revoked');
});

export const revokeOtherSessions = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const currentRefreshToken = req.cookies?.refreshToken as string | undefined;
  await authService.revokeOtherSessions(req.user.userId, currentRefreshToken);
  sendSuccess(res, 'Other sessions revoked');
});

export const deleteMyAccount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
    return;
  }
  await authService.deleteMyAccount(req.user.userId);
  res.clearCookie('refreshToken');
  sendSuccess(res, 'Account deleted');
});
