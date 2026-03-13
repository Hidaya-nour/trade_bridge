import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
};

export const uploadBufferToCloudinary = async (
  file: Express.Multer.File,
  folder: string
): Promise<UploadApiResponse> => {
  const maxRetries = Number(process.env.CLOUDINARY_UPLOAD_RETRIES ?? 2);
  const baseDelayMs = Number(process.env.CLOUDINARY_UPLOAD_RETRY_DELAY_MS ?? 500);

  const isRetryable = (error: any) => {
    const code = error?.code || error?.name;
    const httpCode = error?.http_code;
    if (httpCode === 499 || httpCode >= 500) return true;
    return [
      'ECONNRESET',
      'ETIMEDOUT',
      'EAI_AGAIN',
      'ENOTFOUND',
      'ESOCKETTIMEDOUT',
      'TimeoutError',
    ].includes(code);
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const uploadOnce = () =>
    new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('Cloudinary upload failed'));
            return;
          }
          resolve(result);
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });

  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await uploadOnce();
    } catch (error) {
      lastError = error;
      if (attempt >= maxRetries || !isRetryable(error)) {
        throw error;
      }
      await delay(baseDelayMs * (attempt + 1));
    }
  }

  throw lastError || new Error('Cloudinary upload failed');
};
