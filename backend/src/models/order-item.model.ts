import { DataTypes, Model } from "sequelize";
import sequelize from "../db";

class OrderItem extends Model {
    public order_item_id!: string;
    public order_id!: string;
    public product_id!: string;
    public quantity!: number;
    public unit_price!: number;
    public subtotal!: number;
    public deleted_at?: Date;

}

OrderItem.init(
    {
        order_item_id: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
        },
        order_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
        },
        product_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        unit_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        subtotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        deleted_at: {
            type: DataTypes.DATE,
        },
    },
    {
        sequelize,
        tableName: "order_items",
        timestamps: false,
    }
);

export default OrderItem;
