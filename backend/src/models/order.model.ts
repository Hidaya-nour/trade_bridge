import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IOrder, OrderStatus } from '../types/order.types';
import User from './user.model';
import OrderItem from './order-item.model';
import Payment from './payment.model';
import Delivery from './delivery.model';

interface OrderCreationAttributes extends Optional<IOrder, 'id' | 'created_at' | 'updated_at'> {}

export class Order extends Model<IOrder, OrderCreationAttributes> implements IOrder {
  public id!: string;
  public buyer_id!: string;
  public supplier_id!: string;
  public total_price!: number;
  public order_status!: OrderStatus;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at?: Date;

  // Associations
  public readonly buyer?: User;
  public readonly supplier?: User;
  public readonly items?: OrderItem[];
  public readonly payment?: Payment;
  public readonly delivery?: Delivery;
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    buyer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
    },
    supplier_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    delivery_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    order_status: {
      type: DataTypes.ENUM('pending', 'approved', 'processing', 'shipped', 'delivered','closed', 'cancelled'),
      defaultValue: 'pending',
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
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    indexes: [
      { fields: ['buyer_id'] },
      { fields: ['supplier_id'] },
      { fields: ['order_status'] },
      { fields: ['created_at'] },
    ],
  }
);

export default Order;