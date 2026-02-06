<script setup>
import ErrorIcon from "~icons/bxs/error-circle";

const props = defineProps({
  textBoxType: String,
  id: String,
  labelText: String,
  placeholderText: String,
  input: String,
  errors: Object,
});

console.log(props.errors);
const emit = defineEmits(["update:input"]);
</script>

<template>
  <div class="wrapper">
    <label :for="props.id">{{ props.labelText }}</label>
    <input
      :class="{ redBorder: props.errors && props.errors[props.id] }"
      class="input"
      :type="props.textBoxType"
      :id="props.id"
      :name="props.id"
      :placeholder="props.placeholderText"
      :value="props.input"
      @input="emit('update:input', $event.target.value)"
    />
    <div v-if="props.errors && props.errors[props.id]" class="errors-wrapper">
      <div v-for="err in props.errors[props.id]" :key="err" class="error">
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
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: #ffc300;
}

.input::placeholder {
  color: #666;
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

.error p {
  font-family: "Montserrat-Light";
  font-size: 12px;
}
</style>
