import mongoose, { Document, Schema } from 'mongoose';
import { COLLECTIONS } from '../constants/collections';

export type ContactStatus = 'new' | 'replied' | 'closed';

export interface IContactReply {
  subject: string;
  message: string;
  sentAt: Date;
  sentByUserId?: string;
  sentByEmail?: string;
}

export interface IContact extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  status: ContactStatus;
  replies: IContactReply[];
  createdAt: Date;
  updatedAt: Date;
}

const ContactReplySchema = new Schema<IContactReply>(
  {
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    sentAt: { type: Date, default: Date.now },
    sentByUserId: { type: String },
    sentByEmail: { type: String, lowercase: true, trim: true },
  },
  { _id: false }
);

const ContactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    status: { type: String, enum: ['new', 'replied', 'closed'], default: 'new' },
    replies: { type: [ContactReplySchema], default: [] },
  },
  { timestamps: true, collection: COLLECTIONS.CONTACTS }
);

ContactSchema.index({ isRead: 1 });
ContactSchema.index({ status: 1 });
ContactSchema.index({ createdAt: -1 });

export const Contact = mongoose.model<IContact>('Contact', ContactSchema);
