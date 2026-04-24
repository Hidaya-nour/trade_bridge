import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IAddress } from '../types/address.types';
import { User } from './user.model';

interface AddressCreationAttributes extends Optional<IAddress, 'id' | 'subcity' | 'latitude' | 'longitude' | 'created_at' | 'updated_at' | 'deleted_at'> {}

export class Address extends Model<IAddress, AddressCreationAttributes> implements IAddress {
  public id!: string;
  public user_id!: string;
  public region!: string;
  public city!: string;
  public subcity?: string | null;
  public common_name?: string | null;
  public latitude?: number | null;
  public longitude?: number | null;
  public created_at?: Date;
  public updated_at?: Date | null;
  public deleted_at?: Date | null;

  public readonly user?: User;
}

Address.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    user_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
    region: { type: DataTypes.STRING(100), allowNull: false },
    city: { type: DataTypes.STRING(100), allowNull: false },
    subcity: { type: DataTypes.STRING(100), allowNull: true },
    common_name: { type: DataTypes.STRING(120), allowNull: true },
    latitude: { type: DataTypes.DECIMAL(9,6), allowNull: true },
    longitude: { type: DataTypes.DECIMAL(9,6), allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: true },
    deleted_at: { type: DataTypes.DATE, allowNull: true }
  },
  {
    sequelize,
    modelName: 'Address',
    tableName: 'addresses',
    timestamps: false,
    paranoid: false
  }
);

export default Address;
