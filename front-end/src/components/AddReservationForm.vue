<script setup>
import ComboBox from "@/components/ComboBox.vue";
import TextBox from "@/components/TextBox.vue";
import ButtonFilled from "@/components/ButtonFilled.vue";
import SuccessMessage from "@/components/SuccessMessage.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import SaveIcon from "~icons/fluent/save-16-regular";

import reservationAPI from "@/services/reservationAPI";
import { ref, computed } from "vue";

const props = defineProps({
  tables: { type: Array, default: () => [] },
  defaultDate: { type: String, default: "" },
  defaultStartTime: { type: String, default: "12:00" },
});

const emit = defineEmits(["onAdded"]);

const tableList = computed(() => props.tables || []);

const form = ref({
  tableId: null,
  resDate: props.defaultDate || "",
  resTime: props.defaultStartTime || "12:00",
  endTime: "",
  people: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  menu: "",
});

const errMsg = ref(null);
const isSuccessful = ref(false);
const isSubmitting = ref(false);

const addReservation = async () => {
  errMsg.value = null;
  isSuccessful.value = false;
  if (!form.value.tableId) {
    errMsg.value = "Please select a table.";
    return;
  }
  isSubmitting.value = true;
  try {
    const payload = {
      tableId: form.value.tableId,
      resDate: form.value.resDate || undefined,
      resTime: form.value.resTime || undefined,
      endTime: form.value.endTime || undefined,
      people: form.value.people || undefined,
      firstName: form.value.firstName || undefined,
      lastName: form.value.lastName || undefined,
      phone: form.value.phone || undefined,
      email: form.value.email || undefined,
      menu_req: form.value.menu || undefined,
    };
    await reservationAPI.createManualReservation(payload);
    isSuccessful.value = true;
    emit("onAdded");
  } catch (err) {
    errMsg.value = err.response?.data?.message || "Failed to add reservation.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="add-reservation-form">
    <form @submit.prevent="addReservation">
      <ComboBox
        id="manual-table"
        label-text="Table"
        placeholder-text="Choose a table..."
        :collection="tableList"
        v-model:selectedItem="form.tableId"
      />

      <div class="form-row">
        <TextBox
          id="manual-resDate"
          text-box-type="date"
          label-text="Date"
          placeholder-text="Date"
          v-model:input="form.resDate"
        />
        <TextBox
          id="manual-resTime"
          text-box-type="time"
          label-text="Start time"
          placeholder-text="e.g. 12:00"
          v-model:input="form.resTime"
        />
        <TextBox
          id="manual-endTime"
          text-box-type="time"
          label-text="End time"
          placeholder-text="e.g. 14:00 (optional)"
          v-model:input="form.endTime"
        />
      </div>

      <TextBox
        id="manual-people"
        text-box-type="number"
        label-text="Number of people"
        placeholder-text="Optional"
        v-model:input="form.people"
      />

      <div class="form-row">
        <TextBox
          id="manual-firstName"
          text-box-type="text"
          label-text="First name"
          placeholder-text="Optional"
          v-model:input="form.firstName"
        />
        <TextBox
          id="manual-lastName"
          text-box-type="text"
          label-text="Last name"
          placeholder-text="Optional"
          v-model:input="form.lastName"
        />
      </div>

      <TextBox
        id="manual-phone"
        text-box-type="text"
        label-text="Phone"
        placeholder-text="Optional"
        v-model:input="form.phone"
      />
      <TextBox
        id="manual-email"
        text-box-type="email"
        label-text="Email"
        placeholder-text="Optional"
        v-model:input="form.email"
      />
      <TextBox
        id="manual-menu"
        text-box-type="text"
        label-text="Menu"
        placeholder-text="e.g. Raclette, Fondue (optional)"
        v-model:input="form.menu"
      />

      <SuccessMessage
        :is-successful="isSuccessful"
        success-message="Reservation added."
      />
      <ErrorMessage :error-flag="errMsg" :error-message="errMsg" />
      <ButtonFilled
        type="submit"
        :disabled="isSubmitting"
        :text="isSubmitting ? 'Adding…' : 'Add reservation'"
      >
        <template #icon>
          <SaveIcon />
        </template>
      </ButtonFilled>
    </form>
  </div>
</template>

<style scoped>
.add-reservation-form {
  min-width: 320px;
}
.form-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.form-row .textBox-group,
.form-row :deep(.wrapper) {
  flex: 1;
  min-width: 120px;
}
</style>
