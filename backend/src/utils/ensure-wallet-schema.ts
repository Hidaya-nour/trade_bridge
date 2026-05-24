import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import logger from './logger';

type ColumnRow = { Field: string };

async function columnExists(table: string, column: string): Promise<boolean> {
  const rows = await sequelize.query<ColumnRow>(
    `SHOW COLUMNS FROM \`${table}\` LIKE :column`,
    { replacements: { column }, type: QueryTypes.SELECT },
  );
  return rows.length > 0;
}

async function addColumnIfMissing(
  table: string,
  column: string,
  definition: string,
): Promise<void> {
  const exists = await columnExists(table, column);
  if (exists) return;
  await sequelize.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
  logger.info(`Added column ${table}.${column}`);
}

/**
 * Ensures wallet / settlement columns exist (MySQL-compatible, no IF NOT EXISTS).
 */
export async function ensureWalletSchema(): Promise<void> {
  try {
    await addColumnIfMissing(
      'users',
      'pending_balance',
      'DECIMAL(12,2) NOT NULL DEFAULT 0',
    );
    await addColumnIfMissing(
      'users',
      'available_balance',
      'DECIMAL(12,2) NOT NULL DEFAULT 0',
    );
    await addColumnIfMissing(
      'payments',
      'seller_net_amount',
      'DECIMAL(12,2) NULL',
    );
    await addColumnIfMissing(
      'payments',
      'platform_fee_amount',
      'DECIMAL(12,2) NULL',
    );

    const hasSettlement = await columnExists('payments', 'settlement_status');
    if (!hasSettlement) {
      await sequelize.query(
        "ALTER TABLE `payments` ADD COLUMN `settlement_status` ENUM('none','pending','released','reversed') NOT NULL DEFAULT 'none'",
      );
      logger.info('Added column payments.settlement_status');
    }

    // Backfill any NULL settlement rows on older payments
    await sequelize.query(
      "UPDATE `payments` SET `settlement_status` = 'none' WHERE `settlement_status` IS NULL",
    ).catch(() => undefined);

    await addColumnIfMissing('withdrawals', 'bank_code', 'VARCHAR(50) NULL');
    await addColumnIfMissing('withdrawals', 'chapa_transfer_ref', 'VARCHAR(255) NULL');

    try {
      await sequelize.query(
        "ALTER TABLE `withdrawals` MODIFY `status` ENUM('pending','processing','approved','rejected','completed') NOT NULL DEFAULT 'pending'",
      );
    } catch {
      // table may not exist yet on first boot
    }
  } catch (error) {
    logger.error('ensureWalletSchema failed', error);
    throw error;
  }
}
