import axios from "axios";

// Use relative URL so the same origin is used (Nginx or Vite proxy forwards /api to backend).
// This fixes the reservation form on the live site where cross-origin requests were failing.
const defaultBaseURL = "/api/v1";

export default (url = defaultBaseURL) => {
  return axios.create({
    baseURL: url,
  });
};
