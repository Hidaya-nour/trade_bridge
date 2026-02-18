import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IDispute } from '../types/dispute.types';

interface DisputeCreationAttributes extends Optional<IDispute, 'id' | 'created_at' | 'resolved_at'> {}

export class Dispute extends Model<IDispute, DisputeCreationAttributes> implements IDispute {
  public id!: string;
  public order_id!: string;
  public raised_by!: string;
  public against_user!: string;
  public description!: string;
  public status!: string;
  public resolved_by?: string;
  public resolved_at?: Date;
  public created_at!: Date;
}

Dispute.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    order_id: { type: DataTypes.UUID, allowNull: false },
    raised_by: { type: DataTypes.UUID, allowNull: false },
    against_user: { type: DataTypes.UUID, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'open' },
    resolved_by: { type: DataTypes.UUID, allowNull: true },
    resolved_at: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  },
  {
    sequelize,
    modelName: 'Dispute',
    tableName: 'disputes',
    timestamps: false
  }
);

export default Dispute;
