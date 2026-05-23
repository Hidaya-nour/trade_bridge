import api from "@/lib/api";

export interface RetailerAddress {
  id: string;
  common_name?: string | null;
  subcity?: string | null;
  city?: string | null;
  region?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

class AddressService {
  async getAll() {
    return api.get("/addresses");
  }
}

export default new AddressService();
