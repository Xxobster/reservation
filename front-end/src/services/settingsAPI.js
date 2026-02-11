import API from "./API";

export const getSettings = () => API().get("/settings");
export const updateSettings = (data) => API().patch("/settings", data);

export const restartBackend = () => API().post("/admin/restart-backend");

export const refreshGuesthousesFromGoogle = () =>
  API().post("/admin/guesthouses/refresh-from-google");
