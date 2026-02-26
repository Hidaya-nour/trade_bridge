import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IProduct } from '../types/product.types';
import User from './user.model';

interface ProductCreationAttributes extends Optional<IProduct, 'id' | 'created_at' | 'updated_at' | 'images'> {}

export class Product extends Model<IProduct, ProductCreationAttributes> implements IProduct {
  public id!: string;
  public supplier_id!: string;
  public name!: string;
  public category!: string;
  public description!: string;
  public price!: number;
  public stock_quantity!: number;
  public min_order_amount!: number;
  public unit_type!: string;
  public images!: any;
  public rating!: number;
  public is_available!: number;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at?: Date;

  // Virtual field for supplier info (joined data)
  public readonly supplier?: User;
}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    supplier_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    min_order_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    unit_type: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    is_available: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      validate: {
        isIn: [[0, 1]],
      },
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0,
        max: 5,
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
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true, 
    indexes: [
      {
        fields: ['supplier_id'],
      },
      {
        fields: ['category'],
      },
      {
        fields: ['is_available'],
      },
    ],
  }
);


export default Product;