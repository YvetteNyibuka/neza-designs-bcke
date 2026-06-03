import mongoose, { Document, Schema } from 'mongoose';
import { COLLECTIONS } from '../constants/collections';

export type CareerEmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
export type CareerLevel = 'Entry' | 'Mid' | 'Senior' | 'Lead';
export type CareerStatus = 'Open' | 'Closed';

export interface ICareer extends Document {
  slug: string;
  title: string;
  department: string;
  location: string;
  employmentType: CareerEmploymentType;
  experienceLevel: CareerLevel;
  description: string;
  requirements: string[];
  responsibilities: string[];
  deadline?: Date;
  status: CareerStatus;
  featured: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CareerSchema = new Schema<ICareer>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    employmentType: {
      type: String,
      required: true,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
      default: 'Full-time',
    },
    experienceLevel: {
      type: String,
      required: true,
      enum: ['Entry', 'Mid', 'Senior', 'Lead'],
      default: 'Mid',
    },
    description: { type: String, required: true },
    requirements: [{ type: String, trim: true }],
    responsibilities: [{ type: String, trim: true }],
    deadline: { type: Date },
    status: { type: String, required: true, enum: ['Open', 'Closed'], default: 'Open' },
    featured: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, collection: COLLECTIONS.CAREERS }
);

CareerSchema.index({ isDeleted: 1, status: 1 });
CareerSchema.index({ department: 1 });
CareerSchema.index({ deadline: 1 });
CareerSchema.index({ isDeleted: 1, deadline: 1 });

export const Career = mongoose.model<ICareer>('Career', CareerSchema);
