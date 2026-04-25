import mongoose, { Document, Schema } from 'mongoose';
import { COLLECTIONS } from '../constants/collections';

export interface IOtp extends Document {
  userId: mongoose.Types.ObjectId;
  hashedOtp: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hashedOtp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true, collection: COLLECTIONS.OTPS }
);

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpSchema.index({ userId: 1 });

export const Otp = mongoose.model<IOtp>('Otp', OtpSchema);
