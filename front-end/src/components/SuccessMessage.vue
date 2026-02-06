<script setup>
import TickIcon from "~icons/mdi/tick-circle";
const props = defineProps({
  isSuccessful: Boolean,
  successMessage: String,
});
</script>

<template>
  <Transition name="fade">
    <div class="success" v-if="props.isSuccessful">
      <TickIcon />
      <p>{{ props.successMessage }}</p>
    </div>
  </Transition>
</template>

<style scoped>
.success {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 8px;
  margin-top: 10px;
  margin-bottom: 15px;
  padding: 15px;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 10px;
  color: #22c55e;
  font-family: "Montserrat-Medium";
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease-out;
}
</style>
