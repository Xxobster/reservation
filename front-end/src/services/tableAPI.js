import API from "./API";

class TableAPI {
  registerTable(tableData) {
    return API().post("/tables", tableData);
  }
  getAllTables(date = null, time = null) {
    let url = "/tables";
    const params = [];
    if (date) params.push(`date=${date}`);
    if (time) params.push(`time=${time}`);
    if (params.length > 0) {
      url += "?" + params.join("&");
    }
    return API().get(url);
  }
  freeTable(tableId) {
    return API().delete("/tables/" + tableId);
  }
}

export default new TableAPI();
