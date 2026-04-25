import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, Role } from '../constants/roles';
import { COLLECTIONS } from '../constants/collections';

export interface IUser extends Document {
  email: string;
  password: string;
  role: Role;
  isVerified: boolean;
  twoFAEnabled: boolean;
  loginAlerts: boolean;
  refreshToken?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    isVerified: { type: Boolean, default: false },
    twoFAEnabled: { type: Boolean, default: false },
    loginAlerts: { type: Boolean, default: true },
    refreshToken: { type: String, select: false },
    lastLogin: { type: Date },
  },
  { timestamps: true, collection: COLLECTIONS.USERS }
);

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// Never return password or refreshToken in API responses
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const r = ret as unknown as Record<string, unknown>;
    delete r['password'];
    delete r['refreshToken'];
    return ret;
  },
});

export const User = mongoose.model<IUser>('User', UserSchema);
