import { Request, Response } from 'express';
import multer from 'multer';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendBadRequest } from '../utils/response';
import { uploadImage, uploadFile, deleteImage } from '../services/uploadService';

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

export const fileUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF or Word documents are allowed'));
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

export const uploadFileSingle = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    sendBadRequest(res, 'No file provided');
    return;
  }

  const folder = (req.query.folder as string) || 'documents';
  const result = await uploadFile(req.file.buffer, folder, req.file.originalname);
  sendSuccess(res, 'File uploaded', result);
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
