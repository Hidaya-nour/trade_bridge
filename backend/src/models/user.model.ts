import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IUser, UserRole, UserStatus } from '../types/auth.types';

interface UserCreationAttributes extends Optional<IUser, 'id' | 'created_at' | 'updated_at' | 'verified'> {}

export class User extends Model<IUser, UserCreationAttributes> implements IUser {
  public id!: string;
  public email!: string;
  public full_name!: string;
  public role!: UserRole;
  public status!: UserStatus;
  public phone?: string;
  public password_hash!: string;
  public business_name?: string;
  public tin_number?: string;
  public is_vat_registered?: boolean;
  public vat_rate?: number;
  public profile_image?: string;
  public verified!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at?: Date;
  public approved_at?: Date;
  public approved_by?: string;
  public last_login?: Date;

  // Will be populated by association
  public readonly refreshTokens?: any[];
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    full_name: {
      type: DataTypes.STRING(105),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('retailer', 'distributor', 'factory', 'driver', 'admin'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'suspended', 'rejected'),
      defaultValue: 'pending',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    business_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    tin_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    is_vat_registered: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    vat_rate: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0.15,
      validate: {
        min: 0,
        max: 1,
      },
    },
    profile_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    approved_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
  }
);

// ✅ NO ASSOCIATIONS HERE

export default User;
