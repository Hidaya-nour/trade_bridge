import api from "./api";
import type {
  BroadcastListResponse,
  BroadcastResponse,
  CreateBroadcastPayload,
  UpdateBroadcastPayload,
} from "@/types/broadcast.types";

class BroadcastService {
  async getMine(): Promise<BroadcastListResponse> {
    const response = await api.get("/broadcasts");
    return response.data;
  }

  async getById(id: string): Promise<BroadcastResponse> {
    const response = await api.get(`/broadcasts/${id}`);
    return response.data;
  }

  async create(data: CreateBroadcastPayload): Promise<BroadcastResponse> {
    const response = await api.post("/broadcasts", data);
    return response.data;
  }

  async update(id: string, data: UpdateBroadcastPayload): Promise<BroadcastResponse> {
    const response = await api.put(`/broadcasts/${id}`, data);
    return response.data;
  }

  async updateStatus(id: string, status: string): Promise<BroadcastResponse> {
    const response = await api.patch(`/broadcasts/${id}/status`, { status });
    return response.data;
  }

  async delete(id: string) {
    const response = await api.delete(`/broadcasts/${id}`);
    return response.data;
  }
}

export default new BroadcastService();
