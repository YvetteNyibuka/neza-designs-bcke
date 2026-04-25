import { Contact, ContactStatus, IContact } from '../models/Contact';
import { parsePagination, buildPaginatedResult } from '../utils/pagination';
import { PaginatedResult, PaginationQuery } from '../types';

export async function createContact(input: Partial<IContact>): Promise<IContact> {
  return Contact.create(input);
}

export async function getContactById(id: string): Promise<IContact | null> {
  return Contact.findById(id);
}

export async function getAllContacts(
  query: PaginationQuery & { isRead?: string; status?: ContactStatus }
): Promise<PaginatedResult<IContact>> {
  const { page, limit, skip } = parsePagination(query);
  const filter: Record<string, unknown> = {};
  if (query.isRead !== undefined) filter.isRead = query.isRead === 'true';
  if (query.status) {
    filter.status = query.status === 'new' ? { $in: ['new', null] } : query.status;
  }
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
      { subject: { $regex: query.search, $options: 'i' } },
      { message: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [data, total] = await Promise.all([
    Contact.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
    Contact.countDocuments(filter),
  ]);

  return buildPaginatedResult(data as unknown as IContact[], total, page, limit);
}

export async function markContactRead(id: string, isRead = true): Promise<IContact | null> {
  return Contact.findByIdAndUpdate(id, { isRead }, { new: true });
}

export async function updateContactStatus(id: string, status: ContactStatus): Promise<IContact | null> {
  return Contact.findByIdAndUpdate(id, { status, isRead: true }, { new: true });
}

export async function replyToContact(
  id: string,
  payload: {
    subject: string;
    message: string;
    sentByUserId?: string;
    sentByEmail?: string;
  }
): Promise<IContact | null> {
  return Contact.findByIdAndUpdate(
    id,
    {
      $push: {
        replies: {
          subject: payload.subject,
          message: payload.message,
          sentAt: new Date(),
          sentByUserId: payload.sentByUserId,
          sentByEmail: payload.sentByEmail,
        },
      },
      $set: {
        status: 'replied',
        isRead: true,
      },
    },
    { new: true }
  );
}

export async function deleteContact(id: string): Promise<IContact | null> {
  return Contact.findByIdAndDelete(id);
}
