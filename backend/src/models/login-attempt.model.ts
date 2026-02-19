import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { ILoginAttempt } from '../types/login-attempt.types';

interface LoginAttemptCreationAttributes extends Optional<ILoginAttempt, 'id' | 'attempted_at' | 'user_agent'> {}

export class LoginAttempt extends Model<ILoginAttempt, LoginAttemptCreationAttributes> implements ILoginAttempt {
  public id!: string;
  public email!: string;
  public ip_address!: string;
  public user_agent?: string;
  public success!: boolean;
  public attempted_at!: Date;
}

LoginAttempt.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    ip_address: {
      type: DataTypes.STRING(45), // IPv6 addresses can be up to 45 characters
      allowNull: false,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    success: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    attempted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'LoginAttempt',
    tableName: 'login_attempts',
    timestamps: false, // Using attempted_at instead
    paranoid: false,
  }
);

export default LoginAttempt;