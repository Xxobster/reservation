<script setup>
import { ref, onMounted } from "vue";
import ButtonFilled from "@/components/ButtonFilled.vue";
import { getSettings, updateSettings } from "@/services/settingsAPI";

const loading = ref(true);
const saving = ref(false);
const success = ref(false);
const error = ref(null);

const form = ref({
  whatsappGeneral: "",
  whatsappReservations: "",
  whatsappDelivery: "",
  reservationsEnabled: true,
  deliveryEnabled: true,
  pickupEnabled: true,
  deliveryStartTime: "11:00",
  deliveryEndTime: "21:00",
  pickupStartTime: "11:00",
  pickupEndTime: "21:00",
  reservationDurationRacletteMin: 120,
  reservationDurationStandardMin: 60,
});

const load = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await getSettings();
    const d = res.data;
    form.value = {
      whatsappGeneral: d.whatsappGeneral ?? "",
      whatsappReservations: d.whatsappReservations ?? "",
      whatsappDelivery: d.whatsappDelivery ?? "",
      reservationsEnabled: Boolean(d.reservationsEnabled),
      deliveryEnabled: Boolean(d.deliveryEnabled),
      pickupEnabled: Boolean(d.pickupEnabled),
      deliveryStartTime: d.deliveryStartTime ?? "11:00",
      deliveryEndTime: d.deliveryEndTime ?? "21:00",
      pickupStartTime: d.pickupStartTime ?? "11:00",
      pickupEndTime: d.pickupEndTime ?? "21:00",
      reservationDurationRacletteMin: d.reservationDurationRacletteMin ?? 120,
      reservationDurationStandardMin: d.reservationDurationStandardMin ?? 60,
    };
  } catch (e) {
    error.value = e.response?.data?.message || "Failed to load settings.";
  } finally {
    loading.value = false;
  }
};

const save = async () => {
  saving.value = true;
  success.value = false;
  error.value = null;
  try {
    await updateSettings(form.value);
    success.value = true;
  } catch (e) {
    error.value = e.response?.data?.message || "Failed to save settings.";
  } finally {
    saving.value = false;
  }
};

onMounted(load);
</script>

<template>
  <div class="settings-page">
    <div class="header">
      <h1 class="title-ananias">Admin Settings</h1>
      <p class="subtitle">WhatsApp numbers, reservation & delivery toggles, working hours</p>
    </div>

    <div v-if="loading" class="loading">Loading settings…</div>
    <div v-else class="form-wrapper">
      <form @submit.prevent="save">
        <section class="section">
          <h2>WhatsApp numbers</h2>
          <p class="hint">Digits only (e.g. 41793917577). Used for wa.me links.</p>
          <div class="field">
            <label>General contact (main page, footer)</label>
            <input v-model.trim="form.whatsappGeneral" type="text" inputmode="numeric" pattern="[0-9]*" placeholder="41793917577" class="input" />
          </div>
          <div class="field">
            <label>Reservations (contact for large groups)</label>
            <input v-model.trim="form.whatsappReservations" type="text" inputmode="numeric" pattern="[0-9]*" placeholder="41793917577" class="input" />
          </div>
          <div class="field">
            <label>Delivery / Pick-up (order WhatsApp)</label>
            <input v-model.trim="form.whatsappDelivery" type="text" inputmode="numeric" pattern="[0-9]*" placeholder="41793917577" class="input" />
          </div>
        </section>

        <section class="section">
          <h2>Table reservation durations</h2>
          <p class="hint">Time (in minutes) that a table is booked when a customer reserves. Affects availability and displayed end time.</p>
          <div class="time-row">
            <div class="field">
              <label>Raclette (minutes)</label>
              <input v-model.number="form.reservationDurationRacletteMin" type="number" min="15" max="480" step="15" class="input input-number" />
            </div>
            <div class="field">
              <label>Standard (minutes)</label>
              <input v-model.number="form.reservationDurationStandardMin" type="number" min="15" max="480" step="15" class="input input-number" />
            </div>
          </div>
        </section>

        <section class="section">
          <h2>Reservations</h2>
          <div class="toggle-row">
            <span class="toggle-label">Reservations enabled</span>
            <label class="toggle-wrap">
              <input v-model="form.reservationsEnabled" type="checkbox" class="toggle-input" />
              <span class="toggle-slider"></span>
            </label>
          </div>
          <p class="hint">When OFF, the reservation page shows: &quot;No Reservation possible at the moment&quot;</p>
        </section>

        <section class="section">
          <h2>Delivery</h2>
          <div class="toggle-row">
            <span class="toggle-label">Delivery enabled</span>
            <label class="toggle-wrap">
              <input v-model="form.deliveryEnabled" type="checkbox" class="toggle-input" />
              <span class="toggle-slider"></span>
            </label>
          </div>
          <p class="hint">When OFF, delivery tab shows &quot;No Delivery possible at the moment&quot; and basket is disabled.</p>
          <div class="time-row">
            <div class="field">
              <label>Delivery working hours – Start</label>
              <input v-model="form.deliveryStartTime" type="time" class="input" />
            </div>
            <div class="field">
              <label>End</label>
              <input v-model="form.deliveryEndTime" type="time" class="input" />
            </div>
          </div>
          <p class="hint">Outside these hours customers cannot add items to the basket (delivery).</p>
        </section>

        <section class="section">
          <h2>Pick-up</h2>
          <div class="toggle-row">
            <span class="toggle-label">Pick-up enabled</span>
            <label class="toggle-wrap">
              <input v-model="form.pickupEnabled" type="checkbox" class="toggle-input" />
              <span class="toggle-slider"></span>
            </label>
          </div>
          <p class="hint">When OFF, pick-up tab shows &quot;No Pick-up possible at the moment&quot; and basket is disabled.</p>
          <div class="time-row">
            <div class="field">
              <label>Pick-up working hours – Start</label>
              <input v-model="form.pickupStartTime" type="time" class="input" />
            </div>
            <div class="field">
              <label>End</label>
              <input v-model="form.pickupEndTime" type="time" class="input" />
            </div>
          </div>
          <p class="hint">Outside these hours customers cannot add items to the basket (pick-up).</p>
        </section>

        <p v-if="error" class="error-msg">{{ error }}</p>
        <p v-if="success" class="success-msg">Settings saved.</p>
        <ButtonFilled type="submit" class="submit-btn" :text="saving ? 'Saving…' : 'Save settings'" :disabled="saving" />
      </form>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: #000;
  color: #fff;
  padding: 24px;
  max-width: 640px;
  margin: 0 auto;
}
.header { margin-bottom: 28px; }
.title-ananias { font-family: "Ananias", serif; color: #ffc300; font-size: 1.8rem; margin: 0 0 8px 0; }
.subtitle { color: #888; font-size: 0.95rem; margin: 0; }
.loading { color: #888; padding: 24px; }
.section {
  margin-bottom: 28px;
  padding-bottom: 24px;
  border-bottom: 1px solid #222;
}
.section h2 { font-family: "Montserrat-Bold"; color: #ffc300; font-size: 1.1rem; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px; }
.hint { color: #666; font-size: 0.85rem; margin: 6px 0 12px 0; }
.field { margin-bottom: 14px; }
.field label { display: block; margin-bottom: 6px; font-size: 0.9rem; color: #ccc; }
.input {
  width: 100%;
  max-width: 280px;
  padding: 10px 12px;
  background: #111;
  border: 1px solid #333;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  box-sizing: border-box;
}
.input:focus { outline: none; border-color: #ffc300; }
.input-number { max-width: 100px; }
.time-row { display: flex; gap: 16px; align-items: flex-end; flex-wrap: wrap; }
.toggle-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.toggle-label { font-size: 1rem; color: #eee; }
.toggle-wrap { position: relative; width: 52px; height: 28px; flex-shrink: 0; cursor: pointer; }
.toggle-input { opacity: 0; width: 0; height: 0; position: absolute; }
.toggle-slider {
  position: absolute;
  cursor: pointer;
  pointer-events: none;
  top: 0; left: 0; right: 0; bottom: 0;
  background: #333;
  border-radius: 28px;
  transition: 0.25s;
}
.toggle-slider::before {
  content: "";
  position: absolute;
  height: 20px; width: 20px;
  left: 4px; bottom: 4px;
  background: #fff;
  border-radius: 50%;
  transition: 0.25s;
}
.toggle-input:checked + .toggle-slider { background: #ffc300; }
.toggle-input:checked + .toggle-slider::before { transform: translateX(24px); }
.error-msg { color: #ef4444; margin-bottom: 12px; }
.success-msg { color: #22c55e; margin-bottom: 12px; }
.submit-btn { margin-top: 8px; }
</style>
