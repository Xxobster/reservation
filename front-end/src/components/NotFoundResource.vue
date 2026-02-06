<script setup>
const props = defineProps({
  text: String,
  position: String,
});
</script>

<template>
  <div class="main-wrapper">
    <div class="content">
      <slot class="vector" name="icon"></slot>
      <h1>{{ props.text }}</h1>
    </div>
  </div>
</template>

<style scoped>
.main-wrapper {
  position: relative;
  top: 0;
  left: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 10px;
  padding: 50px;
  border: 1px solid #333;
  border-radius: 10px;
  background-color: #111;
}

.main-wrapper .content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  color: #666;
}

.main-wrapper .content h1 {
  color: #666;
  font-family: "Montserrat-Medium";
}
</style>
