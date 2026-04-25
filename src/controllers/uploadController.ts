import { Request, Response } from 'express';
import multer from 'multer';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendBadRequest } from '../utils/response';
import { uploadImage, deleteImage } from '../services/uploadService';

// Use memory storage so we can pass buffer to Cloudinary
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export const uploadSingle = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    sendBadRequest(res, 'No file provided');
    return;
  }

  const folder = (req.query.folder as string) || 'general';
  const result = await uploadImage(req.file.buffer, folder);
  sendSuccess(res, 'Image uploaded', result);
});

export const deleteImageHandler = asyncHandler(async (req: Request, res: Response) => {
  const { publicId } = req.body as { publicId: string };
  if (!publicId) {
    sendBadRequest(res, 'publicId is required');
    return;
  }
  await deleteImage(publicId);
  sendSuccess(res, 'Image deleted');
});
