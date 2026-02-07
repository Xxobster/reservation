<script setup>
const props = defineProps({
  collection: Array,
});
</script>

<template>
  <div class="main-wrapper">
    <div class="grid-container">
      <div
        v-for="item in props.collection"
        :key="item.id"
        class="grid-item-container"
      >
        <slot :item="item" name="card"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-wrapper {
  background-color: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 10px;
  padding: 15px;
  transition: all 1.5s;
  height: fit-content;
  width: 100%;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 15px;
  grid-auto-rows: max-content;
  align-content: start;
  width: 100%;
}

.grid-item-container {
  min-height: 0;
  align-self: start;
  height: fit-content;
}

/* Force slotted card to not stretch - target direct child (RestaurantTable root) */
.grid-item-container :deep(> *) {
  height: auto !important;
  max-height: none !important;
  min-height: 0 !important;
}

@media screen and (min-width: 1024px) {
  .main-wrapper {
    padding: 30px;
  }
  .grid-container {
    grid-gap: 30px;
  }
}
</style>
