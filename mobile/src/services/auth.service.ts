import api from "../lib/api";
import { type LoginPayload } from "../types/auth.types";

export const authService = {
  async login(payload: LoginPayload) {
    const response = await api.post("/auth/login", payload);
    return response.data;
  },
};
