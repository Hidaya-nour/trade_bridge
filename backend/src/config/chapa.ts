import { AppError } from '../utils/errors';

interface InitializePayload {
  amount: string;
  currency: string;
  email: string;
  first_name: string;
  last_name: string;
  tx_ref: string;
  callback_url?: string;
  return_url: string;
  phone_number?: string;
  customization?: {
    title?: string;
    description?: string;
  };
  meta?: Record<string, any>;
  'subaccounts[id]'?: string;
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

export interface CreateSubaccountPayload {
  business_name: string;
  account_name: string;
  bank_code: string;
  account_number: string;
  split_type: 'percentage' | 'flat';
  split_value: number;
}

export interface ChapaTransferPayload {
  account_name: string;
  account_number: string;
  amount: string;
  currency: string;
  reference: string;
  /** Chapa numeric bank id (see GET /banks). */
  bank_code: number;
}

export const createChapaTransfer = async (payload: ChapaTransferPayload) => {
  const CHAPA_BASE_URL = process.env.CHAPA_BASE_URL || 'https://api.chapa.co/v1';
  try {
    const body = {
      ...payload,
      bank_code: Number(payload.bank_code),
    };

    const response = await fetch(`${CHAPA_BASE_URL}/transfers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });

    const raw = await response.text();
    let data: any = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      throw new AppError(`Invalid Chapa transfer response: ${raw || 'empty body'}`, 502);
    }

    if (!response.ok || data?.status !== 'success') {
      throw new AppError(
        normalizeChapaMessage(data, 'Failed to create Chapa transfer'),
        400,
      );
    }

    return data;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Unable to reach Chapa transfer API: ${error?.message || 'unknown network error'}`,
      502,
    );
  }
};

export const verifyChapaTransfer = async (reference: string) => {
  const CHAPA_BASE_URL = process.env.CHAPA_BASE_URL || 'https://api.chapa.co/v1';
  try {
    const response = await fetch(
      `${CHAPA_BASE_URL}/transfers/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: getHeaders(),
      },
    );

    const raw = await response.text();
    let data: any = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      throw new AppError(`Invalid Chapa transfer verification response: ${raw || 'empty body'}`, 502);
    }

    if (!response.ok) {
      throw new AppError(
        normalizeChapaMessage(data, 'Failed to verify Chapa transfer'),
        400,
      );
    }

    return data;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Unable to reach Chapa transfer API: ${error?.message || 'unknown network error'}`,
      502,
    );
  }
};

export const createChapaSubaccount = async (payload: CreateSubaccountPayload) => {
  const CHAPA_BASE_URL = process.env.CHAPA_BASE_URL || 'https://api.chapa.co/v1';
  try {
    const response = await fetch(`${CHAPA_BASE_URL}/subaccount`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    const raw = await response.text();
    let data: any = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      throw new AppError(`Invalid Chapa subaccount response: ${raw || 'empty body'}`, 502);
    }

    if (!response.ok || data?.status !== 'success') {
      throw new AppError(
        normalizeChapaMessage(data, 'Failed to create Chapa subaccount'),
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

