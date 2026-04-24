import { Request, Response } from 'express';
import driverIssueReportService from '../services/driver-issue-report.service';
import logger from '../utils/logger';
import { AppError } from '../utils/errors';

class DriverIssueReportController {
  async listMine(req: Request, res: Response): Promise<any> {
    try {
      const userId = (req as any).user?.id as string | undefined;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const limit =
        typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : undefined;
      const reports = await driverIssueReportService.listDriverReports(userId, limit);
      return res.json({ success: true, data: { reports } });
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      logger.error('List driver issue reports error', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response): Promise<any> {
    try {
      const userId = (req as any).user?.id as string | undefined;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const report = await driverIssueReportService.createDriverReport(userId, req.body);
      return res.status(201).json({ success: true, data: { report } });
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      logger.error('Create driver issue report error', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async listByOrder(req: Request, res: Response): Promise<any> {
    try {
      const userId = (req as any).user?.id as string | undefined;
      const userRole = (req as any).user?.role as string | undefined;
      if (!userId || !userRole) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { orderId } = req.params as any;
      const reports = await driverIssueReportService.listReportsForOrder(userId, userRole, String(orderId));
      return res.json({ success: true, data: { reports } });
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      logger.error('List driver issue reports by order error', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

export default new DriverIssueReportController();
