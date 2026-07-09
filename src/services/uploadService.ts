import * as fs from 'fs/promises';
import * as path from 'path';
import { HTTP_STATUS } from '../constants/httpStatus';
import { createError } from '../middlewares/errorHandler';

export interface UploadResult {
  url: string;
  publicId: string;
}

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

function sanitizeFileName(originalName: string): string {
  const ext = path.extname(originalName);
  const namePart = path.basename(originalName, ext);

  // Remove/replace special characters, keep spaces and common punctuation
  const sanitized = namePart
    .replace(/[^a-zA-Z0-9\s\-_.]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase();

  return `${sanitized}${ext}`;
}

async function ensureDirExists(dir: string): Promise<void> {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    throw createError('Failed to create upload directory', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

export async function uploadImage(
  fileBuffer: Buffer,
  folder: string,
  publicId?: string
): Promise<UploadResult> {
  try {
    const folderPath = path.join(UPLOADS_DIR, folder);
    await ensureDirExists(folderPath);

    const fileName = publicId ? sanitizeFileName(publicId) : 'image.jpg';
    const filePath = path.join(folderPath, fileName);

    await fs.writeFile(filePath, fileBuffer);

    const url = `/uploads/${folder}/${fileName}`;
    return { url, publicId: fileName };
  } catch (error) {
    throw createError('Image upload failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    const filePath = path.join(UPLOADS_DIR, publicId);
    await fs.unlink(filePath);
  } catch (error) {
    throw createError('Image deletion failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

export async function uploadFile(
  fileBuffer: Buffer,
  folder: string,
  originalName: string
): Promise<UploadResult> {
  try {
    const folderPath = path.join(UPLOADS_DIR, folder);
    await ensureDirExists(folderPath);

    const fileName = sanitizeFileName(originalName);
    const filePath = path.join(folderPath, fileName);

    await fs.writeFile(filePath, fileBuffer);

    const url = `/uploads/${folder}/${fileName}`;
    return { url, publicId: `${folder}/${fileName}` };
  } catch (error) {
    throw createError('File upload failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
