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

