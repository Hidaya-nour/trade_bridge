import multer from 'multer';
import { AppError } from '../utils/errors';

const MAX_FILE_SIZE_MB = 10;
const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const imageOnlyMimeTypes = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    cb(new AppError('Unsupported file type. Allowed: JPG, PNG, WEBP, PDF', 400));
    return;
  }
  cb(null, true);
};

const uploader = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 1,
  },
});

export const uploadDocumentMiddleware = uploader.single('file');

const imageFileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!imageOnlyMimeTypes.has(file.mimetype)) {
    cb(new AppError('Unsupported file type. Allowed: JPG, PNG, WEBP', 400));
    return;
  }
  cb(null, true);
};

const imageUploader = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 6,
  },
});

export const uploadProductImagesMiddleware = imageUploader.array('files', 6);

const profileImageUploader = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 1,
  },
});

export const uploadProfileImageMiddleware = profileImageUploader.single('file');
