import { Request, Response } from 'express';
import { fn, col, literal, Op } from 'sequelize';
import { AppError } from '../utils/errors';
import UserReport from '../models/user-report.model';
import User from '../models/user.model';
import Order from '../models/order.model';
import SuspensionAppeal from '../models/suspension-appeal.model';

let userReportsTableReady: Promise<void> | null = null;
const ensureUserReportsTable = async () => {
  if (!userReportsTableReady) {
    userReportsTableReady = UserReport.sync().then(() => undefined);
  }
  await userReportsTableReady;
};

let suspensionAppealsTableReady: Promise<void> | null = null;
const ensureSuspensionAppealsTable = async () => {
  if (!suspensionAppealsTableReady) {
    suspensionAppealsTableReady = SuspensionAppeal.sync().then(() => undefined);
  }
  await suspensionAppealsTableReady;
};

class ReportController {
  private ensureAuthenticated(req: Request) {
    if (!req.user) throw new AppError('Authentication required', 401);
  }

  private ensureAdmin(req: Request) {
    this.ensureAuthenticated(req);
    if (req.user?.role !== 'admin') {
      throw new AppError('Admin access required', 403);
    }
  }

  async create(req: Request, res: Response): Promise<any> {
    try {
      this.ensureAuthenticated(req);
      await ensureUserReportsTable();
      const reporterId = req.user!.id;
      const { reported_user_id, reason, description, order_id } = req.body || {};

      if (!reported_user_id) {
        return res.status(400).json({ success: false, message: 'reported_user_id is required' });
      }
      if (reported_user_id === reporterId) {
        return res.status(400).json({ success: false, message: 'You cannot report yourself' });
      }

      const normalizedReason = String(reason || '').trim();
      if (!normalizedReason) {
        return res.status(400).json({ success: false, message: 'reason is required' });
      }

      const reportedUser = await User.findByPk(reported_user_id);
      if (!reportedUser) {
        return res.status(404).json({ success: false, message: 'Reported user not found' });
      }

      let safeOrderId: string | null = null;
      if (order_id) {
        const order = await Order.findByPk(order_id);
        safeOrderId = order ? String(order.id) : null;
      }

      const report = await UserReport.create({
        reporter_id: reporterId,
        reported_user_id,
        order_id: safeOrderId,
        reason: normalizedReason,
        description: typeof description === 'string' ? description.trim() || null : null,
        status: 'open',
      } as any);

      return res.status(201).json({ success: true, data: { report } });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }

      // Log DB errors (foreign keys, schema drift, etc.) so we can diagnose production issues.
      console.error('Create report error', error);
      const sqlMessage = (error as any)?.original?.sqlMessage || (error as any)?.parent?.sqlMessage;
      const message =
        process.env.NODE_ENV === 'development' && sqlMessage
          ? `Failed to submit report: ${sqlMessage}`
          : 'Failed to submit report';
      return res.status(500).json({ success: false, message });
    }
  }

  async adminSummary(req: Request, res: Response): Promise<any> {
    try {
      this.ensureAdmin(req);
      await ensureUserReportsTable();
      await ensureSuspensionAppealsTable();

      const reportRows = (await UserReport.findAll({
        attributes: [
          'reported_user_id',
          [fn('COUNT', col('id')), 'total_reports'],
          [fn('SUM', literal("CASE WHEN status = 'open' THEN 1 ELSE 0 END")), 'open_reports'],
          [fn('MAX', col('created_at')), 'last_reported_at'],
        ],
        group: ['reported_user_id'],
        order: [[literal('total_reports'), 'DESC']],
        raw: true,
      })) as Array<any>;

      const latestOpenAppeals = (await SuspensionAppeal.findAll({
        where: { status: 'open' } as any,
        attributes: ['id', 'user_id', 'message', 'created_at'],
        order: [['created_at', 'DESC']],
        raw: true,
      })) as Array<any>;

      const latestAppealByUser = new Map<string, any>();
      for (const appeal of latestOpenAppeals) {
        const userId = String(appeal.user_id || '');
        if (!userId) continue;
        if (!latestAppealByUser.has(userId)) {
          latestAppealByUser.set(userId, appeal);
        }
      }

      const reportUserIds = reportRows.map((r) => r.reported_user_id).filter(Boolean);
      const appealUserIds = Array.from(latestAppealByUser.keys());
      const userIds = Array.from(new Set([...reportUserIds, ...appealUserIds]));
      const users = await User.findAll({
        where: { id: { [Op.in]: userIds } },
        attributes: ['id', 'full_name', 'email', 'business_name', 'role', 'status', 'verified', 'created_at'],
      });
      const userMap = new Map<string, any>(users.map((u: any) => [u.id, u]));

      const summaryBase = reportRows.map((row) => ({
        reported_user_id: row.reported_user_id,
        total_reports: Number(row.total_reports || 0),
        open_reports: Number(row.open_reports || 0),
        last_reported_at: row.last_reported_at,
        user: userMap.get(row.reported_user_id) || null,
        open_appeal: latestAppealByUser.get(String(row.reported_user_id)) || null,
      }));

      const missingReportRows = appealUserIds
        .filter((userId) => !reportUserIds.includes(userId))
        .map((userId) => ({
          reported_user_id: userId,
          total_reports: 0,
          open_reports: 0,
          last_reported_at: null,
          user: userMap.get(userId) || null,
          open_appeal: latestAppealByUser.get(userId) || null,
        }));

      const summary = [...summaryBase, ...missingReportRows];

      return res.json({ success: true, data: { summary } });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Failed to fetch report summary' });
    }
  }

  async adminReportsForUser(req: Request, res: Response): Promise<any> {
    try {
      this.ensureAdmin(req);
      await ensureUserReportsTable();
      const { userId } = req.params;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Math.min(100, Number(req.query.limit)) : 20;
      const offset = (Math.max(1, page) - 1) * limit;

      const { count, rows } = await UserReport.findAndCountAll({
        where: { reported_user_id: userId },
        order: [['created_at', 'DESC']],
        limit,
        offset,
        include: [
          { model: User, as: 'reporter', attributes: ['id', 'full_name', 'email', 'business_name', 'role'] } as any,
        ],
      });

      return res.json({
        success: true,
        data: {
          reports: rows,
          total: count,
          page,
          totalPages: Math.max(1, Math.ceil(count / limit)),
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Failed to fetch user reports' });
    }
  }
}

export default new ReportController();
