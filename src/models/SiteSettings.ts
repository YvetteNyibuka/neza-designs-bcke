import mongoose, { Document, Schema } from 'mongoose';
import { COLLECTIONS } from '../constants/collections';

export interface ISiteSettings extends Document {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl?: string;
  ogImage?: string;
  indexingEnabled: boolean;
  sitemapEnabled: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoLight?: string;
  logoDark?: string;
  favicon?: string;
  font: string;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    metaTitle: { type: String, default: 'Neza Designs' },
    metaDescription: { type: String, default: '' },
    keywords: [{ type: String }],
    canonicalUrl: { type: String },
    ogImage: { type: String },
    indexingEnabled: { type: Boolean, default: true },
    sitemapEnabled: { type: Boolean, default: true },
    primaryColor: { type: String, default: '#B75E1A' },
    secondaryColor: { type: String, default: '#231F1C' },
    accentColor: { type: String, default: '#DAA119' },
    logoLight: { type: String },
    logoDark: { type: String },
    favicon: { type: String },
    font: { type: String, default: 'Inter' },
  },
  { timestamps: true, collection: COLLECTIONS.SITE_SETTINGS }
);

export const SiteSettings = mongoose.model<ISiteSettings>(
  'SiteSettings',
  SiteSettingsSchema
);
