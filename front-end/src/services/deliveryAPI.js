import API from "./API";

export const createDelivery = (data) => API().post("/deliveries", data);

export const getDeliveriesByGuesthouse = (params) =>
  API().get("/deliveries/by-guesthouse", { params });

export const deleteDelivery = (id) => API().delete(`/deliveries/${id}`);

export const markDeliveryPaid = (id) => API().patch(`/deliveries/${id}`, { isPaid: true });

export const getDeliveryMenu = () => API().get("/deliveries/menu");

export const putDeliveryMenu = (menu, adminPin) =>
  API().put("/deliveries/menu", { menu, adminPin });
