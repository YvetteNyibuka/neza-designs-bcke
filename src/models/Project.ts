import mongoose, { Document, Schema } from 'mongoose';
import { COLLECTIONS } from '../constants/collections';

export type ProjectStatus = 'Completed' | 'Ongoing' | 'Handed Over' | 'Consulted';

export interface IProject extends Document {
  slug: string;
  title: string;
  category: string;
  status: ProjectStatus;
  description?: string;
  imageUrl: string;
  location?: string;
  completionYear?: number;
  client?: string;
  featured: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    status: {
      type: String,
      required: true,
      enum: ['Completed', 'Ongoing', 'Handed Over', 'Consulted'],
      default: 'Completed',
    },
    description: { type: String },
    imageUrl: { type: String, required: true },
    location: { type: String },
    completionYear: { type: Number },
    client: { type: String },
    featured: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, collection: COLLECTIONS.PROJECTS }
);

ProjectSchema.index({ isDeleted: 1 });
ProjectSchema.index({ category: 1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
