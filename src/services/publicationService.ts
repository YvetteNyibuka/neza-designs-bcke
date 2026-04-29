import { Publication, IPublication } from '../models/Publication';
import { slugify } from '../utils/slugify';
import { parsePagination, buildPaginatedResult } from '../utils/pagination';
import { PaginatedResult, PaginationQuery } from '../types';

interface PublicationQuery extends PaginationQuery {
  type?: string;
}

export async function getAllPublications(query: PublicationQuery): Promise<PaginatedResult<IPublication>> {
  const { page, limit, skip } = parsePagination(query);
  const filter: Record<string, unknown> = { isDeleted: false };

  if (query.type) filter.type = query.type;
  if (query.search) filter.title = { $regex: query.search, $options: 'i' };

  const [data, total] = await Promise.all([
    Publication.find(filter).skip(skip).limit(limit).sort({ publishedAt: -1 }).lean(),
    Publication.countDocuments(filter),
  ]);

  return buildPaginatedResult(data as unknown as IPublication[], total, page, limit);
}

export async function getPublicationBySlug(slug: string): Promise<IPublication | null> {
  const publication = await Publication.findOne({ slug, isDeleted: false }).lean();
  return publication as unknown as IPublication | null;
}

export async function createPublication(input: Partial<IPublication>): Promise<IPublication> {
  if (!input.slug && input.title) {
    input.slug = await generateUniqueSlug(input.title);
  }
  return Publication.create(input);
}

export async function updatePublication(slug: string, updates: Partial<IPublication>): Promise<IPublication | null> {
  if (updates.title && !updates.slug) {
    updates.slug = await generateUniqueSlug(updates.title, slug);
  }
  return Publication.findOneAndUpdate({ slug, isDeleted: false }, updates, { new: true, runValidators: true });
}

export async function softDeletePublication(slug: string): Promise<IPublication | null> {
  const existing = await Publication.findOne({ slug, isDeleted: false });
  if (!existing) return null;

  existing.isDeleted = true;
  return existing.save();
}

async function generateUniqueSlug(title: string, currentSlug?: string): Promise<string> {
  const base = slugify(title);
  let candidate = base;
  let counter = 1;

  while (true) {
    const existing = await Publication.findOne({ slug: candidate });
    if (!existing || existing.slug === currentSlug) break;
    candidate = `${base}-${counter++}`;
  }

  return candidate;
}
