import sequelize from '../config/database';

type TableRow = Record<string, any>;

const hasFlag = (flag: string) =>
  process.argv.some((arg) => String(arg).trim().toLowerCase() === flag);

const isTruthy = (value: unknown) => {
  const raw = String(value ?? '').trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'y';
};

const log = (message: string) => {
  // eslint-disable-next-line no-console
  console.log(message);
};

const getTableKind = async (name: string): Promise<'BASE TABLE' | 'VIEW' | null> => {
  const [rows] = await sequelize.query(`SHOW FULL TABLES LIKE ${sequelize.escape(name)}`);
  const found = (rows as TableRow[]) || [];
  if (found.length === 0) return null;
  const row = found[0] || {};
  const typeKey = Object.keys(row).find((key) => key.toLowerCase().includes('table_type'));
  const kind = typeKey ? String(row[typeKey] || '').toUpperCase() : '';
  if (kind === 'BASE TABLE') return 'BASE TABLE';
  if (kind === 'VIEW') return 'VIEW';
  return null;
};

async function main() {
  await sequelize.authenticate();

  const rename =
    hasFlag('--rename') ||
    isTruthy(process.env.RENAME_INVENTORY_MOVEMENTS_TO_STOCK_MOVEMENTS);

  const inventoryKind = await getTableKind('inventory_movements');
  const stockKind = await getTableKind('stock_movements');

  if (!inventoryKind && !stockKind) {
    log('No inventory_movements or stock_movements table found. Nothing to migrate.');
    return;
  }

  if (rename) {
    if (inventoryKind === 'BASE TABLE' && !stockKind) {
      log('Renaming table inventory_movements -> stock_movements...');
      await sequelize.query('RENAME TABLE inventory_movements TO stock_movements');
      log('Creating compatibility view inventory_movements -> stock_movements...');
      await sequelize.query('CREATE VIEW inventory_movements AS SELECT * FROM stock_movements');
      log('Done.');
      return;
    }

    if (stockKind === 'BASE TABLE' && !inventoryKind) {
      log('Creating compatibility view inventory_movements -> stock_movements...');
      await sequelize.query('CREATE VIEW inventory_movements AS SELECT * FROM stock_movements');
      log('Done.');
      return;
    }

    log('Rename mode: nothing to do (tables/views already exist).');
    return;
  }

  // Non-destructive mode: create a view so DB consumers can use stock naming
  if (!stockKind && inventoryKind) {
    log('Creating view stock_movements -> inventory_movements...');
    await sequelize.query('CREATE VIEW stock_movements AS SELECT * FROM inventory_movements');
    log('Done.');
    return;
  }

  log('Non-destructive mode: nothing to do (stock_movements already exists).');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Migration failed:', err);
    process.exit(1);
  });

