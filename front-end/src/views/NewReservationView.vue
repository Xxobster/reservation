<script setup>
import TextBox from "@/components/TextBox.vue";
import ButtonFilled from "@/components/ButtonFilled.vue";
import SuccessMessage from "@/components/SuccessMessage.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";

import SaveIcon from "~icons/fluent/save-16-regular";
import reservationAPI from "@/services/reservationAPI";
import { ref } from "vue";

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
const generalError = ref(null);

const registerReservation = async () => {
  isSuccessful.value = false;
  validationErrors.value = null;
  generalError.value = null;
  try {
    await reservationAPI.registerReservation(reservation.value);
    isSuccessful.value = true;
  } catch (err) {
    if (err.response && err.response.data) {
      generalError.value = err.response.data.message;
      validationErrors.value = err.response.data.errors;
    }
  }
};
</script>

<template>
  <div class="main-wrapper">
    <div class="header">
      <h1>New Reservation</h1>
    </div>

    <div class="form-wrapper">
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
          <TextBox
            text-box-type="time"
            id="resTime"
            label-text="Reservation Time"
            :errors="validationErrors"
            v-model:input="reservation.resTime"
          />
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

        <!-- NEW: Table Type -->
        <div class="select-group">
          <label>Table Type</label>
          <select v-model="reservation.table_type_req">
            <option value="standard">Standard</option>
            <option value="raclette">Raclette</option>
          </select>
        </div>

        <!-- NEW: Seating Type -->
        <div class="select-group">
          <label>Seating Type</label>
          <select v-model="reservation.seating_type_req">
            <option value="chairs">Chairs</option>
            <option value="floor">Floor</option>
          </select>
        </div>

        <!-- Messages -->
        <SuccessMessage
          :is-successful="isSuccessful"
          success-message="Successfully registered your reservation!"
        />
        <ErrorMessage
          :error-flag="generalError"
          :error-message="generalError"
        />

        <ButtonFilled class="button" text="Submit">
          <template #icon><SaveIcon /></template>
        </ButtonFilled>
      </form>
    </div>
  </div>
</template>

<style scoped>
.select-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 15px;
}

.select-group label {
  margin-bottom: 5px;
  font-weight: 600;
}

.select-group select {
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #555;
  background: #111;
  color: #fff;
}
</style>
