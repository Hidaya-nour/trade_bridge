import { DataTypes, Model } from "sequelize";
import sequelize from "../db";

class OrderStatusHistory extends Model { }

OrderStatusHistory.init(
    {
        history_id: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
        },
        order_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
        },
        old_status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        new_status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        changed_by: {
            type: DataTypes.CHAR(36),
            allowNull: false,
        },
        deleted_at: {
            type: DataTypes.DATE,
        },
    },
    {
        sequelize,
        tableName: "order_status_history",
        timestamps: true,
        paranoid: true,
        deletedAt: "deleted_at",
    }
);

export default OrderStatusHistory;
