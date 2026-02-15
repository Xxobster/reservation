import API from "./API";

class ReservationAPI {
  getReservations() {
    return API().get("/reservations");
  }
  registerReservation(reservationData) {
    return API().post("/reservations", reservationData);
  }
  editReservation(id, reservationData) {
    return API().patch("/reservations/" + id, reservationData);
  }
  cancelReservation(id) {
    return API().delete("/reservations/" + id);
  }
  sendConfirmationEmail(reservationId) {
    return API().post("/reservations/" + reservationId + "/send-confirmation-email");
  }
  markContacted(reservationId) {
    return API().post("/reservations/" + reservationId + "/mark-contacted", {});
  }
  toggleArrived(reservationId) {
    return API().post("/reservations/" + reservationId + "/toggle-arrived", {});
  }
  chooseTable(id, tableId) {
    return API().post("/reservations/choose-table/" + id, tableId);
  }
  createManualReservation(data) {
    return API().post("/reservations/manual", data);
  }
}

export default new ReservationAPI();
