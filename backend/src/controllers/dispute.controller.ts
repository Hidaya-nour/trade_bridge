import { Request, Response } from 'express';
import Dispute from '../models/dispute.model';
import Notification from '../models/notification.model';
import Order from '../models/order.model';
import User from '../models/user.model';
import { Op } from 'sequelize';
import logger from '../utils/logger';

const mapDispute = (dispute: any) => {
  const raisedBy = dispute.raisedByUser ?? dispute.raised_by ?? null;
  const against = dispute.againstUser ?? dispute.against ?? null;
  const resolvedBy = dispute.resolvedByUser ?? null;
  const order = dispute.order ?? null;

  return {
    id: dispute.id,
    order_id: dispute.order_id,
    order_total: order?.total_price ?? 0,
    description: dispute.description,
    reason: 'other',
    amount: Number(order?.total_price ?? 0),
    status: dispute.status,
    resolution: null,
    resolved_at: dispute.resolved_at || null,
    created_at: dispute.created_at,
    updated_at: dispute.created_at,
    raised_by: raisedBy
      ? {
          id: raisedBy.id,
          full_name: raisedBy.full_name,
          business_name: raisedBy.business_name,
          role: raisedBy.role,
          email: raisedBy.email,
        }
      : null,
    against: against
      ? {
          id: against.id,
          full_name: against.full_name,
          business_name: against.business_name,
          role: against.role,
          email: against.email,
        }
      : null,
    resolved_by: resolvedBy
      ? {
          id: resolvedBy.id,
          full_name: resolvedBy.full_name,
          business_name: resolvedBy.business_name,
          role: resolvedBy.role,
        }
      : null,
    order: order
      ? {
          id: order.id,
          total_price: order.total_price,
          order_status: order.order_status,
          created_at: order.created_at,
        }
      : null,
  };
};

const disputeInclude = [
  {
    model: Order,
    as: 'order',
    attributes: ['id', 'total_price', 'order_status', 'created_at'],
    required: false,
  },
  {
    model: User,
    as: 'raisedByUser',
    attributes: ['id', 'full_name', 'business_name', 'role', 'email'],
    required: false,
  },
  {
    model: User,
    as: 'againstUser',
    attributes: ['id', 'full_name', 'business_name', 'role', 'email'],
    required: false,
  },
  {
    model: User,
    as: 'resolvedByUser',
    attributes: ['id', 'full_name', 'business_name', 'role'],
    required: false,
  },
] as const;

export class DisputeController {
  async createDispute(req: Request, res: Response) {
    try {
      const { order_id, against_user, description } = req.body;
      const raised_by = req.user?.id as string;

      const dispute = await Dispute.create({
        order_id,
        raised_by,
        against_user,
        description,
        status: 'open',
      } as any);

      // Notify the user against whom the dispute was raised
      await Notification.create({ user_id: against_user, type: 'dispute', title: 'Dispute Raised', message: `A dispute has been raised against you for order ${order_id}.`, is_read: 0 } as any);

      // Optionally notify admins (simple approach: notify a system admin channel user id from env)
      const adminId = process.env.SYSTEM_ADMIN_ID;
      if (adminId) {
        await Notification.create({ user_id: adminId, type: 'dispute', title: 'New Dispute', message: `Dispute ${dispute.id} raised for order ${order_id}.`, is_read: 0 } as any);
      }

      const created = await Dispute.findByPk(dispute.id, {
        include: disputeInclude as any,
      });

      res.status(201).json({ success: true, data: { dispute: mapDispute(created ?? dispute) } });
    } catch (err) {
      logger.error('Create dispute error', err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async listDisputes(req: Request, res: Response) {
    try {
      const {
        status,
        search,
        limit = '50',
        offset = '0',
      } = req.query;

      const whereClause: any = {};

      if (status && status !== 'all') {
        whereClause.status = status;
      }

      if (search && String(search).trim()) {
        const term = `%${String(search).trim()}%`;
        whereClause[Op.or] = [
          { id: { [Op.like]: term } },
          { description: { [Op.like]: term } },
        ];
      }

      const disputes = await Dispute.findAll({
        where: whereClause,
        include: disputeInclude as any,
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10),
        order: [['created_at', 'DESC']],
      });

      const total = await Dispute.count({ where: whereClause });

      res.json({
        success: true,
        data: {
          disputes: disputes.map(mapDispute),
          total,
        },
      });
    } catch (err) {
      logger.error('List disputes error', err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async getDisputeById(req: Request, res: Response) {
    try {
      const dispute = await Dispute.findByPk(req.params.id, {
        include: disputeInclude as any,
      });

      if (!dispute) {
        res.status(404).json({ success: false, message: 'Dispute not found' });
        return;
      }

      res.json({ success: true, data: { dispute: mapDispute(dispute) } });
    } catch (err) {
      logger.error('Get dispute error', err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async updateDispute(req: Request, res: Response) {
    try {
      const dispute = await Dispute.findByPk(req.params.id);

      if (!dispute) {
        res.status(404).json({ success: false, message: 'Dispute not found' });
        return;
      }

      const updates: any = {};

      if (typeof req.body.status === 'string') {
        updates.status = req.body.status;
      }

      if (updates.status === 'resolved') {
        updates.resolved_at = new Date();
        updates.resolved_by = req.user?.id || null;
      }

      if (updates.status && updates.status !== 'resolved') {
        updates.resolved_at = null;
        updates.resolved_by = null;
      }

      await dispute.update(updates);

      const updated = await Dispute.findByPk(dispute.id, {
        include: disputeInclude as any,
      });

      res.json({ success: true, data: { dispute: mapDispute(updated ?? dispute) } });
    } catch (err) {
      logger.error('Update dispute error', err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

export default new DisputeController();
