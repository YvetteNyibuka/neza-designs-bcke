import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated, sendNotFound } from '../utils/response';
import * as contactService from '../services/contactService';
import { sendMail } from '../config/mail';

export const submitContact = asyncHandler(async (req: Request, res: Response) => {
  const contact = await contactService.createContact(req.body);

  // Notification email to admin (non-blocking)
  sendMail({
    to: process.env.SMTP_USER || '',
    subject: `New contact: ${contact.subject}`,
    html: `
      <p><strong>Name:</strong> ${contact.name}</p>
      <p><strong>Email:</strong> ${contact.email}</p>
      ${contact.phone ? `<p><strong>Phone:</strong> ${contact.phone}</p>` : ''}
      <p><strong>Subject:</strong> ${contact.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${contact.message.replace(/\n/g, '<br>')}</p>
    `,
  }).catch(() => {/* suppress */});

  sendCreated(res, 'Message received. We will be in touch soon!', { id: (contact as any)._id });
});

export const getContacts = asyncHandler(async (req: Request, res: Response) => {
  const result = await contactService.getAllContacts(req.query as any);
  sendSuccess(res, 'Contacts fetched', result);
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const contact = await contactService.markContactRead(req.params['id'] as string, req.body.isRead !== false);
  if (!contact) { sendNotFound(res, 'Contact'); return; }
  sendSuccess(res, 'Contact updated', contact);
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const contact = await contactService.updateContactStatus(
    req.params['id'] as string,
    req.body.status
  );
  if (!contact) { sendNotFound(res, 'Contact'); return; }
  sendSuccess(res, 'Inquiry status updated', contact);
});

export const replyContact = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const contactBeforeReply = await contactService.getContactById(id);
  if (!contactBeforeReply) { sendNotFound(res, 'Contact'); return; }

  const { subject, message } = req.body;

  await sendMail({
    to: contactBeforeReply.email,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:640px;margin:auto">
        <p>Hello ${contactBeforeReply.name},</p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <p style="margin-top:24px">Regards,<br>NEEZA Designs Team</p>
      </div>
    `,
  });

  const updated = await contactService.replyToContact(id, {
    subject,
    message,
    sentByUserId: req.user?.userId,
    sentByEmail: req.user?.email,
  });

  if (!updated) { sendNotFound(res, 'Contact'); return; }
  sendSuccess(res, 'Reply sent successfully', updated);
});

export const deleteContact = asyncHandler(async (req: Request, res: Response) => {
  const contact = await contactService.deleteContact(req.params['id'] as string);
  if (!contact) { sendNotFound(res, 'Contact'); return; }
  sendSuccess(res, 'Contact deleted');
});
