import { BlogPost, IBlogPost } from '../models/BlogPost';
import { slugify } from '../utils/slugify';
import { parsePagination, buildPaginatedResult } from '../utils/pagination';
import { destroyCloudinaryImageByUrl } from '../utils/cloudinaryImage';
import { PaginatedResult, PaginationQuery } from '../types';
import backupPosts from '../data-backup/posts.json';
import { ensureBlogCategory } from './categoryService';

interface PostQuery extends PaginationQuery {
  category?: string;
}

export async function getAllPosts(query: PostQuery): Promise<PaginatedResult<IBlogPost>> {
  const { page, limit, skip } = parsePagination(query);
  const filter: Record<string, unknown> = { isDeleted: false };
  if (query.category) filter.category = query.category;
  if (query.search) filter.title = { $regex: query.search, $options: 'i' };

  const [data, total] = await Promise.all([
    BlogPost.find(filter).skip(skip).limit(limit).sort({ publishedAt: -1 }).lean(),
    BlogPost.countDocuments(filter),
  ]);

  if (total === 0) {
    const filtered = backupPosts.filter((p) => {
      if (query.category && p.category !== query.category) return false;
      return true;
    });
    return buildPaginatedResult(filtered as unknown as IBlogPost[], filtered.length, 1, filtered.length || 10);
  }

  return buildPaginatedResult(data as unknown as IBlogPost[], total, page, limit);
}

export async function getPostBySlug(slug: string): Promise<IBlogPost | null> {
  const post = await BlogPost.findOne({ slug, isDeleted: false }).lean();
  if (!post) {
    const backup = backupPosts.find((p) => p.slug === slug);
    return backup as unknown as IBlogPost | null;
  }
  return post as unknown as IBlogPost;
}

export async function createPost(input: Partial<IBlogPost>): Promise<IBlogPost> {
  if (!input.slug && input.title) {
    input.slug = await generateUniqueSlug(input.title);
  }
  if (input.category) {
    await ensureBlogCategory(input.category);
  }
  return BlogPost.create(input);
}

export async function updatePost(slug: string, updates: Partial<IBlogPost>): Promise<IBlogPost | null> {
  if (updates.title && !updates.slug) {
    updates.slug = await generateUniqueSlug(updates.title, slug);
  }
  if (updates.category) {
    await ensureBlogCategory(updates.category);
  }
  return BlogPost.findOneAndUpdate({ slug, isDeleted: false }, updates, { new: true, runValidators: true });
}

export async function softDeletePost(slug: string): Promise<IBlogPost | null> {
  const existing = await BlogPost.findOne({ slug, isDeleted: false });
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
    const existing = await BlogPost.findOne({ slug: candidate });
    if (!existing || existing.slug === currentSlug) break;
    candidate = `${base}-${counter++}`;
  }
  return candidate;
}
