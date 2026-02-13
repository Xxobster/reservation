<script setup>
import { ref, onMounted } from "vue";
import ButtonFilled from "@/components/ButtonFilled.vue";
import { getSettings, updateSettings, restartBackend } from "@/services/settingsAPI";
import { getGuesthouseList, updateGuesthouseList } from "@/services/guesthouseAPI";

const loading = ref(true);
const saving = ref(false);
const success = ref(false);
const error = ref(null);

const restarting = ref(false);
const restartMessage = ref(null);

const guesthouseListText = ref("");
const savingGuesthouses = ref(false);
const guesthouseListMessage = ref(null);

const doRestartBackend = async () => {
  restarting.value = true;
  restartMessage.value = null;
  try {
    await restartBackend();
    restartMessage.value = { type: "success", text: "Backend restart triggered. It will be back in a few seconds." };
  } catch (e) {
    restartMessage.value = {
      type: "error",
      text: e.response?.data?.message || "Failed to trigger restart.",
    };
  } finally {
    restarting.value = false;
  }
};

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
  notifyEmailAfterTime: "11:00",
  reservationNotifyEmails: "",
  notifyDeliveryEmailAfterTime: "11:00",
  deliveryNotifyEmails: "",
  deliveryFeeGuesthouseLAK: 30000,
  deliveryFeeDeliveryPersonLAK: 20000,
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
      notifyEmailAfterTime: d.notifyEmailAfterTime ?? "11:00",
      reservationNotifyEmails: d.reservationNotifyEmails ?? "",
      notifyDeliveryEmailAfterTime: d.notifyDeliveryEmailAfterTime ?? "11:00",
      deliveryNotifyEmails: d.deliveryNotifyEmails ?? "",
      deliveryFeeGuesthouseLAK: d.deliveryFeeGuesthouseLAK ?? 30000,
      deliveryFeeDeliveryPersonLAK: d.deliveryFeeDeliveryPersonLAK ?? 20000,
    };
  } catch (e) {
    error.value = e.response?.data?.message || "Failed to load settings.";
  } finally {
    loading.value = false;
  }
  try {
    const ghRes = await getGuesthouseList();
    const list = ghRes.data?.list;
    guesthouseListText.value = Array.isArray(list) ? list.join("\n") : "";
  } catch (_) {
    guesthouseListText.value = "";
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

const saveGuesthouseList = async () => {
  savingGuesthouses.value = true;
  guesthouseListMessage.value = null;
  try {
    const lines = guesthouseListText.value
      .split(/\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    const list = [...new Set(lines)].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
    await updateGuesthouseList(list);
    guesthouseListText.value = list.join("\n");
    guesthouseListMessage.value = { type: "success", text: "Guesthouse list saved (sorted A–Z)." };
  } catch (e) {
    guesthouseListMessage.value = {
      type: "error",
      text: e.response?.data?.message || "Failed to save guesthouse list.",
    };
  } finally {
    savingGuesthouses.value = false;
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
          <div class="field">
            <label>Email(s) for reservation notifications</label>
            <textarea
              v-model="form.reservationNotifyEmails"
              class="input email-textarea"
              rows="3"
              placeholder="email1@example.com, email2@example.com"
            />
          </div>
          <p class="hint">Addresses that receive an email when a new reservation is made. Separate with commas, spaces, or new lines.</p>
          <div class="field">
            <label>Send reservation notification emails after (time)</label>
            <input v-model="form.notifyEmailAfterTime" type="time" class="input" />
          </div>
          <p class="hint">Reservations made before this time (server local) receive their notification email at this time instead of immediately. e.g. 11:00 = emails sent at 11am.</p>
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
          <div class="field">
            <label>Email(s) for delivery notifications</label>
            <textarea
              v-model="form.deliveryNotifyEmails"
              class="input email-textarea"
              rows="3"
              placeholder="email1@example.com, email2@example.com"
            />
          </div>
          <p class="hint">Addresses that receive an email when a new delivery is recorded. Separate with commas, spaces, or new lines.</p>
          <div class="field">
            <label>Send delivery notification emails after (time)</label>
            <input v-model="form.notifyDeliveryEmailAfterTime" type="time" class="input" />
          </div>
          <p class="hint">Deliveries recorded before this time (server local) receive their notification email at this time instead of immediately. e.g. 11:00 = emails sent at 11am.</p>
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
          <div class="time-row">
            <div class="field">
              <label>Delivery fee – Guesthouse (LAK)</label>
              <input v-model.number="form.deliveryFeeGuesthouseLAK" type="number" min="0" step="1000" class="input input-number" />
            </div>
            <div class="field">
              <label>Delivery fee – Delivery person (LAK)</label>
              <input v-model.number="form.deliveryFeeDeliveryPersonLAK" type="number" min="0" step="1000" class="input input-number" />
            </div>
          </div>
          <p class="hint">Total delivery fee shown to customer = Guesthouse + Delivery person. Guesthouse fee is used for weekly bills per guesthouse.</p>
        </section>

        <section class="section">
          <h2>Guesthouse list (Don Det)</h2>
          <p class="hint">One name per line. Used for delivery dropdown and guesthouse bills; names must match exactly. Saved list is always sorted A–Z.</p>
          <textarea
            v-model="guesthouseListText"
            class="input guesthouse-textarea"
            rows="12"
            placeholder="BABA Guesthouse&#10;Mr B. Guesthouse&#10;..."
          />
          <ButtonFilled
            type="button"
            class="submit-btn"
            :text="savingGuesthouses ? 'Saving…' : 'Save guesthouse list'"
            :disabled="savingGuesthouses"
            @click="saveGuesthouseList"
          />
          <p v-if="guesthouseListMessage" :class="guesthouseListMessage.type === 'success' ? 'success-msg' : 'error-msg'">{{ guesthouseListMessage.text }}</p>
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

        <section class="section">
          <h2>Restart backend</h2>
          <p class="hint">Restart the API server. The page may briefly lose connection; refresh after a few seconds.</p>
          <ButtonFilled
            type="button"
            class="restart-btn"
            :text="restarting ? 'Restarting…' : 'Restart backend'"
            :disabled="restarting"
            @click="doRestartBackend"
          />
          <p v-if="restartMessage" :class="restartMessage.type === 'success' ? 'success-msg' : 'error-msg'">{{ restartMessage.text }}</p>
        </section>
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
.hint code { background: #222; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.85em; }
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
.email-textarea { min-width: 100%; max-width: 400px; resize: vertical; }
.guesthouse-textarea { min-width: 100%; max-width: 480px; min-height: 200px; resize: vertical; }
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
.restart-btn { margin-top: 8px; }
</style>
