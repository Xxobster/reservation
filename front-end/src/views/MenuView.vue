<script setup>
// Menu images: 1.png, 2.png, 3.png, ... (in public/img/menu/)
const MENU_IMAGE_COUNT = 8;
const imageIndices = Array.from({ length: MENU_IMAGE_COUNT }, (_, i) => i + 1);
</script>

<template>
  <div class="menu-page">
    <div class="menu-scroll">
      <section
        v-for="i in imageIndices"
        :key="i"
        class="menu-section"
      >
        <img
          :src="`/img/menu/${i}.png`"
          :alt="`Menu page ${i}`"
          class="menu-image"
          @error="($event.target.style.display = 'none')"
        />
      </section>
    </div>
  </div>
</template>

<style scoped>
.menu-page {
  height: calc(100vh - var(--top-spacing));
  background: #0f0f0f;
  color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.menu-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  display: flex;
  flex-direction: column;
}

.menu-section {
  min-height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-sizing: border-box;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  flex-shrink: 0;
}

.menu-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 4px;
}
</style>
