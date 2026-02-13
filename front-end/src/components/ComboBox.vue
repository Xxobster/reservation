<script setup>
import ErrorIcon from "~icons/bxs/error-circle";

import { computed } from "vue";

const props = defineProps({
  id: String,
  labelText: String,
  placeholderText: String,
  collection: Array,
  selectedItem: Number,
  errors: Object,
});

const emit = defineEmits(["update:selectedItem"]);

const value = computed({
  get() {
    return props.selectedItem;
  },
  set(value) {
    emit("update:selectedItem", value);
  },
});
</script>

<template>
  <div class="wrapper">
    <label :for="props.id">{{ props.labelText }}</label>
    <select
      class="input"
      :class="{ redBorder: props.errors && props.errors[id] }"
      :name="props.id"
      v-model="value"
      required
    >
      <option value="" disabled selected hidden>
        {{ props.placeholderText }}
      </option>
      <option
        v-for="item in props.collection"
        :key="item.id"
        :value="item.id != null ? Number(item.id) : ''"
      >
        {{ item?.name }}
      </option>
    </select>
    <div v-if="props.errors && props.errors[id]" class="errors-wrapper">
      <div v-for="err in props.errors[id]" :key="err.id" class="error">
        <ErrorIcon />
        <p>{{ err }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
label {
  font-family: "Montserrat-Medium";
  color: #fff;
  font-size: 14px;
  margin-bottom: 8px;
}

.wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 20px;
}

.input {
  padding: 12px 15px;
  font-family: "Montserrat-Light";
  color: #fff;
  font-size: 16px;
  border: 1px solid #333;
  border-radius: 8px;
  background: #111;
  cursor: pointer;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: #ffc300;
}

.redBorder {
  border-color: #ef4444;
}

.errors-wrapper {
  margin-top: 8px;
  color: #ef4444;
}

.error {
  display: flex;
  align-items: center;
  gap: 5px;
}

select,
option {
  font-family: "Montserrat-Light", monospace;
  background: #111;
  color: #fff;
}

.error p {
  font-family: "Montserrat-Light";
  font-size: 12px;
}
</style>
