import api from './api';

class DeliveryService {
  private readonly BASE = '/deliveries';

  async getMyDeliveries() {
    const response = await api.get(`${this.BASE}/my-deliveries`);
    return response.data;
  }

  async getSupplierDeliveries() {
    const response = await api.get(`${this.BASE}/supplier-deliveries`);
    return response.data;
  }

  async getAll(params?: any) {
    const response = await api.get(this.BASE, { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await api.get(`${this.BASE}/${id}`);
    return response.data;
  }

  async create(data: any) {
    const response = await api.post(this.BASE, data);
    return response.data;
  }

  async update(id: string, data: any) {
    const response = await api.put(`${this.BASE}/${id}`, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await api.delete(`${this.BASE}/${id}`);
    return response.data;
  }

  async assignDriver(deliveryId: string, driverId: string) {
    const response = await api.patch(`${this.BASE}/${deliveryId}/assign-driver`, { driver_id: driverId });
    return response.data;
  }

  async getAvailableDrivers(search?: string) {
    const params = search ? { search: search.trim() } : {};
    const response = await api.get(`${this.BASE}/available-drivers`, { params });
    return response.data;
  }

  async assignDriverForBuyer(orderId: string, payload: { driver_id: string; pickup_location?: string; dropoff_location: string }) {
    const response = await api.post(`${this.BASE}/order/${orderId}/assign-driver`, payload);
    return response.data;
  }

  async updateStatus(deliveryId: string, status: string) {
    const response = await api.patch(`${this.BASE}/${deliveryId}/status`, { status });
    return response.data;
  }
}

export default new DeliveryService();
