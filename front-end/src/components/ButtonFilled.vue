<script setup>
const props = defineProps({
  text: String,
  type: { type: String, default: "submit" },
  disabled: Boolean,
});
const emit = defineEmits(["click"]);
</script>

<template>
  <button
    :type="props.type"
    :disabled="props.disabled"
    class="wrapper"
    @click="emit('click')"
  >
    <slot name="icon"></slot>
    <div>{{ props.text }}</div>
  </button>
</template>

<style scoped>
.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  background-color: #ffc300;
  width: 100%;
  color: #000;
  text-align: center;
  font-family: "Montserrat-Bold";
  border-radius: 5px;
  padding: 12px 25px;
  transition: 300ms;
  cursor: pointer;
}
.wrapper:hover {
  background-color: #e6b000;
}
.wrapper:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
