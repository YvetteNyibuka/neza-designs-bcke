import { Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendBadRequest } from '../utils/response';
import { uploadImage, uploadFile, deleteImage } from '../services/uploadService';

const FILE_SIZE_LIMIT = 70 * 1024 * 1024; // 70MB
const PUBLICATION_SIZE_LIMIT = 70 * 1024 * 1024; // 70MB

// Use memory storage so we can pass buffer to local filesystem
const storage = multer.memoryStorage();

const handleMulterError = (err: MulterError | Error, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendBadRequest(res, 'File is too large. Maximum file size is 70MB');
    }
    if (err.code === 'LIMIT_PART_COUNT') {
      return sendBadRequest(res, 'Too many file parts');
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return sendBadRequest(res, 'Too many files');
    }
    if (err.code === 'LIMIT_FIELD_KEY') {
      return sendBadRequest(res, 'Field name is too long');
    }
    if (err.code === 'LIMIT_FIELD_VALUE') {
      return sendBadRequest(res, 'Field value is too long');
    }
    return sendBadRequest(res, `Upload error: ${err.message}`);
  }
  next(err);
};

export const upload = multer({
  storage,
  limits: { fileSize: FILE_SIZE_LIMIT },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
}).single('image');

export const uploadMiddleware = (err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (err.message === 'Only image files are allowed') {
    return sendBadRequest(res, 'Only image files are allowed (JPG, PNG, WebP, GIF, etc.)');
  }
  handleMulterError(err, _req, res, next);
};

export const fileUpload = multer({
  storage,
  limits: { fileSize: FILE_SIZE_LIMIT },
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
}).single('file');

export const fileUploadMiddleware = (err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (err.message === 'Only PDF or Word documents are allowed') {
    return sendBadRequest(res, 'Only PDF or Word documents are allowed');
  }
  handleMulterError(err, _req, res, next);
};

// Mixed uploader for publications: accepts coverImage (image) + file (PDF/Word)
export const publicationUpload = multer({
  storage,
  limits: { fileSize: PUBLICATION_SIZE_LIMIT },
  fileFilter: (_req, file, cb) => {
    const allowedImages = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const allowedDocs = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (file.fieldname === 'coverImage') {
      if (allowedImages.includes(file.mimetype)) cb(null, true);
      else cb(new Error('Cover image must be JPEG, PNG, WebP, or GIF'));
    } else if (file.fieldname === 'file') {
      if (allowedDocs.includes(file.mimetype)) cb(null, true);
      else cb(new Error('Publication file must be a PDF or Word document'));
    } else {
      cb(new Error('Unexpected file field'));
    }
  },
}).fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'file', maxCount: 1 },
]);

export const publicationUploadMiddleware = (err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (err.message === 'Cover image must be JPEG, PNG, WebP, or GIF') {
    return sendBadRequest(res, 'Cover image must be JPEG, PNG, WebP, or GIF');
  }
  if (err.message === 'Publication file must be a PDF or Word document') {
    return sendBadRequest(res, 'Publication file must be a PDF or Word document');
  }
  if (err.message === 'Unexpected file field') {
    return sendBadRequest(res, 'Invalid file fields. Expected coverImage and file fields');
  }
  handleMulterError(err, _req, res, next);
};

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
