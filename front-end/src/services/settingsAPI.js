import API from "./API";

export const getSettings = () => API().get("/settings");
export const updateSettings = (data) => API().patch("/settings", data);
