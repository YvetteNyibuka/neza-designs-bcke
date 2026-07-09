import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from './logger';

function parseLocalFileUrl(url: string): string | null {
  try {
    const uploadsPath = '/uploads/';
    const uploadsIndex = url.indexOf(uploadsPath);
    if (uploadsIndex === -1) return null;
    return url.slice(uploadsIndex + uploadsPath.length);
  } catch {
    return null;
  }
}

export function extractCloudinaryPublicId(imageUrl?: string | null): string | null {
  if (!imageUrl) return null;
  return parseLocalFileUrl(imageUrl);
}

export async function destroyCloudinaryImageByUrl(imageUrl?: string | null): Promise<void> {
  const publicId = extractCloudinaryPublicId(imageUrl);
  if (!publicId) return;

  try {
    const filePath = path.join(process.cwd(), 'uploads', publicId);
    await fs.unlink(filePath);
  } catch (error) {
    logger.warn(
      `Local file deletion failed for publicId: ${publicId} - ${(error as Error).message}`
    );
  }
}
