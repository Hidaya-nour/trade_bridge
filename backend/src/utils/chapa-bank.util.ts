import fs from 'fs';
import path from 'path';

type ChapaBankRecord = {
  id: number;
  slug: string;
  name: string;
};

let banksCache: ChapaBankRecord[] | null = null;

const loadChapaBanks = (): ChapaBankRecord[] => {
  if (banksCache) return banksCache;

  const candidates = [
    path.join(process.cwd(), 'chapa_banks.json'),
    path.join(process.cwd(), 'backend', 'chapa_banks.json'),
    path.join(__dirname, '..', '..', 'chapa_banks.json'),
  ];

  for (const filePath of candidates) {
    try {
      if (!fs.existsSync(filePath)) continue;
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed?.data) ? parsed.data : [];
      banksCache = list
        .filter((b: any) => b?.id && b?.slug)
        .map((b: any) => ({
          id: Number(b.id),
          slug: String(b.slug).toLowerCase(),
          name: String(b.name || '').toLowerCase(),
        }));
        return banksCache || [];    } catch {
      // try next path
    }
  }

  banksCache = [];
  return banksCache;
};

const bankNameToSlug: Record<string, string> = {
  telebirr: 'telebirr',
  'cbe birr': 'cbebirr',
  cbebirr: 'cbebirr',
  'm-pesa': 'mpesa',
  mpesa: 'mpesa',
  yaya: 'yaya',
  kacha: 'kacha',
  'commercial bank of ethiopia': 'cbebirr',
  cbe: 'cbebirr',
  'wegagen bank': 'wegagen_bank',
  wegagen: 'wegagen_bank',
  'berhan bank': 'berhan_bank',
  berhan: 'berhan_bank',
  'enat bank': 'enat_bank',
  enat: 'enat_bank',
  'addis international bank': 'addis_int_bank',
  addis: 'addis_int_bank',
  'ahadu bank': 'ahadu_bank',
  ahadu: 'ahadu_bank',
  'global bank': 'global_bank',
  global: 'global_bank',
  'lion bank': 'anbesa_bank',
  'lion international bank': 'anbesa_bank',
  'anbesa bank': 'anbesa_bank',
  lion: 'anbesa_bank',
};

const resolveSlugFromLabel = (label: string): string => {
  const normalized = String(label || '').trim().toLowerCase();
  if (!normalized) return 'cbebirr';

  for (const [key, slug] of Object.entries(bankNameToSlug)) {
    if (normalized === key || normalized.includes(key) || key.includes(normalized)) {
      return slug;
    }
  }

  const banks = loadChapaBanks();
  const bySlug = banks.find((b) => b.slug === normalized);
  if (bySlug) return bySlug.slug;

  const byName = banks.find(
    (b) => b.name === normalized || b.name.includes(normalized) || normalized.includes(b.name),
  );
  if (byName) return byName.slug;

  if (Object.values(bankNameToSlug).includes(normalized)) {
    return normalized;
  }

  return 'cbebirr';
};

const slugToNumericId = (slug: string): number | null => {
  const banks = loadChapaBanks();
  const match = banks.find((b) => b.slug === slug.toLowerCase());
  return match?.id ?? null;
};

/** Chapa subaccount API uses string bank slugs (e.g. telebirr, cbebirr). */
export const mapBankNameToChapaSlug = (providerName: string): string =>
  resolveSlugFromLabel(providerName);

/** @deprecated Use mapBankNameToChapaSlug for subaccounts. */
export const mapBankNameToChapaCode = mapBankNameToChapaSlug;

/**
 * Chapa Transfer API requires numeric bank_code (Chapa bank id).
 * @see backend/chapa_banks.json
 */
export const mapBankNameToChapaTransferCode = (providerName: string): string => {
  const slug = resolveSlugFromLabel(providerName);
  const id = slugToNumericId(slug);
  if (id != null) return String(id);
  return '128'; // CBEBirr fallback
};

/**
 * Resolve stored bank_code (numeric id or legacy slug) for transfers.
 */
export const resolveChapaTransferBankCode = (
  bankCodeOrSlug: string | undefined,
  providerName?: string,
): string => {
  const raw = String(bankCodeOrSlug || '').trim();
  if (/^\d+$/.test(raw)) return raw;

  if (raw) {
    const fromSlug = slugToNumericId(raw);
    if (fromSlug != null) return String(fromSlug);
  }

  return mapBankNameToChapaTransferCode(providerName || raw);
};
