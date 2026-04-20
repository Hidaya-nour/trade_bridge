import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { ISupplierPaymentMethod, PaymentMethodType } from '../types/supplier-payment-method.types';
import { User } from './user.model';

interface SupplierPaymentMethodCreationAttributes extends Optional<ISupplierPaymentMethod, 'id' | 'is_primary' | 'is_active' | 'created_at' | 'updated_at' | 'deleted_at'> {}

export class SupplierPaymentMethod extends Model<ISupplierPaymentMethod, SupplierPaymentMethodCreationAttributes> implements ISupplierPaymentMethod {
  public id!: string;
  public supplier_id!: string;
  public method_type!: PaymentMethodType;
  public provider_name!: string;
  public account_holder_name!: string;
  public account_identifier!: string;
  public account_display!: string;
  public is_primary!: boolean;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at?: Date;

  public readonly supplier?: User;
}

SupplierPaymentMethod.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    supplier_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    method_type: {
      // NOTE:
      // Using ENUM here makes `sequelize.sync({ alter: true })` fragile when the DB
      // already contains legacy/unknown values (MySQL throws "Data truncated").
      // Keep this as a string column and enforce allowed values at the API layer.
      type: DataTypes.STRING(50),
      allowNull: false
    },
    provider_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    account_holder_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    account_identifier: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    account_display: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'SupplierPaymentMethod',
    tableName: 'supplier_payment_methods',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
  }
);

export default SupplierPaymentMethod;
