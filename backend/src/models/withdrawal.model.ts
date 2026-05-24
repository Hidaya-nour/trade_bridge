import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IWithdrawal, WithdrawalStatus } from '../types/wallet.types';

interface WithdrawalCreationAttributes
  extends Optional<
    IWithdrawal,
    | 'id'
    | 'status'
    | 'bank_provider'
    | 'bank_account_name'
    | 'bank_account_number'
    | 'admin_notes'
    | 'approved_by'
    | 'approved_at'
    | 'completed_at'
    | 'created_at'
    | 'updated_at'
  > {}

export class Withdrawal
  extends Model<IWithdrawal, WithdrawalCreationAttributes>
  implements IWithdrawal
{
  public id!: string;
  public supplier_id!: string;
  public amount!: number;
  public status!: WithdrawalStatus;
  public bank_provider?: string;
  public bank_account_name?: string;
  public bank_account_number?: string;
  public bank_code?: string;
  public chapa_transfer_ref?: string;
  public admin_notes?: string;
  public approved_by?: string;
  public approved_at?: Date;
  public completed_at?: Date;
  public created_at!: Date;
  public updated_at!: Date;
}

Withdrawal.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    supplier_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'approved', 'rejected', 'completed'),
      defaultValue: 'pending',
    },
    bank_provider: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    bank_account_name: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    bank_account_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    bank_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    chapa_transfer_ref: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    approved_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Withdrawal',
    tableName: 'withdrawals',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

export default Withdrawal;
