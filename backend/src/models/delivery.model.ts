import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IDelivery, DeliveryStatus } from '../types/order.types';
import Order from './order.model';
import Notification from './notification.model';

interface DeliveryCreationAttributes
  extends Optional<IDelivery, 'id' | 'driver_id' | 'started_at' | 'completed_at' | 'notes' | 'created_at' | 'updated_at' | 'deleted_at'> {}

export class Delivery
  extends Model<IDelivery, DeliveryCreationAttributes>
  implements IDelivery
{
  public id!: string;
  public order_id!: string;
  public driver_id?: string;
  public pickup_location!: string;
  public dropoff_location!: string;
  public status!: DeliveryStatus;
  public started_at?: Date;
  public completed_at?: Date;
  public notes?: string;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at?: Date;
}

Delivery.init(
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
        key: 'id',
      },
    },

    // IMPORTANT FIX: reference drivers table instead of users
    driver_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'drivers',
        key: 'id',
      },
    },

    pickup_location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    dropoff_location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        'pending',
        'assigned',
        'picked_up',
        'delivered',
        'failed',
        'cancelled'
      ),
      defaultValue: 'pending',
    },

    started_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    completed_at: {
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
    modelName: 'Delivery',
    tableName: 'deliveries',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,

    hooks: {
      afterUpdate: async (delivery: any) => {
        try {
          if (delivery.changed('status')) {
            const status = delivery.status;

            const order = await Order.findByPk(delivery.order_id);
            if (!order) return;

            // Keep order_status in sync with driver-driven delivery status.
            try {
              const currentOrderStatus = String((order as any).order_status || '');
              const isTerminal = ['cancelled', 'closed'].includes(currentOrderStatus);

              if (!isTerminal) {
                if (status === 'picked_up' ) {
                  if (['pending', 'approved', 'processing'].includes(currentOrderStatus)) {
                    await (order as any).update({ order_status: 'shipped' });
                  }
                }

                if (status === 'delivered') {
                  if (['pending', 'approved', 'processing', 'shipped'].includes(currentOrderStatus)) {
                    await (order as any).update({ order_status: 'delivered' });
                  }

                  // Auto-close when delivered & paid
                  const paymentModule: any = await import('./payment.model.js');
                  const PaymentModel = paymentModule.Payment || paymentModule.default;
                  const payment = await PaymentModel.findOne({
                    where: { order_id: (order as any).id },
                  });
                  if (payment?.payment_status === 'completed') {
                    await (order as any).update({ order_status: 'closed' });
                  }
                }
              }

              if (status === 'delivered') {
                try {
                  const walletModule = await import('../services/wallet/seller-wallet.service.js');
                  await (walletModule.default as any).settleOrderFunds((order as any).id);
                } catch (walletErr) {
                  console.error('Delivery hook wallet settlement error', walletErr);
                }
              }
            } catch (err) {
              console.error('Delivery hook order_status sync error', err);
            }

            if (
              status === 'assigned'
            ) {
              await Notification.create({
                user_id: order.buyer_id,
                type: 'delivery',
                title: 'Driver Accepted',
                message: `A driver has accepted delivery for order ${order.id}.`,
                is_read: 0,
              } as any);

              await Notification.create({
                user_id: order.supplier_id,
                type: 'delivery',
                title: 'Driver Accepted',
                message: `A driver has accepted delivery for order ${order.id}.`,
                is_read: 0,
              } as any);
            }

            if (status === 'picked_up' ) {
              await Notification.create({
                user_id: order.buyer_id,
                type: 'delivery',
                title: 'Delivery In Progress',
                message: `Delivery for order ${order.id} is in progress.`,
                is_read: 0,
              } as any);

              await Notification.create({
                user_id: order.supplier_id,
                type: 'delivery',
                title: 'Delivery In Progress',
                message: `Delivery for order ${order.id} is in progress.`,
                is_read: 0,
              } as any);
            }

            if (status === 'delivered') {
              await Notification.create({
                user_id: order.buyer_id,
                type: 'order',
                title: 'Order Delivered',
                message: `Your order ${order.id} has been delivered.`,
                is_read: 0,
              } as any);

              await Notification.create({
                user_id: order.supplier_id,
                type: 'order',
                title: 'Order Completed',
                message: `Order ${order.id} has been marked delivered.`,
                is_read: 0,
              } as any);
            }
          }
        } catch (err) {
          console.error('Delivery hook notification error', err);
        }
      },
    },
  }
);

export default Delivery;
