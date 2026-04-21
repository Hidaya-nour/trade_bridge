import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export type UserReportStatus = 'open' | 'reviewed' | 'dismissed';

export interface UserReportAttributes {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  order_id?: string | null;
  reason: string;
  description?: string | null;
  status: UserReportStatus;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

type UserReportCreationAttributes = Optional<
  UserReportAttributes,
  'id' | 'order_id' | 'description' | 'status' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export class UserReport
  extends Model<UserReportAttributes, UserReportCreationAttributes>
  implements UserReportAttributes
{
  public id!: string;
  public reporter_id!: string;
  public reported_user_id!: string;
  public order_id?: string | null;
  public reason!: string;
  public description?: string | null;
  public status!: UserReportStatus;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at?: Date | null;
}

UserReport.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reporter_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    reported_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'orders', key: 'id' },
    },
    reason: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('open', 'reviewed', 'dismissed'),
      allowNull: false,
      defaultValue: 'open',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'UserReport',
    tableName: 'user_reports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    indexes: [
      { fields: ['reporter_id'] },
      { fields: ['reported_user_id'] },
      { fields: ['status'] },
      { fields: ['created_at'] },
    ],
  },
);

export default UserReport;

