import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IChatMessage } from '../types/chat-message.types';
import { User } from './user.model';
import Order from './order.model';

interface ChatMessageCreationAttributes extends Optional<IChatMessage, 'id' | 'created_at' | 'updated_at' | 'order_id' | 'is_read'> {}

export class ChatMessage extends Model<IChatMessage, ChatMessageCreationAttributes> implements IChatMessage {
  public id!: string;
  public sender_id!: string;
  public receiver_id!: string;
  public order_id?: string;
  public message!: string;
  public is_read!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  // Virtual fields
  public readonly sender?: User;
  public readonly receiver?: User;
  public readonly order?: Order;
}

ChatMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    receiver_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'orders',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'ChatMessage',
    tableName: 'chat_messages',
    timestamps: true,
    paranoid: false,
  }
);

export default ChatMessage;