import { DataTypes, Model } from "sequelize";
import sequelize from "../db";

class RatingReview extends Model {
    public rating_id!: string;
    public retailer_id!: string;
    public supplier_id!: string;
    public product_id!: string;
    public rating!: number;
    public comment?: string;
    public created_at!: Date;
    public deleted_at?: Date;
}

RatingReview.init(
    {
        rating_id: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
        },
        retailer_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
        },
        supplier_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
        },
        product_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        comment: {
            type: DataTypes.TEXT,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        deleted_at: {
            type: DataTypes.DATE,
        },
    },
    {
        sequelize,
        tableName: "ratings_reviews",
        timestamps: false,
    }
);

export default RatingReview;
