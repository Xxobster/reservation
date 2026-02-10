<script setup>
import TextBox from "@/components/TextBox.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";

import SaveIcon from "~icons/fluent/save-16-regular";
import reservationAPI from "@/services/reservationAPI";
import { getSettings } from "@/services/settingsAPI";
import { ref, computed, onMounted } from "vue";

const reservation = ref({
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  resDate: "",
  resTime: "",
  people: "",
  table_type_req: "standard", // standard | raclette
  seating_type_req: "chairs", // chairs | floor
});

const validationErrors = ref(null);
const isSuccessful = ref(false);
const isSubmitting = ref(false);
const generalError = ref(null);
const confirmationData = ref(null);
const reservationsWhatsappDisplay = ref("+41 79 391 75 77");
const reservationsWhatsappUrl = ref("https://wa.me/41793917577");
const reservationsEnabled = ref(true);
const settingsLoading = ref(true);
const showPaymentsFullscreen = ref(false);

onMounted(async () => {
  try {
    const res = await getSettings();
    const d = res.data || {};
    const num = (d.whatsappReservations || "").replace(/\D/g, "") || "41793917577";
    reservationsWhatsappUrl.value = `https://wa.me/${num}`;
    reservationsWhatsappDisplay.value = num.startsWith("41") ? `+41 ${num.slice(2, 4)} ${num.slice(4, 7)} ${num.slice(7, 9)} ${num.slice(9, 11)}` : `+${num}`;
    reservationsEnabled.value = d.reservationsEnabled !== false;
  } catch (_) {
    reservationsEnabled.value = true;
  } finally {
    settingsLoading.value = false;
  }
});

// Generate time slots every 30 minutes from 11:00 to 21:00 (last booking at 9:00 PM)
const timeSlots = computed(() => {
  const slots = [];
  for (let hour = 11; hour <= 21; hour++) {
    for (let min = 0; min < 60; min += 30) {
      if (hour === 21 && min > 0) break; // Stop at 21:00
      const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }
  return slots;
});

// Calculate end time from start time and duration (minutes)
const getEndTime = (startTime, durationMin) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const d = durationMin ?? 60;
  const endDate = new Date(2000, 0, 1, hours, minutes + d);
  return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
};

const formatDuration = (durationMin) => {
  const n = Number(durationMin);
  if (!Number.isFinite(n) || n <= 0) return "1 hour";
  if (n === 60) return "1 hour";
  if (n === 120) return "2 hours";
  const h = Math.floor(n / 60);
  const m = n % 60;
  if (m === 0) return h === 1 ? "1 hour" : `${h} hours`;
  return `${h}h ${m}min`;
};

const registerReservation = async () => {
  isSuccessful.value = false;
  validationErrors.value = null;
  generalError.value = null;
  confirmationData.value = null;

  // Check if more than 6 people
  if (parseInt(reservation.value.people) > 6) {
    generalError.value = `For reservations of more than 6 people, please contact the owner through WhatsApp on ${reservationsWhatsappDisplay.value}.`;
    return;
  }

  isSubmitting.value = true;
  try {
    const response = await reservationAPI.registerReservation(reservation.value);
    isSuccessful.value = true;

    const confirmation = response.data.confirmation;
    // Use duration from API (backend reads from settings); fallback to settings fetch if missing
    const apiDuration = confirmation.durationMin != null ? Number(confirmation.durationMin) : NaN;
    let durationMin = Number.isFinite(apiDuration) && apiDuration > 0 ? apiDuration : null;
    if (durationMin == null) {
      try {
        const res = await getSettings();
        const d = res.data || {};
        const standardMin = Number(d.reservationDurationStandardMin) || 60;
        const racletteMin = Number(d.reservationDurationRacletteMin) || 120;
        const tableType = String(confirmation.tableType || '').toLowerCase();
        durationMin = tableType === 'raclette' ? racletteMin : standardMin;
      } catch (_) {
        durationMin = confirmation.tableType === 'raclette' ? 120 : 60;
      }
    }
    const endTime = getEndTime(confirmation.resTime, durationMin);
    const duration = formatDuration(durationMin);

    confirmationData.value = {
      date: confirmation.resDate,
      startTime: confirmation.resTime,
      endTime: endTime,
      duration: duration,
      tableType: confirmation.tableType === 'raclette' ? 'Raclette' : 'Standard',
      seatingType: confirmation.seatingType === 'chairs' ? 'Chairs' : 'Floor (cushions)',
      tableName: confirmation.tableName,
      people: confirmation.people,
    };
  } catch (err) {
    if (err.response) {
      const data = err.response.data || {};
      const status = err.response.status;
      if (status === 502 || status === 503) {
        generalError.value = "Server temporarily unavailable. Please try again in a few moments.";
      } else if (data.message || data.error) {
        generalError.value = data.message ?? data.error;
        validationErrors.value = data.errors;
      } else if (data.errors && typeof data.errors === "object") {
        validationErrors.value = data.errors;
        const parts = [];
        if (data.errors.email?.length) parts.push("Please enter a valid email address.");
        if (data.errors.phone?.length) parts.push("Please enter a valid phone number.");
        if (data.errors.firstName?.length) parts.push("Please enter a valid first name.");
        if (data.errors.lastName?.length) parts.push("Please enter a valid last name.");
        generalError.value = parts.length ? parts.join(" ") : "Please check your details and try again.";
      } else {
        generalError.value = "Something went wrong. Please try again.";
      }
    } else {
      generalError.value = "Unable to reach the server. Please check your connection and try again.";
    }
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  reservation.value = {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    resDate: "",
    resTime: "",
    people: "",
    table_type_req: "standard",
    seating_type_req: "chairs",
  };
  isSuccessful.value = false;
  confirmationData.value = null;
};
</script>

<template>
  <div class="main-wrapper">
    <div class="header">
      <h1 class="title-ananias">New Reservation</h1>
    </div>

    <div v-if="settingsLoading" class="form-wrapper">
      <p class="loading-text">Loading…</p>
    </div>

    <div v-else-if="!reservationsEnabled" class="form-wrapper">
      <p class="reservations-closed-notice">Reservations are closed at the moment.</p>
    </div>

    <div v-else class="form-wrapper">
      <div class="large-group-notice">
        <p class="large-group-text">
          For reservations of more than 6 people, please contact the owner through
          <a :href="reservationsWhatsappUrl" target="_blank" rel="noopener noreferrer" class="whatsapp-inline">WhatsApp on {{ reservationsWhatsappDisplay }}</a>.
        </p>
        <a :href="reservationsWhatsappUrl" target="_blank" rel="noopener noreferrer" class="whatsapp-btn-notice" title="Contact on WhatsApp" aria-label="Open WhatsApp">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      </div>
      <form @submit.prevent="registerReservation">

        <!-- Names -->
        <div class="textBox-group">
          <TextBox
            text-box-type="text"
            id="firstName"
            label-text="First Name"
            placeholder-text="Enter your first name..."
            :errors="validationErrors"
            v-model:input="reservation.firstName"
          />
          <TextBox
            text-box-type="text"
            id="lastName"
            label-text="Last Name"
            placeholder-text="Enter your last name..."
            :errors="validationErrors"
            v-model:input="reservation.lastName"
          />
        </div>

        <!-- Contact -->
        <TextBox
          text-box-type="text"
          id="phone"
          label-text="Phone Number"
          placeholder-text="Enter your phone number..."
          :errors="validationErrors"
          v-model:input="reservation.phone"
        />
        <TextBox
          text-box-type="email"
          id="email"
          label-text="Email Address"
          placeholder-text="Enter your email address..."
          :errors="validationErrors"
          v-model:input="reservation.email"
        />

        <!-- Date / Time -->
        <div class="textBox-group">
          <TextBox
            text-box-type="date"
            id="resDate"
            label-text="Reservation Date"
            :errors="validationErrors"
            v-model:input="reservation.resDate"
          />
          <div class="select-group time-select">
            <label>Reservation Time</label>
            <select v-model="reservation.resTime">
              <option value="" disabled>Select time...</option>
              <option v-for="time in timeSlots" :key="time" :value="time">
                {{ time }}
              </option>
            </select>
          </div>
        </div>

        <!-- People -->
        <TextBox
          text-box-type="number"
          id="people"
          label-text="Number of People"
          placeholder-text="Enter the number of people..."
          :errors="validationErrors"
          v-model:input="reservation.people"
        />

        <!-- Table Type -->
        <div class="select-group">
          <label>Table Type</label>
          <select v-model="reservation.table_type_req">
            <option value="standard">Standard</option>
            <option value="raclette">Raclette</option>
          </select>
        </div>

        <!-- Seating Type - Only shown for standard tables -->
        <div class="select-group" v-if="reservation.table_type_req === 'standard'">
          <label>Seating Type</label>
          <select v-model="reservation.seating_type_req">
            <option value="chairs">Chairs</option>
            <option value="floor">Floor (on cushions)</option>
          </select>
        </div>

        <!-- Error Message -->
        <ErrorMessage
          :error-flag="generalError"
          :error-message="generalError"
        />

        <!-- Confirmation Message -->
        <div v-if="isSuccessful && confirmationData" class="confirmation-box">
          <div class="confirmation-icon">✓</div>
          <h2>RESERVATION CONFIRMED!</h2>
          <p class="thank-you">Thank you for your reservation</p>
          
          <div class="confirmation-details">
            <div class="detail-row">
              <span class="detail-label">📅 Date</span>
              <span class="detail-value">{{ confirmationData.date }}</span>
            </div>
            <div class="detail-row highlight">
              <span class="detail-label">🕐 Time</span>
              <span class="detail-value">{{ confirmationData.startTime }} → {{ confirmationData.endTime }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">⏱️ Duration</span>
              <span class="detail-value">{{ confirmationData.duration }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">👥 Party Size</span>
              <span class="detail-value">{{ confirmationData.people }} people</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">🍽️ Table Type</span>
              <span class="detail-value">{{ confirmationData.tableType }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">🪑 Seating</span>
              <span class="detail-value">{{ confirmationData.seatingType }}</span>
            </div>
          </div>
          
          <div class="confirmation-notice">
            <p>⚠️ Your table is reserved for <strong>{{ confirmationData.duration }}</strong></p>
            <p>Please arrive on time!</p>
          </div>
          
          <div class="payment-methods">
            <img
              src="/img/payments.png"
              alt="Accepted payment methods"
              class="payments-img-clickable"
              role="button"
              tabindex="0"
              @click="showPaymentsFullscreen = true"
              @keydown.enter="showPaymentsFullscreen = true"
            />
          </div>

          <Teleport to="body">
            <Transition name="payments-fade">
              <div
                v-if="showPaymentsFullscreen"
                class="payments-fullscreen"
                role="dialog"
                aria-label="Payment options full screen"
                @click.self="showPaymentsFullscreen = false"
              >
                <button
                  type="button"
                  class="payments-fullscreen-close"
                  aria-label="Close"
                  @click="showPaymentsFullscreen = false"
                >
                  ×
                </button>
                <img
                  src="/img/payments.png"
                  alt="Payment methods"
                  class="payments-fullscreen-img"
                  @click.stop
                />
              </div>
            </Transition>
          </Teleport>
          
          <button type="button" class="new-reservation-btn" @click="resetForm">Make Another Reservation</button>
        </div>

        <button
          v-if="!isSuccessful"
          type="button"
          class="submit-btn"
          :disabled="isSubmitting"
          @click="registerReservation"
        >
          <SaveIcon />
          <span>{{ isSubmitting ? 'Submitting...' : 'Submit' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.main-wrapper {
  min-height: 100vh;
  background: #000;
  padding: 30px 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #ffc300;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-size: 2em;
}
.title-ananias {
  font-family: "Ananias", Georgia, serif;
}

.form-wrapper {
  max-width: 600px;
  margin: 0 auto;
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 15px;
  padding: 30px;
}

.form-wrapper form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.textBox-group {
  display: flex;
  gap: 15px;
}

.textBox-group > * {
  flex: 1;
}

.loading-text {
  color: #888;
  text-align: center;
  padding: 24px;
  margin: 0;
}
.reservations-closed-notice {
  color: #fca5a5;
  font-size: 1em;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
  padding: 15px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 8px;
}
.large-group-notice {
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(255, 195, 0, 0.1);
  border: 1px solid rgba(255, 195, 0, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}
.large-group-notice .large-group-text {
  color: #ffc300;
  font-size: 1em;
  text-align: center;
  font-weight: 500;
  margin: 0;
}
.large-group-notice .whatsapp-inline {
  color: #ffc300;
  text-decoration: underline;
}
.large-group-notice .whatsapp-btn-notice {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: #25D366;
  color: #fff;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background 0.2s, transform 0.2s;
}
.large-group-notice .whatsapp-btn-notice:hover {
  background: #128C7E;
  transform: scale(1.08);
}
.large-group-notice .whatsapp-btn-notice svg {
  width: 26px;
  height: 26px;
}

.select-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 15px;
}

.select-group label {
  margin-bottom: 8px;
  font-weight: 600;
  color: #fff;
  font-family: "Montserrat-Medium";
}

.select-group select {
  padding: 12px 15px;
  border-radius: 8px;
  border: 1px solid #333;
  background: #111;
  color: #fff;
  font-size: 1em;
  font-family: "Montserrat-Light";
  cursor: pointer;
  transition: border-color 0.2s;
}

.select-group select:focus {
  outline: none;
  border-color: #ffc300;
}

.time-select {
  margin-top: 0;
}

.confirmation-box {
  background: linear-gradient(135deg, #0d1b0f 0%, #132616 100%);
  border: 2px solid #ffc300;
  border-radius: 16px;
  padding: 30px;
  margin: 25px 0;
  color: #fff;
  text-align: center;
  box-shadow: 0 10px 40px rgba(255, 195, 0, 0.15);
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.confirmation-icon {
  width: 70px;
  height: 70px;
  background: #ffc300;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  margin: 0 auto 15px;
  box-shadow: 0 4px 15px rgba(255, 195, 0, 0.4);
  color: #000;
}

.confirmation-box h2 {
  font-size: 1.8em;
  margin: 0 0 5px 0;
  color: #ffc300;
  letter-spacing: 1px;
  font-family: "Montserrat-Bold";
}

.thank-you {
  color: #ccc;
  font-size: 1.1em;
  margin-bottom: 20px;
  font-family: "Montserrat-Light";
}

.confirmation-details {
  background: rgba(0,0,0,0.4);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #1a1a1a;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row.highlight {
  background: rgba(255, 195, 0, 0.15);
  margin: 5px -10px;
  padding: 12px 10px;
  border-radius: 8px;
  border-bottom: none;
}

.detail-label {
  font-size: 1em;
  color: #999;
  font-family: "Montserrat-Light";
}

.detail-value {
  font-size: 1.1em;
  font-weight: bold;
  color: #fff;
  font-family: "Montserrat-Medium";
}

.confirmation-notice {
  background: rgba(255, 195, 0, 0.1);
  border: 1px solid rgba(255, 195, 0, 0.3);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.confirmation-notice p {
  margin: 5px 0;
  color: #ffc300;
  font-family: "Montserrat-Light";
}

.payment-methods {
  margin: 20px 0;
  padding: 15px;
  background: rgba(255,255,255,0.05);
  border-radius: 10px;
  border: 1px solid #1a1a1a;
}

.payment-methods img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}

.payment-methods .payments-img-clickable {
  cursor: pointer;
}
.payment-methods .payments-img-clickable:hover {
  opacity: 0.9;
}

.new-reservation-btn {
  background: #ffc300;
  color: #000;
  border: none;
  padding: 14px 30px;
  border-radius: 10px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(255, 195, 0, 0.3);
  font-family: "Montserrat-Medium";
}

.new-reservation-btn:hover {
  background: #e6b000;
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(255, 195, 0, 0.4);
}

.submit-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: #ffc300;
  color: #000;
  border: none;
  border-radius: 5px;
  padding: 12px 25px;
  font-family: "Montserrat-Bold";
  font-size: 1em;
  cursor: pointer;
  transition: 300ms;
  margin-top: 10px;
}
.submit-btn:hover:not(:disabled) {
  background: #e6b000;
}
.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media screen and (max-width: 600px) {
  .textBox-group {
    flex-direction: column;
    gap: 0;
  }
  
  .form-wrapper {
    padding: 20px;
  }
  
  .header h1 {
    font-size: 1.5em;
  }
}
</style>
<style>
/* Fullscreen overlay (teleported to body, so unscoped) */
.payments-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px 20px 20px;
  box-sizing: border-box;
  overflow: auto;
}
.payments-fullscreen-close {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 10000;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: #ffc300;
  color: #000;
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-shadow: 0 2px 12px rgba(0,0,0,0.4);
}
.payments-fullscreen-close:hover { background: #e6b000; }
.payments-fullscreen-img {
  max-width: 100%;
  max-height: 100%;
  height: auto;
  width: auto;
  object-fit: contain;
  border-radius: 10px;
}
@media screen and (max-width: 767px) {
  .payments-fullscreen { padding: 56px 16px 16px; }
  .payments-fullscreen-close { top: 10px; right: 10px; width: 48px; height: 48px; font-size: 2rem; }
}
.payments-fade-enter-active,
.payments-fade-leave-active { transition: opacity 0.2s ease; }
.payments-fade-enter-from,
.payments-fade-leave-to { opacity: 0; }
</style>
