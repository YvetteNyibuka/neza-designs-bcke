import mongoose, { Document, Schema } from 'mongoose';
import { COLLECTIONS } from '../constants/collections';

export interface IServiceFeature {
  name: string;
  meaning: string;
  icon: string;
}

export interface IService extends Document {
  title: string;
  shortDescription: string;
  features: IServiceFeature[];
  imageUrl: string;
  buttonTitle: string;
  order: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true },
    features: [
      {
        name: { type: String, required: true },
        meaning: { type: String, required: true },
        icon: { type: String, required: true },
      },
    ],
    imageUrl: { type: String, required: true },
    buttonTitle: { type: String, required: true, default: 'Learn More' },
    order: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, collection: COLLECTIONS.SERVICES }
);

ServiceSchema.index({ isDeleted: 1 });
ServiceSchema.index({ order: 1 });

export const Service = mongoose.model<IService>('Service', ServiceSchema);
