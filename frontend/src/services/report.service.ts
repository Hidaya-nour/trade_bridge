import api from "./api";
import type { CreateReportPayload } from "@/types/report.types";

class ReportService {
  async create(payload: CreateReportPayload) {
    const response = await api.post("/reports", payload);
    return response.data;
  }

  async getAdminSummary() {
    const response = await api.get("/reports/admin/summary");
    return response.data;
  }

  async getAdminReportsForUser(userId: string, params?: { page?: number; limit?: number }) {
    const response = await api.get(`/reports/admin/user/${userId}`, { params });
    return response.data;
  }
}

export const reportService = new ReportService();
