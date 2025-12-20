import { DataTypes, Model } from "sequelize";
import sequelize from "../db";

class Address extends Model { }

Address.init(
    {
        address_id: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM("billing", "shipping", "warehouse"),
            allowNull: false,
        },
        city: DataTypes.STRING,
        region: DataTypes.STRING,
        country: DataTypes.STRING,
        zip_code: DataTypes.STRING,
        is_default: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        deleted_at: {
            type: DataTypes.DATE,
        },
    },
    {
        sequelize,
        tableName: "addresses",
        timestamps: true,
        paranoid: true,
        deletedAt: "deleted_at",
    }
);

export default Address;
