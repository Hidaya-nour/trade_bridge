import { DataTypes, Model } from "sequelize";
import sequelize from "../db";

class EntityChange extends Model { }

EntityChange.init(
    {
        change_id: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
        },
        entity_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        entity_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
        },
        old_value: {
            type: DataTypes.JSON,
        },
        new_value: {
            type: DataTypes.JSON,
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
        tableName: "entity_changes",
        timestamps: true,
        paranoid: true,
        deletedAt: "deleted_at",
    }
);

export default EntityChange;
