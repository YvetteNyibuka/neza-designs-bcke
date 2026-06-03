import mongoose, { Document, Schema } from 'mongoose';
import { COLLECTIONS } from '../constants/collections';

export interface ICareerCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  order: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CareerCategorySchema = new Schema<ICareerCategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    order: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, collection: COLLECTIONS.CAREER_CATEGORIES }
);

CareerCategorySchema.index({ isDeleted: 1 });
CareerCategorySchema.index({ order: 1 });

export const CareerCategory = mongoose.model<ICareerCategory>('CareerCategory', CareerCategorySchema);
