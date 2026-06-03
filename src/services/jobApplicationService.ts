import { Types } from 'mongoose';
import { JobApplication, IJobApplication, ApplicationStatus } from '../models/JobApplication';
import { Career } from '../models/Career';
import { parsePagination, buildPaginatedResult } from '../utils/pagination';
import { PaginatedResult, PaginationQuery } from '../types';

interface ApplicationQuery extends PaginationQuery {
  status?: string;
}

export async function submitApplication(
  careerSlug: string,
  input: {
    applicantName: string;
    email: string;
    phone?: string;
    linkedIn?: string;
    resumeUrl?: string;
    coverLetter?: string;
  }
): Promise<IJobApplication> {
  const career = await Career.findOne({
    slug: careerSlug,
    isDeleted: false,
    status: 'Open',
    $or: [{ deadline: { $exists: false } }, { deadline: null }, { deadline: { $gte: new Date() } }],
  }).lean();
  if (!career) throw new Error('Career not found or closed');

  return JobApplication.create({
    careerId: (career as unknown as { _id: Types.ObjectId })._id,
    careerSlug: career.slug,
    careerTitle: career.title,
    ...input,
  });
}

export async function getApplicationsByCareer(
  careerSlug: string,
  query: ApplicationQuery
): Promise<PaginatedResult<IJobApplication>> {
  const { page, limit, skip } = parsePagination(query);
  const filter: Record<string, unknown> = { careerSlug, isDeleted: false };
  if (query.status) filter.status = query.status;

  const [data, total] = await Promise.all([
    JobApplication.find(filter).skip(skip).limit(limit).sort({ appliedAt: -1 }).lean(),
    JobApplication.countDocuments(filter),
  ]);

  return buildPaginatedResult(data as unknown as IJobApplication[], total, page, limit);
}

export async function getAllApplications(
  query: ApplicationQuery & { careerSlug?: string }
): Promise<PaginatedResult<IJobApplication>> {
  const { page, limit, skip } = parsePagination(query);
  const filter: Record<string, unknown> = { isDeleted: false };
  if (query.status) filter.status = query.status;
  if (query.careerSlug) filter.careerSlug = query.careerSlug;
  if (query.search) {
    filter.$or = [
      { applicantName: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [data, total] = await Promise.all([
    JobApplication.find(filter).skip(skip).limit(limit).sort({ appliedAt: -1 }).lean(),
    JobApplication.countDocuments(filter),
  ]);

  return buildPaginatedResult(data as unknown as IJobApplication[], total, page, limit);
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  note?: string
): Promise<IJobApplication | null> {
  const update: Record<string, unknown> = { status };
  if (note) update.$push = { notes: note };
  return JobApplication.findByIdAndUpdate(id, update, { new: true });
}

export async function deleteApplication(id: string): Promise<IJobApplication | null> {
  return JobApplication.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
}
