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
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  align-items: start;
}

.grid-item-container {
  min-height: 0;
  align-self: start; /* ← prevents vertical stretching */
}

@media screen and (min-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }
}

@media screen and (min-width: 1024px) {
  .main-wrapper {
    padding: 30px;
  }
  .grid-container {
    gap: 30px;
  }
}
</style>
