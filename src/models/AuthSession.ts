import mongoose, { Document, Schema } from 'mongoose';
import { COLLECTIONS } from '../constants/collections';

export interface IAuthSession extends Document {
  userId: mongoose.Types.ObjectId;
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
  location?: string;
  device?: string;
  lastActiveAt: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AuthSessionSchema = new Schema<IAuthSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refreshToken: { type: String, required: true, index: true },
    userAgent: { type: String },
    ipAddress: { type: String },
    location: { type: String, default: 'Unknown location' },
    device: { type: String, default: 'Unknown device' },
    lastActiveAt: { type: Date, default: Date.now, index: true },
    revokedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true, collection: COLLECTIONS.AUTH_SESSIONS }
);

AuthSessionSchema.index({ userId: 1, revokedAt: 1, lastActiveAt: -1 });

export const AuthSession = mongoose.model<IAuthSession>('AuthSession', AuthSessionSchema);
