import api from './api';

export interface InventoryForecastPoint {
  date: string;
  forecast_quantity: number;
}

export interface ForecastResponse {
  source: string;
  forecast: InventoryForecastPoint[];
}

class ForecastService {
  async getInventoryForecast(productId: string, days: number = 7): Promise<ForecastResponse> {
    const response = await api.get(`/forecast/inventory/${productId}?days=${days}`);
    return response.data.data;
  }
}

export default new ForecastService();
