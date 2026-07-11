import { Project, IProject } from '../models/Project';
import { slugify } from '../utils/slugify';
import { parsePagination, buildPaginatedResult } from '../utils/pagination';
import { destroyCloudinaryImageByUrl } from '../utils/cloudinaryImage';
import { PaginatedResult, PaginationQuery } from '../types';
import { ensureProjectCategory } from './categoryService';

interface ProjectQuery extends PaginationQuery {
  category?: string;
  status?: string;
}

export async function getAllProjects(query: ProjectQuery): Promise<PaginatedResult<IProject>> {
  const { page, limit, skip } = parsePagination(query);
  const filter: Record<string, unknown> = { isDeleted: false };
  if (query.category) filter.category = query.category;
  if (query.status) filter.status = query.status;
  if (query.search) filter.title = { $regex: query.search, $options: 'i' };

  const [data, total] = await Promise.all([
    Project.find(filter).skip(skip).limit(limit).sort({ featured: -1, createdAt: -1 }).lean(),
    Project.countDocuments(filter),
  ]);

  return buildPaginatedResult(data as unknown as IProject[], total, page, limit);
}

export async function getProjectBySlug(slug: string): Promise<IProject | null> {
  return Project.findOne({ slug, isDeleted: false }).lean() as unknown as IProject | null;
}

export async function createProject(input: Partial<IProject>): Promise<IProject> {
  if (!input.slug && input.title) {
    input.slug = await generateUniqueSlug(input.title);
  }
  if (input.category) {
    await ensureProjectCategory(input.category);
  }
  return Project.create(input);
}

export async function updateProject(slug: string, updates: Partial<IProject>): Promise<IProject | null> {
  if (updates.title && !updates.slug) {
    updates.slug = await generateUniqueSlug(updates.title, slug);
  }
  if (updates.category) {
    await ensureProjectCategory(updates.category);
  }
  return Project.findOneAndUpdate({ slug, isDeleted: false }, updates, { new: true, runValidators: true });
}

export async function softDeleteProject(slug: string): Promise<IProject | null> {
  const existing = await Project.findOne({ slug, isDeleted: false });
  if (!existing) return null;

  await destroyCloudinaryImageByUrl(existing.imageUrl);

  existing.isDeleted = true;
  return existing.save();
}

async function generateUniqueSlug(title: string, currentSlug?: string): Promise<string> {
  const base = slugify(title);
  let candidate = base;
  let counter = 1;
  while (true) {
    const existing = await Project.findOne({ slug: candidate });
    if (!existing || existing.slug === currentSlug) break;
    candidate = `${base}-${counter++}`;
  }
  return candidate;
}
