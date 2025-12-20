import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db";

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed";

interface OrderAttributes {
    order_id: string;
    supplier_id: string;
    buyer_id: string;
    order_date: Date;
    total_price: number;
    payment_status: PaymentStatus;
    order_status: OrderStatus;
    assigned_driver_id?: string;
    delivery_date?: Date;
    deleted_at?: Date;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, "delivery_date"> { }

class Order extends Model<OrderAttributes, OrderCreationAttributes>
    implements OrderAttributes {
    public order_id!: string;
    public supplier_id!: string;
    public buyer_id!: string;
    public order_date!: Date;
    public total_price!: number;
    public payment_status!: PaymentStatus;
    public order_status!: OrderStatus;
    public assigned_driver_id?: string;
    public delivery_date?: Date;
}

Order.init(
    {
        order_id: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
        },
        supplier_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
        },
        buyer_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
        },
        order_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        total_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        payment_status: {
            type: DataTypes.ENUM("pending", "paid", "failed"),
            allowNull: false,
        },
        order_status: {
            type: DataTypes.ENUM("pending", "confirmed", "shipped", "delivered", "cancelled"),
            allowNull: false,
        },
        assigned_driver_id: {
            type: DataTypes.CHAR(36),
        },
        delivery_date: {
            type: DataTypes.DATEONLY,
        },
        deleted_at: {
            type: DataTypes.DATE,
        },
    },
    {
        sequelize,
        tableName: "orders",
        timestamps: false,
    }
);

export default Order;
