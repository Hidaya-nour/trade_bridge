import api from "./api";

export type DriverIssueReportPayload = {
  delivery_id?: string;
  category: string;
  sub_type: string;
  location: string;
  urgency: string;
  description?: string;
  concerned_party?: string;
};

class DriverIssueService {
  private readonly BASE = "/driver-issues";

  async getMyReports(limit = 10) {
    const response = await api.get(`${this.BASE}/mine`, {
      params: { limit },
    });
    return response.data;
  }

  async create(data: DriverIssueReportPayload) {
    const response = await api.post(this.BASE, data);
    return response.data;
  }
}

export default new DriverIssueService();
