import axios from "axios";

const baseURL =
  (import.meta as any).env?.VITE_ML_API_URL?.toString() || "http://localhost:8000";

const mlApi = axios.create({
  baseURL,
});

export default mlApi;

