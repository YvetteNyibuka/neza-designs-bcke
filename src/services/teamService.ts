import { TeamMember, ITeamMember } from '../models/TeamMember';
import { destroyCloudinaryImageByUrl } from '../utils/cloudinaryImage';

export async function getAllTeamMembers(): Promise<ITeamMember[]> {
  const members = await TeamMember.find({ isDeleted: false }).sort({ order: 1 }).lean();
  return members as unknown as ITeamMember[];
}

export async function getTeamMemberById(id: string): Promise<ITeamMember | null> {
  return TeamMember.findOne({ _id: id, isDeleted: false });
}

export async function createTeamMember(input: Partial<ITeamMember>): Promise<ITeamMember> {
  return TeamMember.create(input);
}

export async function updateTeamMember(id: string, updates: Partial<ITeamMember>): Promise<ITeamMember | null> {
  return TeamMember.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
}

export async function softDeleteTeamMember(id: string): Promise<ITeamMember | null> {
  const existing = await TeamMember.findById(id);
  if (!existing || existing.isDeleted) return null;

  await destroyCloudinaryImageByUrl(existing.imageUrl);

  existing.isDeleted = true;
  return existing.save();
}
