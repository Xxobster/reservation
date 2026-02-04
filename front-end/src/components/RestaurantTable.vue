<script setup>
import { computed } from "vue";

const props = defineProps({
  table: Object,
});

const cssProps = computed(() => {
  return {
    "--columns": props.table.capacity,
  };
});

// Get the number of booked seats (occupied)
const bookedSeats = computed(() => {
  return parseInt(props.table?.bookedSeats) || 0;
});

// Check if a specific seat is occupied
const isSeatOccupied = (seatIndex) => {
  return seatIndex <= bookedSeats.value;
};

// Check if table has any occupied seats
const hasOccupiedSeats = computed(() => {
  return bookedSeats.value > 0;
});
</script>
<template>
  <div class="main-wrapper">
    <div class="header">
      <div>{{ props.table?.name }}</div>
      <div class="table-status" v-show="hasOccupiedSeats">{{ bookedSeats }}/{{ props.table?.capacity }} Occupied</div>
    </div>
    <div class="content">
      <div class="seats-wrapper" :style="cssProps">
        <div
          class="circle"
          :class="{ occupiedColor: isSeatOccupied(seat) }"
          v-for="seat in props.table?.capacity"
          :key="seat"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-wrapper {
  background-color: var(--primary-red);
  padding: 10px;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  transition: all 1.5s;
}
.main-wrapper .header {
  display: flex;
  justify-content: space-around;
  position: relative;
  align-items: center;
  grid-gap: 10px;
  font-family: "Inter-Bold";
  color: var(--primary-white);
}
.header .table-status {
  background-color: transparent;
  color: var(--primary-black);
  font-family: "Inter-Light";
  font-size: 10px;
  border: 1px solid var(--primary-black);
  padding-left: 5px;
  padding-right: 5px;
  border-radius: 10px;
}
.content {
  display: flex;
  justify-content: center;
  align-items: center;
}

.seats-wrapper {
  margin-top: 15px;
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
  gap: 10px;
  align-items: center;
  width: 80%;
  flex-wrap: wrap;
}

.circle {
  width: 15px;
  height: 15px;
  background-color: #22c55e;
  border-radius: 100%;
}
.occupiedColor {
  background-color: #1a1a1a;
}

@media screen and (min-width: 1024px) {
  .seats-wrapper {
    margin-top: 20px;
    width: 40%;
    margin-bottom: 20px;
  }
  .circle {
    width: 20px;
    height: 20px;
  }
}
</style>
