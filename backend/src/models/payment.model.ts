import { DataTypes, Model } from "sequelize";
import sequelize from "../db";

export type PaymentMethod = "cash" | "card" | "mobile";
export type PaymentStatus = "pending" | "paid" | "failed";

class Payment extends Model {
    public payment_id!: number;
    public order_id!: string;
    public payment_method!: PaymentMethod;
    public transaction_reference!: string;
    public amount_paid!: number;
    public payment_date!: Date;
    public payment_status!: PaymentStatus;
    public deleted_at?: Date;
}

Payment.init(
    {
        payment_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        order_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
        },
        payment_method: {
            type: DataTypes.ENUM("cash", "card", "mobile"),
            allowNull: false,
        },
        transaction_reference: {
            type: DataTypes.STRING(100),
        },
        amount_paid: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        payment_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        payment_status: {
            type: DataTypes.ENUM("pending", "paid", "failed"),
            allowNull: false,
        },
        deleted_at: {
            type: DataTypes.DATE,
        },
    },
    {
        sequelize,
        tableName: "payments",
        timestamps: false,
    }
);

export default Payment;
