import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { ICartItem } from '../types/cart.types';

interface CartItemCreationAttributes extends Optional<ICartItem, 'id'> {}

export class CartItem extends Model<ICartItem, CartItemCreationAttributes> implements ICartItem {
  public id!: string;
  public cart_id!: string;
  public product_id!: string;
  public quantity!: number;
}

CartItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cart_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'carts',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
  },
  {
    sequelize,
    modelName: 'CartItem',
    tableName: 'cart_items',
    timestamps: false, // No timestamps for cart items as per schema
  }
);

export default CartItem;