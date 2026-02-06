import axios from "axios";

const defaultBaseURL =
  typeof import.meta !== "undefined" && import.meta.env?.PROD
    ? "/api/v1"
    : "http://212.73.150.149:5000/api/v1";

export default (url = defaultBaseURL) => {
  return axios.create({
    baseURL: url,
  });
};
