import mongoose, { Document, Schema, Types } from 'mongoose';
import { COLLECTIONS } from '../constants/collections';

export type ApplicationStatus = 'New' | 'Reviewing' | 'Shortlisted' | 'Rejected' | 'Hired';

export interface IJobApplication extends Document {
  careerId: Types.ObjectId;
  careerSlug: string;
  careerTitle: string;
  applicantName: string;
  email: string;
  phone?: string;
  linkedIn?: string;
  resumeUrl?: string;
  coverLetter?: string;
  status: ApplicationStatus;
  notes: string[];
  isDeleted: boolean;
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema = new Schema<IJobApplication>(
  {
    careerId: { type: Schema.Types.ObjectId, ref: 'Career', required: true },
    careerSlug: { type: String, required: true, lowercase: true, trim: true },
    careerTitle: { type: String, required: true, trim: true },
    applicantName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    linkedIn: { type: String, trim: true },
    resumeUrl: { type: String, trim: true },
    coverLetter: { type: String, trim: true },
    status: {
      type: String,
      required: true,
      enum: ['New', 'Reviewing', 'Shortlisted', 'Rejected', 'Hired'],
      default: 'New',
    },
    notes: [{ type: String, trim: true }],
    isDeleted: { type: Boolean, default: false },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: COLLECTIONS.JOB_APPLICATIONS }
);

JobApplicationSchema.index({ careerSlug: 1, isDeleted: 1 });
JobApplicationSchema.index({ email: 1 });
JobApplicationSchema.index({ status: 1 });

export const JobApplication = mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);
