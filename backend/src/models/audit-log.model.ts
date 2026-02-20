import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IAuditLog } from '../types/audit-log.types';
import { User } from './user.model';

interface AuditLogCreationAttributes extends Optional<IAuditLog, 'id' | 'ip_address' | 'created_at'> {}

export class AuditLog extends Model<IAuditLog, AuditLogCreationAttributes> implements IAuditLog {
  public id!: string;
  public user_id!: string;
  public action!: string;
  public entity_type!: string;
  public entity_id!: string;
  public ip_address?: string;
  public created_at!: Date;

  public readonly user?: User;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    entity_type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    entity_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'audit_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  }
);

export default AuditLog;