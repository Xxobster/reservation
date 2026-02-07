<script setup>
import { computed } from "vue";

const props = defineProps({
  table: Object,
});

const bookedSeats = computed(() => {
  return parseInt(props.table?.bookedSeats) || 0;
});

const isSeatOccupied = (seatIndex) => {
  return seatIndex <= bookedSeats.value;
};

const hasOccupiedSeats = computed(() => {
  return bookedSeats.value > 0;
});
</script>

<template>
  <div class="main-wrapper">
    <div class="header">
      <div class="title">{{ props.table?.name }}</div>
      <div class="table-status" v-if="hasOccupiedSeats">
        {{ bookedSeats }}/{{ props.table?.capacity }}
      </div>
    </div>

    <div class="content">
      <div class="seats-wrapper">
        <div
          v-for="seat in props.table?.capacity"
          :key="seat"
          class="circle"
          :class="{ occupiedColor: isSeatOccupied(seat) }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* =========================
   CARD GEOMETRY (LOCKED)
   ========================= */

.main-wrapper {
  width: 240px;
  height: 78px;

  background: linear-gradient(135deg, #1a1a1a 0%, #252525 100%);
  border: 1px solid #333;
  border-radius: 10px;

  padding: 6px 10px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 4px;

  transition: border-color 0.2s, box-shadow 0.2s;
}

.main-wrapper:hover {
  border-color: #ffc300;
  box-shadow: 0 4px 12px rgba(255, 195, 0, 0.15);
}

/* =========================
   HEADER
   ========================= */

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;

  font-size: 13px;
  line-height: 1.2;
  color: #fff;
}

.title {
  font-family: "Montserrat-Bold";
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table-status {
  background-color: rgba(255, 195, 0, 0.15);
  color: #ffc300;
  font-family: "Montserrat-Light";
  font-size: 10px;
  border: 1px solid rgba(255, 195, 0, 0.3);
  padding: 2px 6px;
  border-radius: 8px;
  white-space: nowrap;
}

/* =========================
   CONTENT
   ========================= */

.content {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Seats NEVER affect layout size */
.seats-wrapper {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  justify-items: center;
}

/* =========================
   SEATS
   ========================= */

.circle {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: #22c55e;
}

.occupiedColor {
  background-color: #1a1a1a;
  border: 1px solid #333;
}

/* =========================
   RESPONSIVE (VISUAL ONLY)
   ========================= */

/* Desktop: slightly bigger dots */
@media (min-width: 1024px) {
  .circle {
    width: 16px;
    height: 16px;
  }
}

/* Mobile: full width cards, still compact */
@media (max-width: 480px) {
  .main-wrapper {
    width: 100%;
    height: 76px;
  }
}
</style>
