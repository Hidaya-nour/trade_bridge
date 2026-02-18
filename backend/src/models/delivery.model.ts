import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IDelivery, DeliveryStatus } from '../types/order.types';
// import Order from './Order.model';
// import User from './User.model';

interface DeliveryCreationAttributes extends Optional<IDelivery, 'id' | 'created_at' | 'updated_at'> {}

export class Delivery extends Model<IDelivery, DeliveryCreationAttributes> implements IDelivery {
  public id!: string;
  public order_id!: string;
  public driver_id?: string;
  public pickup_location!: string;
  public dropoff_location!: string;
  public status!: DeliveryStatus; // ✅ Using the specific type
  public started_at?: Date;
  public completed_at?: Date;
  public notes?: string;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at?: Date;
}

Delivery.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'orders',
        key: 'id'
      },
    },
    driver_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
    },
    pickup_location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    dropoff_location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled'),
      defaultValue: 'pending',
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
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
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Delivery',
    tableName: 'deliveries',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
  }
);

export default Delivery;