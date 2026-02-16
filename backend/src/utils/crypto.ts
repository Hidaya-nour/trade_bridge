import crypto from 'crypto';

export const createHash = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

export const generateRandomString = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};