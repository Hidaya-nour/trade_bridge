import Delivery from '../models/delivery.model';
import Driver from '../models/driver.model';
import DriverIssueReport, {
  DRIVER_ISSUE_CATEGORIES,
  DRIVER_ISSUE_CONCERNED_PARTIES,
  DRIVER_ISSUE_URGENCIES,
} from '../models/driver-issue-report.model';
import { AppError } from '../utils/errors';

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

    return DriverIssueReport.create({
      driver_id: driverUserId,
      delivery_id: deliveryId || null,
      category: category as any,
      sub_type: subType,
      location,
      urgency: urgency as any,
      description: description || null,
      concerned_party: concernedParty ? (concernedParty as any) : null,
    } as any);
  }
}

export default new DriverIssueReportService();
