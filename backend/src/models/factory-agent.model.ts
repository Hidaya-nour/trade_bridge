import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IFactoryAgent, ContractType, CommissionType, PaymentTerms } from '../types/factory-agent.types';
import { User } from './user.model';

interface FactoryAgentCreationAttributes
  extends Optional<
    IFactoryAgent,
    | 'id'
    | 'contract_document_id'
    | 'contract_document_url'
    | 'contract_document_name'
    | 'min_sales_target'
    | 'max_sales_cap'
    | 'territory'
    | 'end_date'
    | 'renewal_date'
    | 'last_sale_date'
    | 'termination_reason'
    | 'updated_at'
    | 'deleted_at'
  > {}

export class FactoryAgent extends Model<IFactoryAgent, FactoryAgentCreationAttributes> implements IFactoryAgent {
  public id!: string;
  public factory_id!: string;
  public agent_id!: string;
  public contract_number!: string;
  public contract_document_id?: string | null;
  public contract_document_url?: string | null;
  public contract_document_name?: string | null;
  public contract_type!: ContractType;
  public commission_rate!: number;
  public commission_type!: CommissionType;
  public min_sales_target?: number;
  public max_sales_cap?: number;
  public territory?: string;
  public start_date!: Date;
  public end_date?: Date | null;
  public renewal_date?: Date | null;
  public payment_terms!: PaymentTerms;
  public last_sale_date?: Date | null;
  public termination_reason?: string | null;
  public created_by!: string;
  public updated_at!: Date;
  public deleted_at?: Date | null;

  public readonly factory?: User;
  public readonly agent?: User;
  public readonly creator?: User;
}

FactoryAgent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    factory_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    agent_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    contract_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    contract_document_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    contract_document_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    contract_document_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    contract_type: {
      type: DataTypes.ENUM('exclusive', 'non_exclusive', 'temporary', 'permanent'),
      allowNull: false
    },
    commission_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    commission_type: {
      type: DataTypes.ENUM('percentage', 'fixed_amount', 'tiered'),
      allowNull: false
    },
    min_sales_target: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    max_sales_cap: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    territory: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    renewal_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    payment_terms: {
      type: DataTypes.ENUM('monthly', 'quarterly', 'annually', 'upon_sale'),
      allowNull: false
    },
    last_sale_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    termination_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    updated_at: {
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
    modelName: 'FactoryAgent',
    tableName: 'factory_agents',
    timestamps: true,
    createdAt: false,
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
  }
);

export default FactoryAgent;
