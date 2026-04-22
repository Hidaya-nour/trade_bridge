import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export const DRIVER_ISSUE_CATEGORIES = [
  'vehicle_issue',
  'product_issue',
  'delivery_issue',
  'route_navigation_issue',
  'payment_issue',
  'customer_issue',
  'safety_issue',
  'app_system_issue',
  'other',
] as const;

export const DRIVER_ISSUE_URGENCIES = [
  'low',
  'medium',
  'high',
  'critical',
] as const;

export const DRIVER_ISSUE_CONCERNED_PARTIES = [
  'distributor',
  'retailer',
  'factory',
  'customer',
  'platform_system',
  'other',
] as const;

export type DriverIssueCategory = (typeof DRIVER_ISSUE_CATEGORIES)[number];
export type DriverIssueUrgency = (typeof DRIVER_ISSUE_URGENCIES)[number];
export type DriverIssueConcernedParty = (typeof DRIVER_ISSUE_CONCERNED_PARTIES)[number];

interface DriverIssueReportAttributes {
  id: string;
  driver_id: string;
  delivery_id?: string | null;
  category: DriverIssueCategory;
  sub_type: string;
  location: string;
  urgency: DriverIssueUrgency;
  description?: string | null;
  concerned_party?: DriverIssueConcernedParty | null;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

interface DriverIssueReportCreationAttributes
  extends Optional<
    DriverIssueReportAttributes,
    'id' | 'delivery_id' | 'description' | 'concerned_party' | 'created_at' | 'updated_at' | 'deleted_at'
  > {}

export class DriverIssueReport
  extends Model<DriverIssueReportAttributes, DriverIssueReportCreationAttributes>
  implements DriverIssueReportAttributes
{
  public id!: string;
  public driver_id!: string;
  public delivery_id?: string | null;
  public category!: DriverIssueCategory;
  public sub_type!: string;
  public location!: string;
  public urgency!: DriverIssueUrgency;
  public description?: string | null;
  public concerned_party?: DriverIssueConcernedParty | null;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at?: Date | null;
}

DriverIssueReport.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    driver_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    delivery_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'deliveries',
        key: 'id',
      },
    },
    category: {
      type: DataTypes.ENUM(...DRIVER_ISSUE_CATEGORIES),
      allowNull: false,
    },
    sub_type: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    urgency: {
      type: DataTypes.ENUM(...DRIVER_ISSUE_URGENCIES),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    concerned_party: {
      type: DataTypes.ENUM(...DRIVER_ISSUE_CONCERNED_PARTIES),
      allowNull: true,
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
    modelName: 'DriverIssueReport',
    tableName: 'driver_issue_reports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    indexes: [
      { fields: ['driver_id'] },
      { fields: ['delivery_id'] },
      { fields: ['category'] },
      { fields: ['urgency'] },
    ],
  },
);

export default DriverIssueReport;
