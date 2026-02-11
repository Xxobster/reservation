import API from "./API";

export const getGuesthouseList = () => API().get("/guesthouses");

export const updateGuesthouseList = (list) => API().patch("/guesthouses", { list });
