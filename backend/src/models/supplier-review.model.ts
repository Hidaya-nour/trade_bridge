import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface SupplierReviewAttributes {
  id: string;
  supplier_id: string;
  user_id: string;
  rating: number;
  comment?: string | null;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: Date;
  updated_at: Date;
}

type SupplierReviewCreationAttributes = Optional<
  SupplierReviewAttributes,
  'id' | 'comment' | 'verified_purchase' | 'helpful_count' | 'created_at' | 'updated_at'
>;

export class SupplierReview
  extends Model<SupplierReviewAttributes, SupplierReviewCreationAttributes>
  implements SupplierReviewAttributes
{
  public id!: string;
  public supplier_id!: string;
  public user_id!: string;
  public rating!: number;
  public comment?: string | null;
  public verified_purchase!: boolean;
  public helpful_count!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

SupplierReview.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    supplier_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    verified_purchase: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    helpful_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    modelName: 'SupplierReview',
    tableName: 'supplier_reviews',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['supplier_id'] },
      { fields: ['user_id'] },
      { unique: true, fields: ['supplier_id', 'user_id'] },
      { fields: ['created_at'] },
    ],
  },
);

export default SupplierReview;

