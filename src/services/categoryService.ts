import { CareerCategory, ICareerCategory } from '../models/CareerCategory';
import { BlogCategory, IBlogCategory } from '../models/BlogCategory';
import { ProjectCategory, IProjectCategory } from '../models/ProjectCategory';
import { Career } from '../models/Career';
import { BlogPost } from '../models/BlogPost';
import { Project } from '../models/Project';
import { slugify } from '../utils/slugify';
import { parsePagination, buildPaginatedResult } from '../utils/pagination';
import { PaginatedResult, PaginationQuery } from '../types';

type CategoryLike = {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

function mergeCategories<T extends CategoryLike>(stored: T[], derivedNames: string[]): T[] {
  const merged = new Map<string, T>();

  for (const item of stored) {
    merged.set(item.slug, item);
  }

  for (const name of derivedNames) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    const slug = slugify(trimmed);
    if (!merged.has(slug)) {
      merged.set(
        slug,
        {
          name: trimmed,
          slug,
          description: '',
          order: Number.MAX_SAFE_INTEGER,
          isDeleted: false,
        } as T
      );
    }
  }

  return Array.from(merged.values()).sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.name.localeCompare(b.name);
  });
}

function paginateMerged<T>(items: T[], query?: PaginationQuery): PaginatedResult<T> {
  const { page, limit, skip } = parsePagination(query);
  const data = items.slice(skip, skip + limit);
  return buildPaginatedResult(data, items.length, page, limit);
}

export async function ensureCareerCategory(name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;

  await CareerCategory.findOneAndUpdate(
    { slug: slugify(trimmed) },
    { name: trimmed, slug: slugify(trimmed), isDeleted: false },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export async function ensureBlogCategory(name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;

  await BlogCategory.findOneAndUpdate(
    { slug: slugify(trimmed) },
    { name: trimmed, slug: slugify(trimmed), isDeleted: false },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export async function ensureProjectCategory(name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;

  await ProjectCategory.findOneAndUpdate(
    { slug: slugify(trimmed) },
    { name: trimmed, slug: slugify(trimmed), isDeleted: false },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

// Career Categories
export async function getAllCareerCategories(query?: PaginationQuery): Promise<PaginatedResult<ICareerCategory>> {
  const [stored, derived] = await Promise.all([
    CareerCategory.find({ isDeleted: false }).sort({ order: 1, createdAt: 1 }).lean(),
    Career.distinct('department', { isDeleted: false }),
  ]);

  return paginateMerged(mergeCategories(stored as unknown as CategoryLike[], derived as string[]), query) as unknown as PaginatedResult<ICareerCategory>;
}

export async function getCareerCategoryById(id: string): Promise<ICareerCategory | null> {
  return CareerCategory.findOne({ _id: id, isDeleted: false }).lean() as unknown as Promise<ICareerCategory | null>;
}

export async function createCareerCategory(input: Partial<ICareerCategory>): Promise<ICareerCategory> {
  if (!input.name) {
    throw new Error('Category name is required');
  }
  
  const existing = await CareerCategory.findOne({ name: input.name.trim() });
  if (existing) {
    throw new Error(`A category with the name "${input.name}" already exists`);
  }
  
  if (!input.slug) {
    input.slug = slugify(input.name);
  }
  return CareerCategory.create(input) as Promise<ICareerCategory>;
}

export async function updateCareerCategory(
  id: string,
  updates: Partial<ICareerCategory>
): Promise<ICareerCategory | null> {
  if (updates.name && !updates.slug) {
    updates.slug = slugify(updates.name);
  }
  return CareerCategory.findOneAndUpdate({ _id: id, isDeleted: false }, updates, {
    new: true,
    runValidators: true,
  }) as unknown as Promise<ICareerCategory | null>;
}

export async function deleteCareerCategory(id: string): Promise<ICareerCategory | null> {
  return CareerCategory.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, updatedAt: new Date() },
    { new: true }
  ) as unknown as Promise<ICareerCategory | null>;
}

// Blog Categories
export async function getAllBlogCategories(query?: PaginationQuery): Promise<PaginatedResult<IBlogCategory>> {
  const [stored, derived] = await Promise.all([
    BlogCategory.find({ isDeleted: false }).sort({ order: 1, createdAt: 1 }).lean(),
    BlogPost.distinct('category', { isDeleted: false }),
  ]);

  return paginateMerged(mergeCategories(stored as unknown as CategoryLike[], derived as string[]), query) as unknown as PaginatedResult<IBlogCategory>;
}

export async function getBlogCategoryById(id: string): Promise<IBlogCategory | null> {
  return BlogCategory.findOne({ _id: id, isDeleted: false }).lean() as unknown as Promise<IBlogCategory | null>;
}

export async function createBlogCategory(input: Partial<IBlogCategory>): Promise<IBlogCategory> {
  if (!input.name) {
    throw new Error('Category name is required');
  }
  
  const existing = await BlogCategory.findOne({ name: input.name.trim() });
  if (existing) {
    throw new Error(`A category with the name "${input.name}" already exists`);
  }
  
  if (!input.slug) {
    input.slug = slugify(input.name);
  }
  return BlogCategory.create(input) as Promise<IBlogCategory>;
}

export async function updateBlogCategory(
  id: string,
  updates: Partial<IBlogCategory>
): Promise<IBlogCategory | null> {
  if (updates.name && !updates.slug) {
    updates.slug = slugify(updates.name);
  }
  return BlogCategory.findOneAndUpdate({ _id: id, isDeleted: false }, updates, {
    new: true,
    runValidators: true,
  }) as unknown as Promise<IBlogCategory | null>;
}

export async function deleteBlogCategory(id: string): Promise<IBlogCategory | null> {
  return BlogCategory.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, updatedAt: new Date() },
    { new: true }
  ) as unknown as Promise<IBlogCategory | null>;
}

// Project Categories
export async function getAllProjectCategories(query?: PaginationQuery): Promise<PaginatedResult<IProjectCategory>> {
  const [stored, derived] = await Promise.all([
    ProjectCategory.find({ isDeleted: false }).sort({ order: 1, createdAt: 1 }).lean(),
    Project.distinct('category', { isDeleted: false }),
  ]);

  return paginateMerged(mergeCategories(stored as unknown as CategoryLike[], derived as string[]), query) as unknown as PaginatedResult<IProjectCategory>;
}

export async function getProjectCategoryById(id: string): Promise<IProjectCategory | null> {
  return ProjectCategory.findOne({ _id: id, isDeleted: false }).lean() as unknown as Promise<IProjectCategory | null>;
}

export async function createProjectCategory(input: Partial<IProjectCategory>): Promise<IProjectCategory> {
  if (!input.name) {
    throw new Error('Category name is required');
  }
  
  const existing = await ProjectCategory.findOne({ name: input.name.trim() });
  if (existing) {
    throw new Error(`A category with the name "${input.name}" already exists`);
  }
  
  if (!input.slug) {
    input.slug = slugify(input.name);
  }
  return ProjectCategory.create(input) as Promise<IProjectCategory>;
}

export async function updateProjectCategory(
  id: string,
  updates: Partial<IProjectCategory>
): Promise<IProjectCategory | null> {
  if (updates.name && !updates.slug) {
    updates.slug = slugify(updates.name);
  }
  return ProjectCategory.findOneAndUpdate({ _id: id, isDeleted: false }, updates, {
    new: true,
    runValidators: true,
  }) as unknown as Promise<IProjectCategory | null>;
}

export async function deleteProjectCategory(id: string): Promise<IProjectCategory | null> {
  return ProjectCategory.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, updatedAt: new Date() },
    { new: true }
  ) as unknown as Promise<IProjectCategory | null>;
}
