import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IOrderItems } from '../types/order.types';
import Order from './order.model';
import Product from './product.model';

interface OrderItemCreationAttributes extends Optional<IOrderItems, 'id' | 'created_at' | 'updated_at'> {}

export class OrderItems extends Model<IOrderItems, OrderItemCreationAttributes> implements IOrderItems {
  public id!: string;
  public order_id!: string;
  public product_id!: string;
  public quantity!: number;
  public unit_price!: number;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at?: Date;

  // Associations
  public readonly order?: Order;
  public readonly product?: Product;
}

OrderItems.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      },
      onDelete: 'CASCADE',
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'OrderItems',
    tableName: 'order_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
  }
);

export default OrderItems;