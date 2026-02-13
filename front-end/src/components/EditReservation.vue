<script setup>
import ButtonFilled from "@/components/ButtonFilled.vue";
import TextBox from "@/components/TextBox.vue";
import SuccessMessage from "@/components/SuccessMessage.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import SaveIcon from "~icons/fluent/save-16-regular";

import { ref, watch } from "vue";

import reservationAPI from "@/services/reservationAPI";
import getValues from "@/utils/getValues";

const props = defineProps({
  reservation: Object,
});

const emit = defineEmits(["onEdited"]);

// Normalize time to HH:MM for input[type="time"]
const toHHMM = (t) => {
  if (!t) return "";
  const s = String(t).trim();
  const part = s.split(":")[0];
  const rest = s.split(":")[1] || "00";
  return `${part.padStart(2, "0")}:${rest.substring(0, 2).padStart(2, "0")}`;
};

// Start + duration (minutes) => end time HH:MM
const addMinutesToTime = (startHHMM, durationMin) => {
  if (!startHHMM || durationMin == null) return "";
  const [h, m] = startHHMM.split(":").map(Number);
  const total = (h || 0) * 60 + (m || 0) + Number(durationMin);
  const endH = Math.floor(total / 60) % 24;
  const endM = total % 60;
  return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
};

// End - start => duration in minutes
const timeDiffMinutes = (startHHMM, endHHMM) => {
  if (!startHHMM || !endHHMM) return null;
  const [sh, sm] = startHHMM.split(":").map(Number);
  const [eh, em] = endHHMM.split(":").map(Number);
  return (eh || 0) * 60 + (em || 0) - ((sh || 0) * 60 + (sm || 0));
};

const durationMin = props.reservation?.durationMin ?? 90;
const initialStart = toHHMM(props.reservation?.resTime);
const initialEnd = addMinutesToTime(initialStart, durationMin);

const reservation = ref({
  resDate: {
    textBoxType: "date",
    id: "resDate",
    labelText: "Reservation Date",
    placeholderText: "Enter reservation date...",
    value: props.reservation?.resDate,
  },
  resTime: {
    textBoxType: "time",
    id: "resTime",
    labelText: "Start time",
    placeholderText: "e.g. 17:00",
    value: initialStart,
  },
  endTime: {
    textBoxType: "time",
    id: "endTime",
    labelText: "End time",
    placeholderText: "e.g. 18:30",
    value: initialEnd,
  },
  people: {
    textBoxType: "number",
    id: "people",
    labelText: "Number of People",
    placeholderText: "Enter the number of people...",
    value: props.reservation?.people?.toString(),
  },
});

// When start time changes, keep end time valid (if end <= start, nudge end to start + 30)
watch(
  () => reservation.value.resTime.value,
  (start) => {
    const end = reservation.value.endTime.value;
    const dur = timeDiffMinutes(start, end);
    if (dur != null && dur < 15) {
      reservation.value.endTime.value = addMinutesToTime(start, 30);
    }
  }
);

const validationErrors = ref({});
const isSuccessful = ref(false);
const generalErrors = ref(null);

const editReservation = async () => {
  validationErrors.value = {};
  generalErrors.value = null;
  isSuccessful.value = false;

  const start = reservation.value.resTime.value;
  const end = reservation.value.endTime.value;
  const duration = timeDiffMinutes(start, end);
  if (duration == null || duration < 15) {
    generalErrors.value = "End time must be at least 15 minutes after start time.";
    return;
  }
  if (duration > 480) {
    generalErrors.value = "Duration cannot exceed 8 hours.";
    return;
  }

  const base = getValues(reservation.value);
  const peopleNum = base.people != null && base.people !== "" ? Number(base.people) : NaN;
  if (!Number.isInteger(peopleNum) || peopleNum < 1 || peopleNum > 20) {
    generalErrors.value = "Number of people must be between 1 and 20.";
    return;
  }

  const payload = {
    resDate: base.resDate,
    resTime: start,
    people: peopleNum,
    durationMin: duration,
  };

  try {
    await reservationAPI.editReservation(props.reservation.id, payload);
    emit("onEdited");
    isSuccessful.value = true;
  } catch (err) {
    if (err.response?.data) {
      validationErrors.value = err.response.data.errors || {};
      generalErrors.value = err.response.data.message;
    }
  }
};
</script>

<template>
  <div class="main-wrapper">
    <form @submit.prevent="editReservation()">
      <TextBox
        v-for="textBox in reservation"
        :key="textBox.id"
        :text-box-type="textBox.textBoxType"
        :id="textBox.id"
        :label-text="textBox.labelText"
        :placeholder-text="textBox.placeholderText"
        :errors="validationErrors"
        v-model:input="textBox.value"
      />
      <ErrorMessage
        :error-flag="generalErrors"
        :error-message="generalErrors"
      />
      <SuccessMessage
        class="success"
        :is-successful="isSuccessful"
        success-message="Done!"
      />
      <ButtonFilled text="Done">
        <template #icon>
          <SaveIcon />
        </template>
      </ButtonFilled>
    </form>
  </div>
</template>

<style scoped>
.success {
  margin-bottom: 20px;
}
</style>
