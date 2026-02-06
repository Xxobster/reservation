<script setup>
const props = defineProps({
  text: String,
});
</script>

<template>
  <button class="wrapper">
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
</style>
