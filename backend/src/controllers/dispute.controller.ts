import { Request, Response } from 'express';
import Dispute from '../models/dispute.model';
import Notification from '../models/notification.model';
import logger from '../utils/logger';

export class DisputeController {
  async createDispute(req: Request, res: Response) {
    try {
      const { order_id, against_user, description } = req.body;
      const raised_by = req.user?.id as string;

      const dispute = await Dispute.create({ order_id, raised_by, against_user, description, status: 'open' } as any);

      // Notify the user against whom the dispute was raised
      await Notification.create({ user_id: against_user, type: 'dispute', title: 'Dispute Raised', message: `A dispute has been raised against you for order ${order_id}.`, is_read: 0 } as any);

      // Optionally notify admins (simple approach: notify a system admin channel user id from env)
      const adminId = process.env.SYSTEM_ADMIN_ID;
      if (adminId) {
        await Notification.create({ user_id: adminId, type: 'dispute', title: 'New Dispute', message: `Dispute ${dispute.id} raised for order ${order_id}.`, is_read: 0 } as any);
      }

      res.status(201).json({ success: true, data: { dispute } });
    } catch (err) {
      logger.error('Create dispute error', err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

export default new DisputeController();
