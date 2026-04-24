import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export type SuspensionAppealStatus = 'open' | 'reviewed';

export interface SuspensionAppealAttributes {
  id: string;
  user_id: string;
  message: string;
  status: SuspensionAppealStatus;
  created_at: Date;
  updated_at: Date;
}

type SuspensionAppealCreationAttributes = Optional<
  SuspensionAppealAttributes,
  'id' | 'status' | 'created_at' | 'updated_at'
>;

export class SuspensionAppeal
  extends Model<SuspensionAppealAttributes, SuspensionAppealCreationAttributes>
  implements SuspensionAppealAttributes
{
  public id!: string;
  public user_id!: string;
  public message!: string;
  public status!: SuspensionAppealStatus;
  public created_at!: Date;
  public updated_at!: Date;
}

SuspensionAppeal.init(
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
        key: 'id',
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('open', 'reviewed'),
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
  },
  {
    sequelize,
    modelName: 'SuspensionAppeal',
    tableName: 'suspension_appeals',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [{ fields: ['user_id'] }, { fields: ['status'] }, { fields: ['created_at'] }],
  },
);

export default SuspensionAppeal;

