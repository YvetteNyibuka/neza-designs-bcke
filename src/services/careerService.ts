import { Career, ICareer } from '../models/Career';
import { slugify } from '../utils/slugify';
import { parsePagination, buildPaginatedResult } from '../utils/pagination';
import { PaginatedResult, PaginationQuery } from '../types';

interface CareerQuery extends PaginationQuery {
  status?: string;
  department?: string;
}

export async function getAllCareers(query: CareerQuery): Promise<PaginatedResult<ICareer>> {
  const { page, limit, skip } = parsePagination(query);
  const filter: Record<string, unknown> = { isDeleted: false };

  if (query.status) filter.status = query.status;
  if (query.department) filter.department = query.department;
  if (query.search) filter.title = { $regex: query.search, $options: 'i' };

  const [data, total] = await Promise.all([
    Career.find(filter).skip(skip).limit(limit).sort({ featured: -1, createdAt: -1 }).lean(),
    Career.countDocuments(filter),
  ]);

  return buildPaginatedResult(data as unknown as ICareer[], total, page, limit);
}

export async function getCareerBySlug(slug: string): Promise<ICareer | null> {
  const career = await Career.findOne({ slug, isDeleted: false }).lean();
  return career as unknown as ICareer | null;
}

export async function createCareer(input: Partial<ICareer>): Promise<ICareer> {
  if (!input.slug && input.title) {
    input.slug = await generateUniqueSlug(input.title);
  }
  return Career.create(input);
}

export async function updateCareer(slug: string, updates: Partial<ICareer>): Promise<ICareer | null> {
  if (updates.title && !updates.slug) {
    updates.slug = await generateUniqueSlug(updates.title, slug);
  }
  return Career.findOneAndUpdate({ slug, isDeleted: false }, updates, { new: true, runValidators: true });
}

export async function softDeleteCareer(slug: string): Promise<ICareer | null> {
  const existing = await Career.findOne({ slug, isDeleted: false });
  if (!existing) return null;

  existing.isDeleted = true;
  return existing.save();
}

async function generateUniqueSlug(title: string, currentSlug?: string): Promise<string> {
  const base = slugify(title);
  let candidate = base;
  let counter = 1;

  while (true) {
    const existing = await Career.findOne({ slug: candidate });
    if (!existing || existing.slug === currentSlug) break;
    candidate = `${base}-${counter++}`;
  }

  return candidate;
}
