import api from "@/lib/api";

export type DriverIssueReportPayload = {
  delivery_id?: string;
  category: string;
  sub_type: string;
  location: string;
  urgency: string;
  description?: string;
  concerned_party?: string;
};

const driverIssueService = {
  async getMyReports(limit = 10) {
    const response = await api.get("/driver-issues/mine", {
      params: { limit },
    });

    const rows = Array.isArray(response.data?.data?.reports)
      ? response.data.data.reports
      : [];

    return rows;
  },

  async create(data: DriverIssueReportPayload) {
    const response = await api.post("/driver-issues", data);
    return response.data;
  },
};

export default driverIssueService;
