import { AppError } from '../utils/errors';

interface InitializePayload {
  amount: string;
  currency: string;
  email: string;
  first_name: string;
  last_name: string;
  tx_ref: string;
  callback_url: string;
  return_url: string;
  phone_number?: string;
  customization?: {
    title?: string;
    description?: string;
  };
}

const getHeaders = () => {
  const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
  if (!CHAPA_SECRET_KEY) {
    throw new AppError('CHAPA_SECRET_KEY is not configured', 500);
  }

  return {
    Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
    'Content-Type': 'application/json',
  };
};

const normalizeChapaMessage = (data: any, fallback: string): string => {
  const raw = data?.message ?? data?.error ?? data;
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) {
    return raw
      .map((item) =>
        typeof item === 'string'
          ? item
          : item?.message || item?.detail || JSON.stringify(item),
      )
      .join('; ');
  }
  if (raw && typeof raw === 'object') {
    const nested = raw.message || raw.detail || raw.error;
    if (typeof nested === 'string') return nested;
    return JSON.stringify(raw);
  }
  return fallback;
};

export const initializeChapaTransaction = async (payload: InitializePayload) => {
  const CHAPA_BASE_URL = process.env.CHAPA_BASE_URL || 'https://api.chapa.co/v1';
  try {
    const response = await fetch(`${CHAPA_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    const raw = await response.text();
    let data: any = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      throw new AppError(`Invalid Chapa response: ${raw || 'empty body'}`, 502);
    }

    if (!response.ok || data?.status !== 'success') {
      throw new AppError(
        normalizeChapaMessage(data, 'Failed to initialize Chapa transaction'),
        400,
      );
    }

    return data;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Unable to reach Chapa API: ${error?.message || 'unknown network error'}`,
      502,
    );
  }
};

export const verifyChapaTransaction = async (txRef: string) => {
  const CHAPA_BASE_URL = process.env.CHAPA_BASE_URL || 'https://api.chapa.co/v1';
  try {
    const response = await fetch(`${CHAPA_BASE_URL}/transaction/verify/${txRef}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const raw = await response.text();
    let data: any = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      throw new AppError(`Invalid Chapa verification response: ${raw || 'empty body'}`, 502);
    }

    if (!response.ok) {
      throw new AppError(
        normalizeChapaMessage(data, 'Failed to verify Chapa transaction'),
        400,
      );
    }

    return data;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Unable to reach Chapa API for verification: ${error?.message || 'unknown network error'}`,
      502,
    );
  }
};
