import mongoose, { Document, Schema } from 'mongoose';
import { COLLECTIONS } from '../constants/collections';

export type PublicationType = 'Report' | 'Portfolio' | 'Law' | 'Policy' | 'Guide' | 'Other';

export interface IPublication extends Document {
  slug: string;
  title: string;
  summary: string;
  type: PublicationType;
  publishedAt: Date;
  coverImage?: string;
  fileUrl?: string;
  externalUrl?: string;
  tags: string[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PublicationSchema = new Schema<IPublication>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['Report', 'Portfolio', 'Law', 'Policy', 'Guide', 'Other'],
      default: 'Report',
    },
    publishedAt: { type: Date, required: true, default: Date.now },
    coverImage: { type: String, trim: true },
    fileUrl: { type: String, trim: true },
    externalUrl: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, collection: COLLECTIONS.PUBLICATIONS }
);

PublicationSchema.index({ isDeleted: 1, type: 1 });
PublicationSchema.index({ publishedAt: -1 });

export const Publication = mongoose.model<IPublication>('Publication', PublicationSchema);
