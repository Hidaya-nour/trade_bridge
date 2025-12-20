import { DataTypes, Model } from "sequelize";
import sequelize from "../db";

class InventoryMovement extends Model { }

InventoryMovement.init(
    {
        movement_id: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
        },
        product_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM("IN", "OUT", "ADJUSTMENT"),
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        reason: DataTypes.STRING,
        deleted_at: {
            type: DataTypes.DATE,
        },
    },
    {
        sequelize,
        tableName: "inventory_movements",
        timestamps: true,
        paranoid: true,
        deletedAt: "deleted_at",
    }
);

export default InventoryMovement;
