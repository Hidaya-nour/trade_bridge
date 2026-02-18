import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { INotification } from '../types/notification.types';
import User from './user.model';

interface NotificationCreationAttributes extends Optional<INotification, 'id' | 'created_at' | 'deleted_at'> {}

export class Notification extends Model<INotification, NotificationCreationAttributes> implements INotification {
  public id!: string;
  public user_id!: string;
  public type!: string;
  public title!: string;
  public message!: string;
  public is_read!: number;
  public created_at!: Date;
  public deleted_at?: Date;

  public readonly user?: User;
}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    type: {
      type: DataTypes.STRING(50),
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
    is_read: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      validate: { isIn: [[0, 1]] }
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    timestamps: false,
  }
);

export default Notification;
