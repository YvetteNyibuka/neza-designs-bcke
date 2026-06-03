import mongoose, { Document, Schema } from 'mongoose';
import { COLLECTIONS } from '../constants/collections';

export interface IProjectCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  order: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectCategorySchema = new Schema<IProjectCategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    order: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, collection: COLLECTIONS.PROJECT_CATEGORIES }
);

ProjectCategorySchema.index({ isDeleted: 1 });
ProjectCategorySchema.index({ order: 1 });

export const ProjectCategory = mongoose.model<IProjectCategory>('ProjectCategory', ProjectCategorySchema);
