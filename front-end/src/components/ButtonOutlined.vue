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
  color: #ffc300;
  background-color: transparent;
  border: 2px solid #ffc300;
  width: 100%;
  text-align: center;
  font-family: "Montserrat-Bold";
  border-radius: 5px;
  padding: 12px 25px;
  transition: 300ms;
  cursor: pointer;
}
.wrapper:hover {
  background-color: #ffc300;
  color: #000;
}
</style>
