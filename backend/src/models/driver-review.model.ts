import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface DriverReviewAttributes {
  id: string;
  delivery_id: string;
  driver_user_id: string;
  buyer_id: string;
  rating: number;
  comment?: string | null;
  created_at: Date;
  updated_at: Date;
}

type DriverReviewCreationAttributes = Optional<
  DriverReviewAttributes,
  'id' | 'comment' | 'created_at' | 'updated_at'
>;

export class DriverReview
  extends Model<DriverReviewAttributes, DriverReviewCreationAttributes>
  implements DriverReviewAttributes
{
  public id!: string;
  public delivery_id!: string;
  public driver_user_id!: string;
  public buyer_id!: string;
  public rating!: number;
  public comment?: string | null;
  public created_at!: Date;
  public updated_at!: Date;
}

DriverReview.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    delivery_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'deliveries', key: 'id' },
    },
    driver_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    buyer_id: {
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
    modelName: 'DriverReview',
    tableName: 'driver_reviews',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['delivery_id'] },
      { fields: ['driver_user_id'] },
      { fields: ['buyer_id'] },
      { unique: true, fields: ['delivery_id', 'buyer_id'] },
      { fields: ['created_at'] },
    ],
  },
);

export default DriverReview;

