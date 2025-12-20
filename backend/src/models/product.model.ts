import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db";

interface ProductAttributes {
    product_id: string;
    supplier_id: string;
    name: string;
    category: string;
    price: number;
    stock_quantity: number;
    min_order_amount: number;
    unit_type: string;
    description?: string;
    images?: object;
    is_available: boolean;
    created_at?: Date;
    updated_at?: Date;
}

interface ProductCreationAttributes
    extends Optional<ProductAttributes, "created_at" | "updated_at"> { }

class Product extends Model<ProductAttributes, ProductCreationAttributes>
    implements ProductAttributes {
    public product_id!: string;
    public supplier_id!: string;
    public name!: string;
    public category!: string;
    public price!: number;
    public stock_quantity!: number;
    public min_order_amount!: number;
    public unit_type!: string;
    public description?: string;
    public images?: object;
    public is_available!: boolean;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Product.init(
    {
        product_id: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
        },
        supplier_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(120),
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING(50),
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        stock_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        min_order_amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        unit_type: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
        },
        images: {
            type: DataTypes.JSON,
        },
        is_available: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: "products",
        timestamps: true,
        underscored: true,
    }
);

export default Product;
