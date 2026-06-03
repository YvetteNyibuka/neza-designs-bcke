import mongoose, { Document, Schema } from 'mongoose';
import { COLLECTIONS } from '../constants/collections';

export interface IBlogCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  order: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BlogCategorySchema = new Schema<IBlogCategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    order: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, collection: COLLECTIONS.BLOG_CATEGORIES }
);

BlogCategorySchema.index({ isDeleted: 1 });
BlogCategorySchema.index({ order: 1 });

export const BlogCategory = mongoose.model<IBlogCategory>('BlogCategory', BlogCategorySchema);
