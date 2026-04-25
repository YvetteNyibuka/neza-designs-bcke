import mongoose, { Document, Schema } from 'mongoose';
import { COLLECTIONS } from '../constants/collections';

export interface ITeamMember extends Document {
  name: string;
  role: string;
  bio: string;
  imageUrl?: string;
  order: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    bio: { type: String, required: true },
    imageUrl: { type: String },
    order: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, collection: COLLECTIONS.TEAM_MEMBERS }
);

TeamMemberSchema.index({ isDeleted: 1 });
TeamMemberSchema.index({ order: 1 });

export const TeamMember = mongoose.model<ITeamMember>(
  'TeamMember',
  TeamMemberSchema
);
