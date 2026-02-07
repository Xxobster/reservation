<script setup>
import ReservationsSkeleton from "@/components/ReservationsSkeleton.vue";
import TheReservations from "@/components/TheReservations.vue";
</script>

<template>
  <div class="main-wrapper">
    <Suspense>
      <template #default>
        <TheReservations />
      </template>
      <template #fallback>
        <ReservationsSkeleton />
      </template>
    </Suspense>
  </div>
</template>

<style scoped>
.main-wrapper {
  min-height: 100vh;
  background: #000;
}
</style>
