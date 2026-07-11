import { Service, IService } from '../models/Service';
import { destroyCloudinaryImageByUrl } from '../utils/cloudinaryImage';

export async function getAllServices(): Promise<IService[]> {
  const services = await Service.find({ isDeleted: false }).sort({ order: 1 }).lean();
  return services as unknown as IService[];
}

export async function getServiceById(id: string): Promise<IService | null> {
  return Service.findOne({ _id: id, isDeleted: false });
}

export async function createService(input: Partial<IService>): Promise<IService> {
  return Service.create(input);
}

export async function updateService(id: string, updates: Partial<IService>): Promise<IService | null> {
  return Service.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
}

export async function softDeleteService(id: string): Promise<IService | null> {
  const existing = await Service.findById(id);
  if (!existing || existing.isDeleted) return null;

  await destroyCloudinaryImageByUrl(existing.imageUrl);

  existing.isDeleted = true;
  return existing.save();
}

export async function reorderServices(orderedIds: string[]): Promise<void> {
  const updates = orderedIds.map((id, index) =>
    Service.findByIdAndUpdate(id, { order: index })
  );
  await Promise.all(updates);
}
