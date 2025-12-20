import { DataTypes, Model } from "sequelize";
import sequelize from "../db";

class ChatMessage extends Model {
    public message_id!: string;
    public sender_id!: string;
    public receiver_id!: string;
    public content!: string;
    public is_read!: boolean;
    public timestamp!: Date;
    public deleted_at?: Date;
}

ChatMessage.init(
    {
        message_id: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
        },
        sender_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
        },
        receiver_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
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
        tableName: "chat_messages",
        timestamps: false,
    }
);

export default ChatMessage;
