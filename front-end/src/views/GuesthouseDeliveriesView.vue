<script setup>
import { ref, watch } from "vue";
import { getDeliveriesByGuesthouse, deleteDelivery, markDeliveryPaid } from "@/services/deliveryAPI";

const startDate = ref("");
const endDate = ref("");
const loading = ref(false);
const error = ref(null);
const guesthouses = ref([]);

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

function formatTime(d) {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatPrice(price) {
  return (price ?? 0).toLocaleString() + " LAK";
}

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const params = {};
    if (startDate.value) params.startDate = startDate.value;
    if (endDate.value) params.endDate = endDate.value;
    const res = await getDeliveriesByGuesthouse(params);
    guesthouses.value = res.data?.guesthouses ?? [];
  } catch (e) {
    error.value = e.response?.data?.message || "Failed to load deliveries.";
    guesthouses.value = [];
  } finally {
    loading.value = false;
  }
};

watch([startDate, endDate], () => {
  if (startDate.value || endDate.value) fetchData();
  else guesthouses.value = [];
});

const applyFilter = () => fetchData();

const deletingId = ref(null);
const markPaidId = ref(null);

const doDelete = async (row, gh) => {
  if (!confirm("Delete this delivery entry?")) return;
  deletingId.value = row.id;
  try {
    await deleteDelivery(row.id);
    gh.deliveries = gh.deliveries.filter((r) => r.id !== row.id);
    gh.totalFeeLAK -= row.feeGuesthouseLAK || 0;
  } catch (e) {
    error.value = e.response?.data?.message || "Failed to delete.";
  } finally {
    deletingId.value = null;
  }
};

const doMarkPaid = async (row) => {
  markPaidId.value = row.id;
  try {
    await markDeliveryPaid(row.id);
    row.isPaid = true;
  } catch (e) {
    error.value = e.response?.data?.message || "Failed to mark as paid.";
  } finally {
    markPaidId.value = null;
  }
};
</script>

<template>
  <div class="guesthouse-deliveries-page">
    <div class="header">
      <h1 class="title-ananias">Guesthouse delivery bills</h1>
      <p class="subtitle">Per-guesthouse delivery list and fee totals for weekly payments. Filter by date range.</p>
    </div>

    <div class="filter-section">
      <div class="filter-row">
        <div class="field">
          <label for="start-date">From date</label>
          <input id="start-date" v-model="startDate" type="date" class="input" />
        </div>
        <div class="field">
          <label for="end-date">To date</label>
          <input id="end-date" v-model="endDate" type="date" class="input" />
        </div>
        <div class="field field-btn">
          <button type="button" class="apply-btn" :disabled="loading" @click="applyFilter">
            {{ loading ? "Loading…" : "Apply filter" }}
          </button>
        </div>
      </div>
      <p class="hint">Leave both empty and click Apply to load all deliveries. Dates are inclusive.</p>
    </div>

    <div v-if="error" class="error-msg">{{ error }}</div>

    <div v-if="loading && guesthouses.length === 0" class="loading">Loading…</div>

    <div v-else-if="guesthouses.length === 0" class="empty-state">
      <p>No deliveries in this range. Set a date range and click Apply filter.</p>
    </div>

    <div v-else class="guesthouse-cards">
      <section v-for="gh in guesthouses" :key="gh.guesthouse" class="guesthouse-card">
        <h2 class="guesthouse-name">{{ gh.guesthouse }}</h2>
        <div class="table-wrap">
          <table class="deliveries-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Fee (guesthouse)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in gh.deliveries" :key="row.id" :class="{ 'row-paid': row.isPaid }">
                <td>
                  {{ formatDate(row.date) }} <span v-if="formatTime(row.date)" class="time">{{ formatTime(row.date) }}</span>
                  <span v-if="row.isPaid" class="paid-badge">PAID</span>
                </td>
                <td class="fee-cell">{{ formatPrice(row.feeGuesthouseLAK) }}</td>
                <td class="actions-cell">
                  <button
                    type="button"
                    class="btn-action btn-paid"
                    :disabled="row.isPaid || markPaidId === row.id"
                    title="Mark as PAID"
                    @click="doMarkPaid(row)"
                  >
                    {{ markPaidId === row.id ? "…" : (row.isPaid ? "PAID" : "Mark PAID") }}
                  </button>
                  <button
                    type="button"
                    class="btn-action btn-delete"
                    :disabled="deletingId === row.id"
                    title="Delete entry"
                    @click="doDelete(row, gh)"
                  >
                    {{ deletingId === row.id ? "…" : "Delete" }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="total-row">
          <span class="total-label">Total (this period)</span>
          <span class="total-value">{{ formatPrice(gh.totalFeeLAK) }}</span>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.guesthouse-deliveries-page {
  min-height: 100vh;
  background: #000;
  color: #fff;
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}
.header { margin-bottom: 28px; }
.title-ananias { font-family: "Ananias", serif; color: #ffc300; font-size: 1.8rem; margin: 0 0 8px 0; }
.subtitle { color: #888; font-size: 0.95rem; margin: 0; }

.filter-section {
  margin-bottom: 28px;
  padding: 20px;
  background: #0a0a0a;
  border: 1px solid #222;
  border-radius: 10px;
}
.filter-row { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 0.9rem; color: #ccc; }
.input {
  padding: 10px 12px;
  background: #111;
  border: 1px solid #333;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  min-width: 140px;
}
.input:focus { outline: none; border-color: #ffc300; }
.field-btn { justify-content: flex-end; }
.apply-btn {
  padding: 10px 20px;
  background: #ffc300;
  color: #000;
  border: none;
  border-radius: 8px;
  font-family: "Montserrat-Medium";
  cursor: pointer;
}
.apply-btn:hover:not(:disabled) { background: #e6b000; }
.apply-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.hint { color: #666; font-size: 0.85rem; margin: 12px 0 0 0; }

.error-msg { color: #ef4444; margin-bottom: 16px; }
.loading { color: #888; padding: 24px; }
.empty-state { color: #666; padding: 32px; text-align: center; }

.guesthouse-cards { display: flex; flex-direction: column; gap: 28px; }
.guesthouse-card {
  background: #0a0a0a;
  border: 1px solid #222;
  border-radius: 12px;
  padding: 20px;
}
.guesthouse-name {
  font-family: "Montserrat-Bold";
  color: #ffc300;
  font-size: 1.2rem;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #222;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.table-wrap { overflow-x: auto; margin-bottom: 16px; }
.deliveries-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}
.deliveries-table th,
.deliveries-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #222; }
.deliveries-table th { color: #888; font-family: "Montserrat-Medium"; font-weight: 600; }
.deliveries-table td { color: #ddd; }
.deliveries-table .time { color: #888; font-size: 0.9em; margin-left: 4px; }
.fee-cell { color: #ffc300; font-family: "Montserrat-Medium"; }
.actions-cell { white-space: nowrap; }
.btn-action {
  padding: 6px 10px;
  margin-right: 8px;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-family: "Montserrat-Medium";
  cursor: pointer;
}
.btn-action:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-paid { background: #22c55e; color: #fff; }
.btn-paid:hover:not(:disabled) { background: #16a34a; }
.btn-delete { background: #333; color: #fca5a5; }
.btn-delete:hover:not(:disabled) { background: #444; color: #ef4444; }
.row-paid { opacity: 0.75; }
.paid-badge { margin-left: 8px; padding: 2px 8px; background: #22c55e; color: #000; font-size: 0.75rem; font-weight: bold; border-radius: 4px; }
.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 12px 0;
  font-family: "Montserrat-Bold";
  font-size: 1.05rem;
  border-top: 2px solid #333;
}
.total-label { color: #fff; }
.total-value { color: #ffc300; }
</style>
