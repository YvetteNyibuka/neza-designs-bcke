import mongoose, { Document, Schema } from 'mongoose';
import { COLLECTIONS } from '../constants/collections';

export type BlogPostCategory =
  | 'Sustainability'
  | 'Urbanization'
  | 'Design Trends'
  | 'Rwanda Projects'
  | 'FEATURED INSIGHTS';

export interface IBlogPostAuthor {
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface IBlogPost extends Document {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: BlogPostCategory;
  readTime: number;
  publishedAt: Date;
  imageUrl: string;
  author: IBlogPostAuthor;
  tags: string[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Sustainability',
        'Urbanization',
        'Design Trends',
        'Rwanda Projects',
        'FEATURED INSIGHTS',
      ],
    },
    readTime: { type: Number, required: true, min: 1 },
    publishedAt: { type: Date, required: true, default: Date.now },
    imageUrl: { type: String, required: true },
    author: {
      name: { type: String, required: true },
      role: { type: String, required: true },
      avatarUrl: { type: String },
    },
    tags: [{ type: String }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, collection: COLLECTIONS.BLOG_POSTS }
);

BlogPostSchema.index({ isDeleted: 1 });
BlogPostSchema.index({ category: 1 });
BlogPostSchema.index({ publishedAt: -1 });

export const BlogPost = mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);
