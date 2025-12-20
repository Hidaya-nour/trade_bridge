import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db";

export type UserRole = "shop" | "distributor" | "factory" | "admin";
export type UserStatus = "active" | "inactive" | "suspended";

interface UserAttributes {
    user_id: string;
    full_name: string;
    role: UserRole;
    phone?: string;
    email: string;
    password_hash: string;
    status: UserStatus;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
}

interface UserCreationAttributes
    extends Optional<UserAttributes, "created_at" | "updated_at"> { }

class User extends Model<UserAttributes, UserCreationAttributes>
    implements UserAttributes {
    public user_id!: string;
    public full_name!: string;
    public role!: UserRole;
    public phone?: string;
    public email!: string;
    public password_hash!: string;
    public status!: UserStatus;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

User.init(
    {
        user_id: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
        },
        full_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM("shop", "distributor", "factory", "admin"),
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING(20),
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("active", "inactive", "suspended"),
            defaultValue: "active",
        },
        deleted_at: {
            type: DataTypes.DATE,
        },
    },
    {
        sequelize,
        tableName: "users",
        timestamps: true,
        underscored: true,
        paranoid: true,
        deletedAt: "deleted_at",
    }
);

export default User;
