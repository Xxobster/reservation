<script setup>
import CloseIcon from "~icons/bytesize/close";

const props = defineProps({
  isOpen: Boolean,
  headerText: String,
  isClosable: Boolean,
});

const emit = defineEmits(["closeModal"]);
</script>

<template>
  <Transition name="popupAnimation">
    <div class="main-wrapper" v-if="props.isOpen">
      <div
        class="overlay"
        @click.self="props.isClosable ? emit('closeModal') : null"
      >
        <div class="popup-wrapper">
          <div class="header">
            <h1>{{ props.headerText }}</h1>
            <button v-if="props.isClosable" @click="emit('closeModal')">
              <CloseIcon />
            </button>
          </div>
          <div class="popup-content">
            <slot name="popup-content"></slot>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.main-wrapper {
  position: relative;
  z-index: 20;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
}

button {
  appearance: none;
  background: none;
  cursor: pointer;
  border: none;
  color: #999;
  font-size: 24px;
  transition: color 0.2s;
}

button:hover {
  color: #ffc300;
}

.popup-wrapper {
  position: relative;
  width: 40%;
  min-width: 420px;
  background-color: #111;
  border-radius: 12px;
  border: 1px solid #333;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.popup-content {
  padding: 20px;
}

.popup-wrapper .header {
  display: flex;
  padding: 20px;
  justify-content: space-between;
  align-items: flex-start;
  gap: 60px;
  border-bottom: 1px solid #222;
}

.header h1 {
  text-align: center;
  color: #ffc300;
  font-family: "Montserrat-Bold";
  font-size: 1.3em;
}

.popupAnimation-enter-from,
.popupAnimation-leave-to {
  opacity: 0;
}

.popupAnimation-enter-active,
.popupAnimation-leave-active {
  transition: opacity 0.1s ease-out;
}
</style>
