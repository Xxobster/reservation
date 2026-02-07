<script setup>
import TextBox from "@/components/TextBox.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";

import SaveIcon from "~icons/fluent/save-16-regular";
import reservationAPI from "@/services/reservationAPI";
import { ref, computed } from "vue";

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

// Calculate end time based on table type (Raclette: 2h, Standard: 1h)
const getEndTime = (startTime, tableType) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const durationMin = tableType === 'raclette' ? 120 : 60;
  const endDate = new Date(2000, 0, 1, hours, minutes + durationMin);
  return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
};

const registerReservation = async () => {
  isSuccessful.value = false;
  validationErrors.value = null;
  generalError.value = null;
  confirmationData.value = null;

  // Check if more than 6 people
  if (parseInt(reservation.value.people) > 6) {
    generalError.value = "For reservations of more than 6 people, please contact the owner through WhatsApp on +41 79 391 75 77.";
    return;
  }

  isSubmitting.value = true;
  try {
    const response = await reservationAPI.registerReservation(reservation.value);
    isSuccessful.value = true;

    // Use confirmation data from backend response
    const confirmation = response.data.confirmation;
    const duration = confirmation.tableType === 'raclette' ? '2 hours' : '1 hour';
    const endTime = getEndTime(confirmation.resTime, confirmation.tableType);

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
      const status = err.response.status;
      if (status === 502 || status === 503) {
        generalError.value = "Server temporarily unavailable. Please try again in a few moments.";
      } else if (err.response.data && (err.response.data.message || err.response.data.error)) {
        generalError.value = err.response.data.message ?? err.response.data.error;
        validationErrors.value = err.response.data.errors;
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

    <div class="form-wrapper">
      <p class="large-group-notice">
        For reservations of more than 6 people, please contact the owner through WhatsApp on +41 79 391 75 77.
      </p>
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
            <img src="/img/payments.png" alt="Accepted payment methods" />
          </div>
          
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

.large-group-notice {
  color: #ffc300;
  font-size: 1em;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
  padding: 15px;
  background: rgba(255, 195, 0, 0.1);
  border: 1px solid rgba(255, 195, 0, 0.3);
  border-radius: 8px;
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
