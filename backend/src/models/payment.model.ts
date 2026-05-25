import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IPayment, PaymentStatus } from '../types/order.types';
import Notification from './notification.model';
import Order from './order.model';
// import Order from './Order.model';
// import User from './User.model';

interface PaymentCreationAttributes extends Optional<IPayment, 'id' | 'created_at' | 'updated_at'> {}

export class Payment extends Model<IPayment, PaymentCreationAttributes> implements IPayment {
  public id!: string;
  public order_id!: string;
  public payment_method!: 'mobile_banking' | 'chapa' | 'credit' | 'cod';
  public total_amount!: number;
  public amount_paid!: number;
  public payment_status!: PaymentStatus; 
  public chapa_transaction_id?: string;
  public chapa_payment_url?: string;
  public proof_document_id?: string;
  public refund_amount?: number;
  public refund_reason?: string;
  public refund_date?: Date;
  public refunded_by?: string;
  public payment_date?: Date;
  public notes?: string;
  public seller_net_amount?: number;
  public platform_fee_amount?: number;
  public settlement_status!: 'none' | 'pending' | 'released' | 'reversed';
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
      type: DataTypes.ENUM('mobile_banking', 'chapa', 'credit', 'cod'),
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
      type: DataTypes.ENUM('pending',  'completed', 'failed', 'refunded'), // ✅ Use ENUM
      defaultValue: 'pending',
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
    seller_net_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    platform_fee_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    settlement_status: {
      type: DataTypes.ENUM('none', 'pending', 'released', 'reversed'),
      allowNull: false,
      defaultValue: 'none',
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
              // Auto-close delivered orders once payment completes
              try {
                if ((order as any).order_status === 'delivered') {
                  await (order as any).update({ order_status: 'closed' });
                }
              } catch (err) {
                console.error('Payment hook order close error', err);
              }

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

              // Escrow: credit supplier pending balance when buyer payment completes
              try {
                const walletModule = await import('../services/wallet/seller-wallet.service');
                await (walletModule.default as any).settleOrderFunds(payment.order_id);
              } catch (walletErr) {
                console.error('Payment hook wallet settlement error', walletErr);
              }
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
