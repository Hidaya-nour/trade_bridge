import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IPromotion, DiscountType, TargetRole } from '../types/promotion.types';

interface PromotionCreationAttributes extends Optional<IPromotion, 'id' | 'created_at' | 'updated_at' | 'description' | 'minimum_order_amount'> {}

export class Promotion extends Model<IPromotion, PromotionCreationAttributes> implements IPromotion {
  public id!: string;
  public name!: string;
  public description?: string;
  public discount_type!: DiscountType;
  public discount_value!: number;
  public start_date!: Date;
  public end_date!: Date;
  public target_role!: TargetRole;
  public target_region!: string;
  public is_active!: boolean;
  public minimum_order_amount?: number;
  public created_at!: Date;
  public updated_at!: Date;
}

Promotion.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    discount_type: {
      type: DataTypes.ENUM('percentage', 'fixed'),
      allowNull: false,
    },
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    target_role: {
      type: DataTypes.ENUM('retailer', 'distributor', 'factory', 'driver', 'admin', 'all'),
      allowNull: false,
    },
    target_region: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'all',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    minimum_order_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
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
    modelName: 'Promotion',
    tableName: 'promotions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Custom validation for date range
Promotion.addHook('beforeSave', (promotion: Promotion) => {
  if (promotion.start_date >= promotion.end_date) {
    throw new Error('Start date must be before end date');
  }
});

// ✅ NO ASSOCIATIONS HERE

export default Promotion;