import axios from "axios";

export default (url = "http://212.73.150.149:5000/api/v1") => {
  return axios.create({
    baseURL: url,
  });
};
