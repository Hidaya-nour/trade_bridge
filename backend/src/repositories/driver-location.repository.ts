import { BaseRepository } from './base.repository';
import DriverLocation from '../models/driver-location.model';
import { Op } from 'sequelize';

export class DriverLocationRepository extends BaseRepository<DriverLocation> {
  constructor() {
    super(DriverLocation);
  }

  async findByDriver(driverId: string, limit: number = 50): Promise<DriverLocation[]> {
    return this.model.findAll({
      where: { driver_id: driverId },
      order: [['recorded_at', 'DESC']],
      limit
    });
  }

  async findByOrder(orderId: string): Promise<DriverLocation[]> {
    return this.model.findAll({
      where: { order_id: orderId },
      order: [['recorded_at', 'ASC']]
    });
  }

  async findLatestByDriver(driverId: string): Promise<DriverLocation | null> {
    return this.model.findOne({
      where: { driver_id: driverId },
      order: [['recorded_at', 'DESC']]
    });
  }

  async findLocationsInTimeRange(
    driverId: string,
    startTime: Date,
    endTime: Date
  ): Promise<DriverLocation[]> {
    return this.model.findAll({
      where: {
        driver_id: driverId,
        recorded_at: {
          [Op.between]: [startTime, endTime]
        }
      },
      order: [['recorded_at', 'ASC']]
    });
  }
}