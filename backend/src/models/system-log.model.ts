import { DataTypes, Model } from "sequelize";
import sequelize from "../db";

class SystemLog extends Model {
    public log_id!: string;
    public user_id!: string;
    public action!: string;
    public details!: string;
    public timestamp!: Date;
    public deleted_at?: Date;
}

SystemLog.init(
    {
        log_id: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
        },
        action: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        details: {
            type: DataTypes.TEXT,
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
        tableName: "system_logs",
        timestamps: false,
    }
);

export default SystemLog;
