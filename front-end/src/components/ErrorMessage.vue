<script setup>
import ErrorIcon from "~icons/bxs/error-circle";
import { computed } from "vue";

const props = defineProps({
  errorFlag: Boolean,
  errorMessage: String,
});

// Convert newlines to HTML breaks for display
const formattedMessage = computed(() => {
  if (!props.errorMessage) return '';
  return props.errorMessage.replace(/\n/g, '<br>');
});
</script>

<template>
  <Transition name="fade">
    <div class="error-container" v-if="props.errorFlag">
      <div class="error-box">
        <ErrorIcon class="error-icon" />
        <div class="error-message" v-html="formattedMessage"></div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.error-container {
  width: 100%;
  margin-top: 15px;
  margin-bottom: 15px;
}

.error-box {
  background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%);
  border: 2px solid #ef4444;
  border-radius: 12px;
  padding: 20px;
  color: #fff;
  text-align: left;
}

.error-icon {
  font-size: 28px;
  color: #fca5a5;
  margin-bottom: 10px;
}

.error-message {
  font-size: 1em;
  line-height: 1.6;
  color: #fef2f2;
}

.error-message :deep(br) {
  display: block;
  margin-bottom: 5px;
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
