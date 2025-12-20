import { DataTypes, Model } from "sequelize";
import sequelize from "../db";

class Notification extends Model {
    public notification_id!: string;
    public user_id!: string;
    public title!: string;
    public message!: string;
    public notify_type!: string;
    public is_read!: boolean;
    public timestamp!: Date;
    public deleted_at?: Date;

}

Notification.init(
    {
        notification_id: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        notify_type: {
            type: DataTypes.ENUM("order", "payment", "message", "system"),
            allowNull: false,
        },
        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        timestamp: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        deleted_at: {
            type: DataTypes.DATE,
        },
    },
    {
        sequelize,
        tableName: "notifications",
        timestamps: false,
    }
);

export default Notification;
