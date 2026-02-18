import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IDeliveryEvent } from '../types/order.types';
// import Delivery from './Delivery.model';

interface DeliveryEventCreationAttributes extends Optional<IDeliveryEvent, 'id' | 'created_at'> {}

export class DeliveryEvent extends Model<IDeliveryEvent, DeliveryEventCreationAttributes> implements IDeliveryEvent {
  public id!: string;
  public delivery_id!: string;
  public event_type!: string;
  public latitude?: number;
  public longitude?: number;
  public note?: string;
  public created_at!: Date;
}

DeliveryEvent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    delivery_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'deliveries',
        key: 'id'
      },
      onDelete: 'CASCADE',
    },
    event_type: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'DeliveryEvent',
    tableName: 'delivery_events',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default DeliveryEvent;