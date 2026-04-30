import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated } from '../utils/response';
import * as newsletterService from '../services/newsletterService';

export const subscribe = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ success: false, message: 'A valid email address is required.' });
    return;
  }

  const result = await newsletterService.subscribe(email.toLowerCase().trim());

  if (result.alreadySubscribed) {
    sendSuccess(res, "You're already subscribed — we'll keep you posted!", {});
    return;
  }

  sendCreated(res, "You're subscribed! Expect great insights in your inbox.", {});
});

export const unsubscribe = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };
  if (!email) {
    res.status(400).json({ success: false, message: 'Email is required.' });
    return;
  }
  await newsletterService.unsubscribe(email.toLowerCase().trim());
  sendSuccess(res, 'Successfully unsubscribed.', {});
});

export const getSubscribers = asyncHandler(async (_req: Request, res: Response) => {
  const subscribers = await newsletterService.getAllSubscribers();
  sendSuccess(res, 'Subscribers fetched', subscribers);
});

export const broadcastNewsletter = asyncHandler(async (req: Request, res: Response) => {
  const { subject, html } = req.body as { subject?: string; html?: string };
  if (!subject?.trim() || !html?.trim()) {
    res.status(400).json({ success: false, message: 'Both subject and html body are required.' });
    return;
  }
  const sent = await newsletterService.broadcast(subject.trim(), html.trim());
  sendSuccess(res, `Newsletter sent to ${sent} subscriber(s).`, { sent });
});
