import { cloudinary } from '../config/cloudinary';
import { env } from '../config/env';
import { logger } from './logger';

function parseCloudinaryUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

export function extractCloudinaryPublicId(imageUrl?: string | null): string | null {
  if (!imageUrl) return null;

  const parsed = parseCloudinaryUrl(imageUrl);
  if (!parsed) return null;

  const expectedHost = `res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}`;
  if (!parsed.href.includes(expectedHost)) return null;

  const uploadMarker = '/upload/';
  const markerIndex = parsed.pathname.indexOf(uploadMarker);
  if (markerIndex === -1) return null;

  // Keep path after /upload/, strip transform/version segments and file extension.
  const afterUpload = parsed.pathname.slice(markerIndex + uploadMarker.length);
  const rawSegments = afterUpload.split('/').filter(Boolean);
  if (rawSegments.length === 0) return null;

  const versionIndex = rawSegments.findIndex((segment) => /^v\d+$/.test(segment));
  const assetSegments = versionIndex >= 0 ? rawSegments.slice(versionIndex + 1) : rawSegments;
  if (assetSegments.length === 0) return null;

  const last = assetSegments[assetSegments.length - 1];
  assetSegments[assetSegments.length - 1] = last.replace(/\.[^.]+$/, '');

  return assetSegments.join('/');
}

export async function destroyCloudinaryImageByUrl(imageUrl?: string | null): Promise<void> {
  const publicId = extractCloudinaryPublicId(imageUrl);
  if (!publicId) return;

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: 'image',
    });

    if (result.result !== 'ok' && result.result !== 'not found') {
      logger.warn(`Cloudinary destroy returned '${result.result}' for publicId: ${publicId}`);
    }
  } catch (error) {
    logger.warn(
      `Cloudinary destroy failed for publicId: ${publicId} - ${(error as Error).message}`
    );
  }
}
