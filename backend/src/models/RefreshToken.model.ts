import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IRefreshToken } from '../types/auth.types';

interface RefreshTokenCreationAttributes extends Optional<IRefreshToken, 'id' | 'created_at'> {}

export class RefreshToken extends Model<IRefreshToken, RefreshTokenCreationAttributes> implements IRefreshToken {
  public id!: string;
  public user_id!: string;
  public token_hash!: string;
  public expires_at!: Date;
  public created_at!: Date;
  public is_revoked!: boolean;
  public user_agent?: string;
  public ip_address?: string;

  // Will be populated by association
  public readonly user?: any;
}

RefreshToken.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
    },
    token_hash: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    is_revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    user_agent: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'RefreshToken',
    tableName: 'refresh_tokens',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

// ✅ NO ASSOCIATIONS HERE - They will be set up separately

export default RefreshToken;