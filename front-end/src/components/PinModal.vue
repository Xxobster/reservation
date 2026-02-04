<script setup>
import { ref } from "vue";

const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(["onSuccess", "onCancel"]);

// PIN code - change this to your desired PIN
const ADMIN_PIN = "1954";

const pin = ref("");
const error = ref("");

const checkPin = () => {
  if (pin.value === ADMIN_PIN) {
    // Store authentication in sessionStorage (expires when browser closes)
    sessionStorage.setItem("adminAuthenticated", "true");
    emit("onSuccess");
    pin.value = "";
    error.value = "";
  } else {
    error.value = "Incorrect PIN";
    pin.value = "";
  }
};

const cancel = () => {
  pin.value = "";
  error.value = "";
  emit("onCancel");
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <h2>Admin Access</h2>
      <p class="subtitle">Enter PIN to continue</p>
      
      <form @submit.prevent="checkPin">
        <input
          v-model="pin"
          type="password"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="6"
          placeholder="Enter PIN"
          class="pin-input"
          autofocus
        />
        
        <p v-if="error" class="error">{{ error }}</p>
        
        <div class="buttons">
          <button type="button" class="cancel-btn" @click="cancel">Cancel</button>
          <button type="submit" class="submit-btn">Unlock</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 30px 40px;
  text-align: center;
  min-width: 300px;
}

h2 {
  color: #fff;
  margin: 0 0 5px 0;
  font-size: 24px;
}

.subtitle {
  color: #888;
  margin: 0 0 25px 0;
  font-size: 14px;
}

.pin-input {
  width: 100%;
  padding: 15px;
  font-size: 24px;
  text-align: center;
  letter-spacing: 10px;
  border: 2px solid #333;
  border-radius: 8px;
  background: #111;
  color: #fff;
  outline: none;
  transition: border-color 0.2s;
}

.pin-input:focus {
  border-color: #c41e3a;
}

.error {
  color: #ef4444;
  margin: 10px 0;
  font-size: 14px;
}

.buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn, .submit-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #333;
  color: #fff;
}

.cancel-btn:hover {
  background: #444;
}

.submit-btn {
  background: #c41e3a;
  color: #fff;
}

.submit-btn:hover {
  background: #a01830;
}
</style>
