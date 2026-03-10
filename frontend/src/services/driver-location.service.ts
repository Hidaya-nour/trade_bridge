import api from "./api";

class DriverLocationService {
  async getAll(params?: any) {
    const response = await api.get("/driver-locations", { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await api.get(`/driver-locations/${id}`);
    return response.data;
  }

  async getByOrderId(orderId: string) {
    const response = await api.get(`/driver-locations/order/${orderId}`);
    return response.data;
  }

  async create(data: any) {
    const response = await api.post("/driver-locations", data);
    return response.data;
  }

  async update(id: string, data: any) {
    const response = await api.put(`/driver-locations/${id}`, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await api.delete(`/driver-locations/${id}`);
    return response.data;
  }
}

export default new DriverLocationService();
