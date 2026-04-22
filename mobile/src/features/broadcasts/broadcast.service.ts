import api from "@/lib/api";
import { type ApiResponse } from "@/features/auth/auth.types";
import { type BroadcastRecord } from "./broadcast.types";

const broadcastService = {
  async getActive(ownerRoles?: string[]) {
    const params = new URLSearchParams();
    if (ownerRoles?.length) {
      params.append("ownerRoles", ownerRoles.join(","));
    }

    const query = params.toString();
    const response = await api.get<ApiResponse<BroadcastRecord[]>>(
      `/broadcasts/active${query ? `?${query}` : ""}`,
    );
    return response.data;
  },
};

export default broadcastService;
