import api from "./api";

class StockMovementService {
  async getAll(params?: any) {
    const response = await api.get("/stock-movements", { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await api.get(`/stock-movements/${id}`);
    return response.data;
  }

  async getByProduct(productId: string) {
    const response = await api.get(`/stock-movements/product/${productId}`);
    return response.data;
  }

  async create(data: any) {
    const response = await api.post("/stock-movements", data);
    return response.data;
  }
}

export default new StockMovementService();

