import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Order from './order.model';
import Notification from './notification.model';
import { IPayment, PaymentStatus } from '../types/order.types';
// import Order from './Order.model';
// import User from './User.model';

interface PaymentCreationAttributes extends Optional<IPayment, 'id' | 'created_at' | 'updated_at'> {}

export class Payment extends Model<IPayment, PaymentCreationAttributes> implements IPayment {
  public id!: string;
  public order_id!: string;
  public payment_method!: 'mobile_banking' | 'chapa';
  public total_amount!: number;
  public amount_paid!: number;
  public payment_status!: PaymentStatus; 
  public cheque_number?: string;
  public cheque_bank?: string;
  public cheque_date?: Date;
  public cheque_status?: string;
  public chapa_transaction_id?: string;
  public chapa_payment_url?: string;
  public proof_document_id?: string;
  public refund_amount?: number;
  public refund_reason?: string;
  public refund_date?: Date;
  public refunded_by?: string;
  public payment_date?: Date;
  public notes?: string;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at?: Date;
}

Payment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'orders',
        key: 'id'
      },
    },
    payment_method: {
      type: DataTypes.ENUM( 'mobile_banking', 'chapa'),
      allowNull: false,
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    amount_paid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded'), // ✅ Use ENUM
      defaultValue: 'pending',
    },
    cheque_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    cheque_bank: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    cheque_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cheque_status: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    chapa_transaction_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    chapa_payment_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    proof_document_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    refund_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    refund_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    refund_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refunded_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
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
    modelName: 'Payment',
    tableName: 'payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    hooks: {
      afterUpdate: async (payment: any) => {
        try {
          if (payment.changed('payment_status') && payment.payment_status === 'completed') {
            const order = await Order.findByPk(payment.order_id);
            if (order) {
              // notify buyer
              await Notification.create({
                user_id: order.buyer_id,
                type: 'payment',
                title: 'Payment Confirmed',
                message: `Payment for order ${order.id} has been confirmed.`,
                is_read: 0
              } as any);

              // notify supplier
              await Notification.create({
                user_id: order.supplier_id,
                type: 'payment',
                title: 'Payment Received',
                message: `Payment for order ${order.id} has been received.`,
                is_read: 0
              } as any);
            }
          }
        } catch (err) {
          // logging omitted to avoid circular import issues
          console.error('Payment hook notification error', err);
        }
      }
    }
  }
);

export default Payment;