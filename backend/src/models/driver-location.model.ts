import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IDriverLocation } from '../types/driver-location.types';
import { User } from './user.model';
import Order from './order.model';

interface DriverLocationCreationAttributes extends Optional<IDriverLocation, 'id' | 'order_id' | 'recorded_at' | 'deleted_at'> {}

export class DriverLocation extends Model<IDriverLocation, DriverLocationCreationAttributes> implements IDriverLocation {
  public id!: string;
  public driver_id!: string;
  public order_id?: string | null;
  public latitude!: number;
  public longitude!: number;
  public recorded_at!: Date;
  public deleted_at?: Date | null;

  public readonly driver?: User;
  public readonly order?: Order;
}

DriverLocation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    driver_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'orders', key: 'id' }
    },
    latitude: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: false,
      validate: {
        min: -90,
        max: 90
      }
    },
    longitude: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: false,
      validate: {
        min: -180,
        max: 180
      }
    },
    recorded_at: {
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
    modelName: 'DriverLocation',
    tableName: 'driver_locations',
    timestamps: true,
    createdAt: 'recorded_at',
    updatedAt: false,
    deletedAt: 'deleted_at',
    paranoid: true
  }
);

export default DriverLocation;