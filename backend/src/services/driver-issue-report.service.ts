import Delivery from '../models/delivery.model';
import Driver from '../models/driver.model';
import DriverIssueReport, {
  DRIVER_ISSUE_CATEGORIES,
  DRIVER_ISSUE_CONCERNED_PARTIES,
  DRIVER_ISSUE_URGENCIES,
} from '../models/driver-issue-report.model';
import { AppError } from '../utils/errors';
import Order from '../models/order.model';
import User from '../models/user.model';
import { Op } from 'sequelize';
import notificationService from './notification/notification.service';

type CreateDriverIssueReportInput = {
  delivery_id?: string;
  category?: string;
  sub_type?: string;
  location?: string;
  urgency?: string;
  description?: string;
  concerned_party?: string;
};

class DriverIssueReportService {
  async listDriverReports(driverUserId: string, limit = 10) {
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 10;

    return DriverIssueReport.findAll({
      where: { driver_id: driverUserId } as any,
      order: [['created_at', 'DESC']],
      limit: safeLimit,
    });
  }

  async createDriverReport(driverUserId: string, payload: CreateDriverIssueReportInput) {
    const category = payload.category?.trim();
    const subType = payload.sub_type?.trim();
    const location = payload.location?.trim();
    const urgency = payload.urgency?.trim();
    const description = payload.description?.trim();
    const concernedParty = payload.concerned_party?.trim();
    const deliveryId = payload.delivery_id?.trim();

    if (!category || !subType || !location || !urgency) {
      throw new AppError('Category, sub-type, location, and urgency are required', 400);
    }

    if (!DRIVER_ISSUE_CATEGORIES.includes(category as any)) {
      throw new AppError('Invalid issue category', 400);
    }

    if (!DRIVER_ISSUE_URGENCIES.includes(urgency as any)) {
      throw new AppError('Invalid urgency level', 400);
    }

    if (
      concernedParty &&
      !DRIVER_ISSUE_CONCERNED_PARTIES.includes(concernedParty as any)
    ) {
      throw new AppError('Invalid concerned party', 400);
    }

    if (deliveryId) {
      const driverRecord = await Driver.findOne({
        where: { driver_id: driverUserId, active: true },
        attributes: ['id'],
      });

      if (!driverRecord) {
        throw new AppError('Driver record not found', 404);
      }

      const delivery = await Delivery.findByPk(deliveryId, {
        attributes: ['id', 'driver_id'],
      });

      if (!delivery) {
        throw new AppError('Delivery not found', 404);
      }

      if (delivery.driver_id !== (driverRecord.id as any)) {
        throw new AppError('You can only report issues for your assigned deliveries', 403);
      }
    }

    const created = await DriverIssueReport.create({
      driver_id: driverUserId,
      delivery_id: deliveryId || null,
      category: category as any,
      sub_type: subType,
      location,
      urgency: urgency as any,
      description: description || null,
      concerned_party: concernedParty ? (concernedParty as any) : null,
    } as any);

    if (deliveryId) {
      try {
        const delivery = await Delivery.findByPk(deliveryId, {
          attributes: ['id', 'order_id'],
          include: [
            {
              model: Order,
              as: 'order',
              attributes: ['id', 'buyer_id', 'supplier_id'],
              include: [
                {
                  model: User,
                  as: 'buyer',
                  attributes: ['id', 'full_name', 'business_name'],
                  required: false,
                },
                {
                  model: User,
                  as: 'supplier',
                  attributes: ['id', 'full_name', 'business_name'],
                  required: false,
                },
              ],
            },
            {
              model: Driver,
              as: 'driver',
              attributes: ['id', 'supplier_id', 'driver_id'],
              required: false,
            },
          ],
        });

        const order = (delivery as any)?.order;
        if (order) {
          const buyerId = String(order.buyer_id || '').trim();
          const supplierId = String(order.supplier_id || '').trim();
          const linkedSupplierId = String((delivery as any)?.driver?.supplier_id || '').trim();

          const recipients = new Set<string>();
          if (buyerId) recipients.add(buyerId);
          if (supplierId) recipients.add(supplierId);
          if (linkedSupplierId) recipients.add(linkedSupplierId);

          const title = 'Driver Issue Reported';
          const message = `A driver reported an issue for order ${order.id}.`;

          await Promise.all(
            Array.from(recipients).map((userId) =>
              notificationService.createNotification({
                user_id: userId,
                type: 'driver_issue',
                title,
                message,
              } as any),
            ),
          );
        }
      } catch (notifyError) {
        console.error('Failed to create driver issue notifications', notifyError);
      }
    }

    return created;
  }

  async listReportsForOrder(
    requesterId: string,
    requesterRole: string,
    orderId: string,
  ) {
    const order = await Order.findByPk(orderId, {
      attributes: ['id', 'buyer_id', 'supplier_id'],
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const isAdmin = requesterRole === 'admin';
    const isBuyer = String(order.buyer_id) === requesterId;
    const isSupplier = String(order.supplier_id) === requesterId;

    if (!isAdmin && !isBuyer && !isSupplier) {
      if (requesterRole === 'driver') {
        const driverRecord = await Driver.findOne({
          where: { driver_id: requesterId, active: true },
          attributes: ['id'],
        });

        if (!driverRecord) {
          throw new AppError('Not authorized to view these reports', 403);
        }

        const assigned = await Delivery.findOne({
          where: { order_id: orderId, driver_id: driverRecord.id as any },
          attributes: ['id'],
        });

        if (!assigned) {
          throw new AppError('Not authorized to view these reports', 403);
        }
      } else {
        throw new AppError('Not authorized to view these reports', 403);
      }
    }

    const deliveries = await Delivery.findAll({
      where: { order_id: orderId } as any,
      attributes: ['id'],
    });

    const deliveryIds = deliveries.map((d) => d.id);
    if (deliveryIds.length === 0) {
      return [];
    }

    return DriverIssueReport.findAll({
      where: { delivery_id: { [Op.in]: deliveryIds } } as any,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'driverUser',
          attributes: ['id', 'full_name', 'business_name', 'phone', 'email'],
          required: false,
        },
      ],
    });
  }
}

export default new DriverIssueReportService();
