<script setup>
import { ref, onMounted } from "vue";
import ReservationsSkeleton from "@/components/ReservationsSkeleton.vue";
import TheReservations from "@/components/TheReservations.vue";
import { getSettings } from "@/services/settingsAPI";

const reservationsEnabled = ref(true);
const loadingSettings = ref(true);

onMounted(async () => {
  try {
    const res = await getSettings();
    reservationsEnabled.value = res.data?.reservationsEnabled !== false;
  } catch (_) {
    reservationsEnabled.value = true;
  } finally {
    loadingSettings.value = false;
  }
});
</script>

<template>
  <div class="main-wrapper">
    <div v-if="loadingSettings" class="reservations-loading">
      <ReservationsSkeleton />
    </div>
    <div v-else-if="!reservationsEnabled" class="reservations-disabled">
      <p class="disabled-message">No Reservation possible at the moment.</p>
    </div>
    <Suspense v-else>
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
.reservations-loading {
  min-height: 100vh;
}
.reservations-disabled {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.disabled-message {
  font-family: "Montserrat-Medium";
  font-size: 1.25rem;
  color: #ffc300;
  text-align: center;
  margin: 0;
}
</style>
