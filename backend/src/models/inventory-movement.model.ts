import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IInventoryMovement } from '../types/inventory-movement.types';
import { Product } from './product.model';
import { User } from './user.model';

interface InventoryMovementCreationAttributes extends Optional<IInventoryMovement, 'id' | 'created_at' | 'updated_at' | 'reason'> {}

export class InventoryMovement extends Model<IInventoryMovement, InventoryMovementCreationAttributes> implements IInventoryMovement {
  public id!: string;
  public product_id!: string;
  public movement_type!: 'in' | 'out' | 'adjustment';
  public quantity!: number;
  public reason?: string;
  public user_id!: string;
  public created_at!: Date;
  public updated_at!: Date;

  // Virtual fields
  public readonly product?: Product;
  public readonly user?: User;
}

InventoryMovement.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    movement_type: {
      type: DataTypes.ENUM('in', 'out', 'adjustment'),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
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
    modelName: 'InventoryMovement',
    tableName: 'inventory_movements',
    timestamps: true,
    paranoid: false,
  }
);

export default InventoryMovement;