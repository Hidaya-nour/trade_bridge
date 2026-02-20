import { DriverLocationRepository } from '../../repositories/driver-location.repository';
import { AppError } from '../../utils/errors';
import { IDriverLocation, CreateDriverLocationDTO, UpdateDriverLocationDTO } from '../../types/driver-location.types';
import logger from '../../utils/logger';

export class DriverLocationService {
  private driverLocationRepo = new DriverLocationRepository();

  async createLocation(data: CreateDriverLocationDTO): Promise<IDriverLocation> {
    if (!data.driver_id || data.latitude === undefined || data.longitude === undefined) {
      throw new AppError('Missing required fields: driver_id, latitude, longitude', 400);
    }

    // Validate latitude and longitude ranges
    if (data.latitude < -90 || data.latitude > 90) {
      throw new AppError('Latitude must be between -90 and 90', 400);
    }
    if (data.longitude < -180 || data.longitude > 180) {
      throw new AppError('Longitude must be between -180 and 180', 400);
    }

    const location = await this.driverLocationRepo.create(data as any);
    logger.info(`Driver location recorded for driver ${data.driver_id}`);
    return location as IDriverLocation;
  }

  async getDriverLocations(driverId: string, limit: number = 50): Promise<IDriverLocation[]> {
    return this.driverLocationRepo.findByDriver(driverId, limit) as Promise<IDriverLocation[]>;
  }

  async getOrderLocations(orderId: string): Promise<IDriverLocation[]> {
    return this.driverLocationRepo.findByOrder(orderId) as Promise<IDriverLocation[]>;
  }

  async getLatestDriverLocation(driverId: string): Promise<IDriverLocation | null> {
    return this.driverLocationRepo.findLatestByDriver(driverId) as Promise<IDriverLocation | null>;
  }

  async getDriverLocationsInTimeRange(
    driverId: string,
    startTime: Date,
    endTime: Date
  ): Promise<IDriverLocation[]> {
    return this.driverLocationRepo.findLocationsInTimeRange(driverId, startTime, endTime) as Promise<IDriverLocation[]>;
  }

  async updateLocation(id: string, data: UpdateDriverLocationDTO): Promise<[number, IDriverLocation[]]> {
    const updated = await this.driverLocationRepo.update(id, data as any);
    logger.info(`Driver location ${id} updated`);
    return updated as [number, IDriverLocation[]];
  }

  async deleteLocation(id: string): Promise<number> {
    const deleted = await this.driverLocationRepo.delete(id);
    logger.info(`Driver location ${id} deleted`);
    return deleted;
  }
}