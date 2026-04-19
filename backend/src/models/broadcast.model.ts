import { DataTypes, Model, Optional } from 'sequelize';

import sequelize from '../config/database';
import {
  BroadcastDiscountType,
  BroadcastOwnerRole,
  BroadcastPriority,
  BroadcastStatus,
  BroadcastTargetAudience,
  BroadcastType,
  IBroadcast,
} from '../types/broadcast.types';

interface BroadcastCreationAttributes
  extends Optional<
    IBroadcast,
    | 'id'
    | 'summary'
    | 'discount_type'
    | 'discount_value'
    | 'min_order'
    | 'max_discount'
    | 'sent_count'
    | 'viewed_count'
    | 'redeemed_count'
    | 'code'
    | 'target_audience'
    | 'audience_segments'
    | 'created_at'
    | 'updated_at'
  > {}

export class Broadcast
  extends Model<IBroadcast, BroadcastCreationAttributes>
  implements IBroadcast
{
  public id!: string;
  public owner_id!: string;
  public owner_role!: BroadcastOwnerRole;
  public title!: string;
  public description!: string;
  public summary?: string | null;
  public type!: BroadcastType;
  public discount_type?: BroadcastDiscountType | null;
  public discount_value?: number | null;
  public min_order?: number | null;
  public max_discount?: number | null;
  public start_date!: Date;
  public end_date!: Date;
  public status!: BroadcastStatus;
  public created_by!: string;
  public sent_count!: number;
  public viewed_count!: number;
  public redeemed_count!: number;
  public code?: string | null;
  public priority!: BroadcastPriority;
  public target_audience!: BroadcastTargetAudience;
  public audience_segments!: string[];
  public created_at!: Date;
  public updated_at!: Date;
}

Broadcast.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    owner_role: {
      type: DataTypes.ENUM('factory', 'distributor', 'admin'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    summary: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM(
        'discount',
        'bogo',
        'free-shipping',
        'bundle',
        'clearance',
      ),
      allowNull: false,
    },
    discount_type: {
      type: DataTypes.ENUM('percentage', 'fixed'),
      allowNull: true,
    },
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    min_order: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    max_discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'scheduled', 'active', 'expired', 'cancelled'),
      allowNull: false,
      defaultValue: 'draft',
    },
    created_by: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    sent_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    viewed_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    redeemed_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM('high', 'medium', 'low'),
      allowNull: false,
      defaultValue: 'medium',
    },
    target_audience: {
      type: DataTypes.ENUM('all', 'segment', 'specific'),
      allowNull: false,
      defaultValue: 'all',
    },
    audience_segments: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
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
    modelName: 'Broadcast',
    tableName: 'broadcasts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

Broadcast.addHook('beforeSave', (broadcast: Broadcast) => {
  if (broadcast.start_date >= broadcast.end_date) {
    throw new Error('Start date must be before end date');
  }
});

export default Broadcast;
