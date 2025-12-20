import { DataTypes, Model } from "sequelize";
import sequelize from "../db";

class Dispute extends Model { }

Dispute.init(
    {
        dispute_id: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
        },
        order_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
        },
        raised_by: {
            type: DataTypes.CHAR(36),
            allowNull: false,
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("open", "resolved", "rejected"),
            defaultValue: "open",
        },
        resolution_notes: DataTypes.TEXT,
        deleted_at: {
            type: DataTypes.DATE,
        },
    },
    {
        sequelize,
        tableName: "disputes",
        timestamps: true,
        paranoid: true,
        deletedAt: "deleted_at",
    }
);

export default Dispute;
