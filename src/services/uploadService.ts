import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
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

// Random filename per upload so two files with the same original name never collide/overwrite.
function uniqueFileName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  return `${crypto.randomUUID()}${ext}`;
}

async function ensureDirExists(dir: string): Promise<void> {
  try {
    // Create directories with setgid bit so files inherit the group (www-data)
    // and group-writable so nginx (www-data) can serve them while keeping owner root.
    await fs.mkdir(dir, { recursive: true, mode: 0o2775 });
  } catch (error) {
    throw createError('Failed to create upload directory', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

export async function uploadImage(
  fileBuffer: Buffer,
  folder: string,
  originalName: string
): Promise<UploadResult> {
  try {
    const folderPath = path.join(UPLOADS_DIR, folder);
    await ensureDirExists(folderPath);

    const fileName = uniqueFileName(originalName);
    const filePath = path.join(folderPath, fileName);

    await fs.writeFile(filePath, fileBuffer);

    const url = `/uploads/${folder}/${fileName}`;
    return { url, publicId: `${folder}/${fileName}` };
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

    const fileName = `${crypto.randomUUID().slice(0, 8)}-${sanitizeFileName(originalName)}`;
    const filePath = path.join(folderPath, fileName);

    await fs.writeFile(filePath, fileBuffer);

    const url = `/uploads/${folder}/${fileName}`;
    return { url, publicId: `${folder}/${fileName}` };
  } catch (error) {
    throw createError('File upload failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
