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
  background: linear-gradient(135deg, #1a1a1a 0%, #252525 100%);
  border: 1px solid #333;
  padding: 15px;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  transition: all 0.3s;
}

.main-wrapper:hover {
  border-color: #ffc300;
  box-shadow: 0 4px 15px rgba(255, 195, 0, 0.1);
}

.main-wrapper .header {
  display: flex;
  justify-content: space-around;
  position: relative;
  align-items: center;
  grid-gap: 10px;
  font-family: "Montserrat-Bold";
  color: #fff;
}

.header .table-status {
  background-color: rgba(255, 195, 0, 0.15);
  color: #ffc300;
  font-family: "Montserrat-Light";
  font-size: 10px;
  border: 1px solid rgba(255, 195, 0, 0.3);
  padding: 3px 8px;
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
  transition: background-color 0.2s;
}

.occupiedColor {
  background-color: #1a1a1a;
  border: 1px solid #333;
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
