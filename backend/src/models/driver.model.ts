import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IDriver } from '../types/driver.types';
import { User } from './user.model';

interface DriverCreationAttributes
  extends Optional<IDriver, 'id' | 'vehicle_type' | 'license_plate' | 'active' | 'created_at' | 'deleted_at'> {}

export class Driver
  extends Model<IDriver, DriverCreationAttributes>
  implements IDriver
{
  public id!: string;
  public supplier_id!: string;
  public driver_id!: string;
  public vehicle_type?: string | null;
  public license_plate?: string | null;
  public active!: boolean;
  public created_at!: Date;
  public deleted_at?: Date | null;

  public readonly supplier?: User;
  public readonly driver?: User;
}

Driver.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    supplier_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    driver_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    vehicle_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    license_plate: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_at: {
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
    modelName: 'Driver',
    tableName: 'drivers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    deletedAt: 'deleted_at',
    paranoid: true,
  },
);

export default Driver;

