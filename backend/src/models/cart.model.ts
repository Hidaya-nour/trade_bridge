import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { ICart } from '../types/cart.types';

interface CartCreationAttributes extends Optional<ICart, 'id' | 'created_at' | 'updated_at'> {}

export class Cart extends Model<ICart, CartCreationAttributes> implements ICart {
  public id!: string;
  public user_id!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

Cart.init(
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
      onUpdate: 'CASCADE',
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
    modelName: 'Cart',
    tableName: 'carts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Cart;