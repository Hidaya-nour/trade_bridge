import { DataTypes, Model } from "sequelize";
import sequelize from "../db";

class Announcement extends Model {
    public announcement_id!: number;
    public supplier_id!: string;
    public title!: string;
    public message!: string;
    public image_url?: string;
    public expires_at?: Date;
    public deleted_at?: Date;
}

Announcement.init(
    {
        announcement_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        supplier_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        image_url: {
            type: DataTypes.STRING(255),
        },
        expires_at: {
            type: DataTypes.DATE,
        },
        deleted_at: {
            type: DataTypes.DATE,
        },
    },
    {
        sequelize,
        tableName: "announcements",
        timestamps: false,
    }
);

export default Announcement;
