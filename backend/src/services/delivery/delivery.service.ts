import { Op } from 'sequelize';
import Delivery from '../../models/delivery.model';
import Order from '../../models/order.model';
import Driver from '../../models/driver.model';
import User from '../../models/user.model';
import OrderItems from '../../models/order-item.model';
import Product from '../../models/product.model';
import Address from '../../models/address.model';
import { AppError } from '../../utils/errors';

class DeliveryService {
  private validateStatusTransition(current: string, next: string) {
    const transitions: Record<string, string[]> = {
      pending: ['assigned', 'cancelled'],
      assigned: ['picked_up', 'cancelled'],
      picked_up: ['delivered', 'failed', 'cancelled'],
      delivered: [],
      failed: [],
      cancelled: [],
    };

    const allowed = transitions[current] || [];
    if (!allowed.includes(next)) {
      throw new AppError(`Cannot transition delivery from ${current} to ${next}`, 400);
    }
  }

  private isBlankLocation(value: any) {
    const raw = String(value || '').trim().toLowerCase();
    return !raw || raw === 'not provided' || raw === 'n/a';
  }

  private async resolveOrderPickupLocation(orderId: string) {
    const order = await Order.findByPk(orderId, {
      attributes: ['id', 'supplier_id'],
    });
    if (!order) return '';

    const address = await Address.findOne({
      where: { user_id: (order as any).supplier_id } as any,
      order: [['created_at', 'DESC']],
      attributes: ['city', 'subcity', 'common_name'],
    });

    const city = String((address as any)?.city || '').trim();
    const subcity = String((address as any)?.subcity || '').trim();
    const commonName = String((address as any)?.common_name || '').trim();
    const addressPickup = [commonName, subcity, city]
      .filter(Boolean)
      .filter((value, index, all) => all.findIndex((v) => v.toLowerCase() === value.toLowerCase()) === index)
      .join(', ');

    // Prefer explicit product pickup location if available (orders are per supplier),
    // but never fallback to supplier name (we want geographic pickup, not identity).
    try {
      const sampleItem = await OrderItems.findOne({
        where: { order_id: orderId } as any,
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['pickup_location'],
            required: false,
          } as any,
        ],
      });

      const productPickupRaw = String(
        (sampleItem as any)?.product?.pickup_location || '',
      ).trim();

      if (!this.isBlankLocation(productPickupRaw)) {
        // Avoid showing supplier/business names as pickup locations.
        const supplier = await User.findByPk((order as any).supplier_id, {
          attributes: ['business_name', 'full_name'],
        });
        const businessName = String((supplier as any)?.business_name || '').trim();
        const fullName = String((supplier as any)?.full_name || '').trim();
        const isSupplierName =
          (businessName &&
            productPickupRaw.toLowerCase() === businessName.toLowerCase()) ||
          (fullName && productPickupRaw.toLowerCase() === fullName.toLowerCase());

        if (isSupplierName) return addressPickup || '';
        return productPickupRaw;
      }
    } catch {
      // ignore lookup failures; fallback to address pickup
    }

    return addressPickup || '';
  }

  async getSupplierDeliveries(
    supplierId: string,
    params?: { limit?: number },
  ) {
    const limit = params?.limit && params.limit > 0 ? params.limit : undefined;

    const deliveries = await Delivery.findAll({
      include: [
        {
          model: Order,
          as: 'order',
          required: true,
          where: { supplier_id: supplierId } as any,
          attributes: [
            'id',
            'buyer_id',
            'supplier_id',
            'total_price',
            'order_status',
            'created_at',
            'updated_at',
          ],
          include: [
            {
              model: User,
              as: 'buyer',
              attributes: ['id', 'full_name', 'business_name', 'phone', 'email'],
              include: [
                {
                  model: Address,
                  as: 'addresses',
                  attributes: ['id', 'city', 'subcity', 'common_name', 'latitude', 'longitude', 'created_at'],
                  required: false,
                },
              ],
            },
            {
              model: User,
              as: 'supplier',
              attributes: ['id', 'full_name', 'business_name', 'phone', 'email'],
              include: [
                {
                  model: Address,
                  as: 'addresses',
                  attributes: ['id', 'city', 'subcity', 'common_name', 'latitude', 'longitude', 'created_at'],
                  required: false,
                },
              ],
            },
            {
              model: OrderItems,
              as: 'items',
              attributes: ['id', 'product_id', 'quantity', 'unit_price'],
              include: [
                {
                  model: Product,
                  as: 'product',
                  attributes: ['id', 'name', 'unit_type', 'category'],
                },
              ],
            },
          ],
        },
        {
          model: Driver,
          as: 'driver',
          attributes: ['id', 'driver_id', 'vehicle_type', 'license_plate', 'driver_type'],
          include: [
            {
              model: User,
              as: 'driverUser',
              attributes: ['id', 'full_name', 'phone', 'email'],
            },
          ],
        },
      ],
      order: [['updated_at', 'DESC']],
      ...(limit ? { limit } : {}),
    });

    return deliveries;
  }

  async getDeliveryById(deliveryId: string, supplierId?: string) {
    const delivery = await Delivery.findByPk(deliveryId, {
      include: [
        {
          model: Order,
          as: 'order',
          attributes: [
            'id',
            'buyer_id',
            'supplier_id',
            'total_price',
            'order_status',
            'created_at',
            'updated_at',
          ],
          include: [
            {
              model: User,
              as: 'buyer',
              attributes: ['id', 'full_name', 'business_name', 'phone', 'email'],
            },
            {
              model: User,
              as: 'supplier',
              attributes: ['id', 'full_name', 'business_name', 'phone', 'email'],
            },
            {
              model: OrderItems,
              as: 'items',
              attributes: ['id', 'product_id', 'quantity', 'unit_price'],
              include: [
                {
                  model: Product,
                  as: 'product',
                  attributes: ['id', 'name', 'unit_type', 'category'],
                },
              ],
            },
          ],
        },
        {
          model: Driver,
          as: 'driver',
          attributes: ['id', 'driver_id', 'vehicle_type', 'license_plate', 'driver_type'],
          include: [
            {
              model: User,
              as: 'driverUser',
              attributes: ['id', 'full_name', 'phone', 'email'],
            },
          ],
        },
      ],
    });

    if (!delivery) {
      return null;
    }

    if (supplierId) {
      const order = (delivery as any).order;
      if (!order || order.supplier_id !== supplierId) {
        throw new AppError('You can only access deliveries for your orders', 403);
      }
    }

    return delivery;
  }

  async getDriverDeliveries(driverUserId: string) {
    const driverRecord = await Driver.findOne({
      where: { driver_id: driverUserId, active: true },
      attributes: ['id'],
    });

    if (!driverRecord) {
      return [];
    }

    const deliveries = await Delivery.findAll({
      where: {
        driver_id: driverRecord.id as any,
      },
      include: [
        {
          model: Order,
          as: 'order',
          attributes: [
            'id',
            'buyer_id',
            'supplier_id',
            'total_price',
            'order_status',
            'created_at',
            'updated_at',
          ],
          include: [
            {
              model: User,
              as: 'buyer',
              attributes: [
                'id',
                'full_name',
                'business_name',
                'phone',
                'email',
              ],
              include: [
                {
                  model: Address,
                  as: 'addresses',
                  attributes: ['id', 'city', 'subcity', 'common_name', 'latitude', 'longitude', 'created_at'],
                  required: false,
                },
              ],
            },
            {
              model: User,
              as: 'supplier',
              attributes: [
                'id',
                'full_name',
                'business_name',
                'phone',
                'email',
              ],
              include: [
                {
                  model: Address,
                  as: 'addresses',
                  attributes: ['id', 'city', 'subcity', 'common_name', 'latitude', 'longitude', 'created_at'],
                  required: false,
                },
              ],
            },
            {
              model: OrderItems,
              as: 'items',
              attributes: ['id', 'product_id', 'quantity', 'unit_price'],
              include: [
                {
                  model: Product,
                  as: 'product',
                  attributes: ['id', 'name', 'unit_type', 'category'],
                },
              ],
            },
          ],
        },
        {
          model: Driver,
          as: 'driver',
          attributes: ['id', 'driver_id', 'vehicle_type', 'license_plate', 'driver_type'],
          include: [
            {
              model: User,
              as: 'driverUser',
              attributes: ['id', 'full_name', 'phone', 'email'],
            },
          ],
        },
      ],
      order: [['updated_at', 'DESC']],
    });

    return deliveries;
  }

  async createDelivery(orderId: string, pickup: string, dropoff: string) {
    const pickupValue = this.isBlankLocation(pickup)
      ? await this.resolveOrderPickupLocation(orderId)
      : String(pickup || '').trim();

    const dropoffValue = String(dropoff || '').trim();
    const existing = await Delivery.findOne({
      where: { order_id: orderId } as any,
    });

    if (existing) {
      let changed = false;

      if (
        pickupValue &&
        (this.isBlankLocation(existing.pickup_location) ||
          existing.pickup_location !== pickupValue)
      ) {
        existing.pickup_location = pickupValue as any;
        changed = true;
      }

      if (dropoffValue && existing.dropoff_location !== dropoffValue) {
        existing.dropoff_location = dropoffValue as any;
        changed = true;
      }

      if (changed) {
        await existing.save();
      }

      return existing;
    }

    const delivery = await Delivery.create({
      order_id: orderId,
      pickup_location: pickupValue,
      dropoff_location: dropoffValue,
      status: 'pending'
    } as any);
    return delivery;
  }

  async updateDeliveryStatus(
    deliveryId: string,
    status: string,
    actingUserId?: string,
    actingUserRole?: string,
  ) {
    const allowedStatuses = [
      'pending',
      'assigned',
      'picked_up',
      'delivered',
      'failed',
      'cancelled',
    ];

    if (!allowedStatuses.includes(status)) {
      throw new AppError('Invalid delivery status', 400);
    }

    const delivery = await Delivery.findByPk(deliveryId);
    if (!delivery) return null;

    const current = String(delivery.status || 'pending');
    this.validateStatusTransition(current, status);

    // Only drivers can move deliveries forward (accept/pickup/transit/deliver).
    // Non-driver actors may only cancel deliveries they are involved in (buyer/supplier/admin).
    if (actingUserRole !== 'driver') {
      if (status !== 'cancelled') {
        throw new AppError('Only the assigned driver can update delivery status', 403);
      }

      const order = await Order.findByPk(delivery.order_id, {
        attributes: ['id', 'buyer_id', 'supplier_id'],
      });
      if (!order) {
        throw new AppError('Order not found for delivery', 404);
      }

      const allowedCanceller =
        actingUserRole === 'admin' ||
        (actingUserId && (order.buyer_id === actingUserId || order.supplier_id === actingUserId));

      if (!allowedCanceller) {
        throw new AppError('You cannot cancel this delivery', 403);
      }
    } else {
      const driverRecord = await Driver.findOne({
        where: { driver_id: actingUserId, active: true },
        attributes: ['id'],
      });

      if (!driverRecord || delivery.driver_id !== (driverRecord.id as any)) {
        throw new AppError('You can only update your assigned deliveries', 403);
      }
    }

    delivery.status = status as any;
    if (status === 'picked_up') delivery.started_at = new Date() as any;
    if (status === 'delivered') delivery.completed_at = new Date() as any;
    await delivery.save();
    return delivery;
  }

  async assignDriver(deliveryId: string, supplierId: string, driverId: string) {
    const delivery = await Delivery.findByPk(deliveryId);
    if (!delivery) {
      throw new AppError('Delivery not found', 404);
    }

    const order = await Order.findByPk(delivery.order_id);
    if (!order) {
      throw new AppError('Order not found for delivery', 404);
    }
    if (order.supplier_id !== supplierId) {
      throw new AppError('You can only assign drivers for your orders', 403);
    }

    const driver = await Driver.findByPk(driverId);
    if (!driver || driver.supplier_id !== supplierId) {
      throw new AppError('Driver not found for this supplier', 404);
    }
    if (driver.active === false) {
      throw new AppError('Driver is inactive', 400);
    }

    delivery.driver_id = driverId as any;
    await delivery.save();
    return delivery;
  }

  async assignDriverForBuyer(params: {
    orderId: string;
    buyerId: string;
    driverRecordId: string;
    pickup_location?: string;
    dropoff_location: string;
  }) {
    const order = await Order.findByPk(params.orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    if (order.buyer_id !== params.buyerId) {
      throw new AppError('You can only request drivers for your orders', 403);
    }

    const dropoff = String(params.dropoff_location || '').trim();
    if (!dropoff) {
      throw new AppError('dropoff_location is required', 400);
    }

    const driver = await Driver.findByPk(params.driverRecordId);
    if (!driver) {
      throw new AppError('Driver not found', 404);
    }
    if (driver.active === false) {
      throw new AppError('Driver is inactive', 400);
    }

    let delivery = await Delivery.findOne({
      where: { order_id: params.orderId, deleted_at: null } as any,
    });

    if (!delivery) {
      delivery = await this.createDelivery(
        params.orderId,
        '',
        dropoff,
      );
    } else {
      if (this.isBlankLocation(delivery.pickup_location)) {
        delivery.pickup_location = await this.resolveOrderPickupLocation(params.orderId);
      }
      delivery.dropoff_location = dropoff;
    }

    delivery.driver_id = params.driverRecordId as any;
    await delivery.save();

    return delivery;
  }

  async listMarketplaceDrivers(search?: string) {
    const term = String(search || '').trim();

    const where: any = {
      deleted_at: null,
      active: true,
    };

    if (term) {
      where[Op.or] = [
        { license_plate: { [Op.like]: `%${term}%` } },
        { vehicle_type: { [Op.like]: `%${term}%` } },
      ];
    }

    const driverUserInclude: any = {
      model: User,
      as: 'driverUser',
      attributes: ['id', 'full_name', 'email', 'phone'],
      required: false,
    };

    if (term) {
      driverUserInclude.where = {
        [Op.or]: [
          { full_name: { [Op.like]: `%${term}%` } },
          { email: { [Op.like]: `%${term}%` } },
          { phone: { [Op.like]: `%${term}%` } },
        ],
      };
      driverUserInclude.required = true;
    }

    const rows = await Driver.findAll({
      where,
      include: [
        driverUserInclude,
        {
          model: User,
          as: 'supplier',
          attributes: ['id', 'full_name', 'business_name', 'phone'],
          required: false,
        },
      ],
      order: [['updated_at', 'DESC']],
      limit: 50,
    });

    return (rows as any[]).map((r) => (typeof r.get === 'function' ? r.get({ plain: true }) : r));
  }

}

export default new DeliveryService();
