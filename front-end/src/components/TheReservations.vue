<script setup>
import TableView from "@/components/TableView.vue";
import ButtonFilled from "@/components/ButtonFilled.vue";
import PopupBox from "@/components/PopupBox.vue";
import EditReservation from "@/components/EditReservation.vue";
import ChooseTable from "@/components/ChooseTable.vue";
import GridContainer from "@/components/GridContainer.vue";
import RestaurantTable from "@/components/RestaurantTable.vue";

import RightArrowIcon from "~icons/ant-design/arrow-right-outlined";
import LeftArrowIcon from "~icons/ant-design/arrow-left-outlined";

import { onIntersect } from "@/utils/intersectObserver";
import reservationAPI from "@/services/reservationAPI";
import tableAPI from "@/services/tableAPI";
import dateNavigator from "@/utils/dateNavigator";

import { ref, computed, onMounted, onUnmounted, watch } from "vue";

const observer = ref({});
const allTablesRef = ref({});

const fields = ref({
  name: "Name",
  phone: "Phone",
  resTime: "Time",
  tableNumber: "Table",
  tableType: "Type",
  seatingType: "Seating",
});

const reservations = ref(null);
const tables = ref(null);
const currDate = ref(dateNavigator.setToday());

// Time slot management (11:00 AM to 9:00 PM - last booking slot)
const timeSlots = [
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00"
];

// Get current time slot (rounded to nearest 30 min)
const getCurrentTimeSlot = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes() >= 30 ? 30 : 0;
  const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  // Return the slot or default to 11:00 if before opening, 21:00 if after last slot
  if (time < "11:00") return "11:00";
  if (time > "21:00") return "21:00";
  return time;
};

const currTime = ref(getCurrentTimeSlot());
const currTimeIndex = computed(() => timeSlots.indexOf(currTime.value));

const freeTables = computed(() => {
  return tables.value ? tables.value.filter((table) => !table.isOccupied) : [];
});

const filterReservations = computed(() => {
  return reservations.value ? reservations.value.filter(
    (reservation) => reservation.resDate === currDate.value
  ) : [];
});

const isPopupOpen = ref(false);
const popupHeaderText = ref("");
const selectedReservation = ref(null);

const getReservations = async () => {
  try {
    const res = await reservationAPI.getReservations();
    reservations.value = res.data.collection;
  } catch (err) {
    console.log(err);
  }
};

const getTables = async () => {
  try {
    const res = await tableAPI.getAllTables(currDate.value, currTime.value);
    tables.value = res.data.collection;
  } catch (err) {
    console.log(err);
  }
};

await getReservations();
await getTables();

// Watch for date/time changes and refresh tables
watch([currDate, currTime], async () => {
  await getTables();
});

const refreshReservations = async (isEditOpen = false) => {
  await getReservations();
  await getTables();
  if (isEditOpen)
    setTimeout(() => {
      isPopupOpen.value = false;
    }, 2000);
};

const refreshTables = async () => {
  await getTables();
  setTimeout(() => {
    isPopupOpen.value = false;
  }, 2000);
};

// Date navigation
const today = () => {
  currDate.value = dateNavigator.setToday();
  currTime.value = getCurrentTimeSlot();
};

const prevDay = () => {
  currDate.value = dateNavigator.setPrevDay(currDate.value);
};

const nextDay = () => {
  currDate.value = dateNavigator.setNextDay(currDate.value);
};

// Time navigation
const prevTime = () => {
  const idx = currTimeIndex.value;
  if (idx > 0) {
    currTime.value = timeSlots[idx - 1];
  }
};

const nextTime = () => {
  const idx = currTimeIndex.value;
  if (idx < timeSlots.length - 1) {
    currTime.value = timeSlots[idx + 1];
  }
};

const setTimeNow = () => {
  currTime.value = getCurrentTimeSlot();
};

const openPopup = (popup) => {
  isPopupOpen.value = popup?.isOpen;
  popupHeaderText.value = popup?.headerText;
};

const assignSelectedReservation = (reservation) => {
  selectedReservation.value = reservation;
};

// callback being called on intersection
const onEnter = () => {
  document.documentElement.style.setProperty("--opacity-val", 1);
  document.documentElement.style.setProperty("--blur-val", 0);
};

// optional callback being called when the targetElement is no longer intersected
const onExit = () => {
  document.documentElement.style.setProperty("--opacity-val", 0);
  document.documentElement.style.setProperty("--blur-val", "5px");
};

onMounted(() => {
  observer.value = onIntersect(allTablesRef.value, onEnter, onExit, true, {
    threshold: 0.2,
  });
});

onUnmounted(() => {
  observer.value.disconnect();
});
</script>

<template>
  <div class="main-wrapper">
    <PopupBox
      :is-open="isPopupOpen"
      :header-text="popupHeaderText"
      :is-closable="true"
      @closeModal="isPopupOpen = false"
    >
      <template #popup-content>
        <EditReservation
          v-if="popupHeaderText === 'Edit Reservation'"
          :reservation="selectedReservation"
          @on-edited="refreshReservations(true)"
        />
        <ChooseTable
          v-else
          :free-tables="freeTables"
          :reservation="selectedReservation"
          @on-chosen="
            refreshTables();
            getReservations();
          "
        />
      </template>
    </PopupBox>
    <div class="header">
      <h1>Reservations</h1>
    </div>
    <div class="content-wrapper">
      <div class="reservations-wrapper">
        <h1>Reservations for {{ currDate }}</h1>
        <div class="date-navigation">
          <LeftArrowIcon class="vector" @click="prevDay()" />
          <ButtonFilled text="Today" @click="today()" />
          <RightArrowIcon class="vector" @click="nextDay()" />
        </div>
        <div class="table-wrapper">
          <TableView
            :fields="fields"
            :collection="filterReservations"
            @onOpen="openPopup"
            @onSelectedReservation="assignSelectedReservation"
            @onCanceledReservation="refreshReservations"
          />
        </div>
      </div>
      <div class="all-tables" ref="allTablesRef">
        <h1>Tables</h1>
        <div class="time-navigation">
          <LeftArrowIcon class="vector time-vector" @click="prevTime()" :class="{ disabled: currTimeIndex <= 0 }" />
          <div class="time-selector">
            <select v-model="currTime" class="time-select">
              <option v-for="slot in timeSlots" :key="slot" :value="slot">{{ slot }}</option>
            </select>
            <ButtonFilled text="Now" @click="setTimeNow()" class="now-btn" />
          </div>
          <RightArrowIcon class="vector time-vector" @click="nextTime()" :class="{ disabled: currTimeIndex >= timeSlots.length - 1 }" />
        </div>
        <p class="time-info">Showing table availability for {{ currDate }} at {{ currTime }}</p>
        <GridContainer :collection="tables">
          <template #card="slotProps">
            <RestaurantTable
              :table="slotProps.item"
            />
          </template>
        </GridContainer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-wrapper {
  background: #000;
  min-height: 100vh;
}

.header {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 100%;
  height: 150px;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  border-bottom: 1px solid #1a1a1a;
}

.header h1 {
  margin-left: var(--x-spacing-mobile);
  font-size: 35px;
  color: #ffc300;
  font-family: "Montserrat-Bold";
  letter-spacing: 2px;
  margin-bottom: 20px;
}

.content-wrapper {
  justify-content: center;
  flex-wrap: wrap;
  align-items: center;
  width: 100%;
  flex-direction: column;
}

.content-wrapper h1 {
  text-align: center;
  margin-bottom: 20px;
  margin-top: 20px;
  color: #fff;
  font-family: "Montserrat-Bold";
}

.reservations-wrapper {
  background-color: #0a0a0a;
  margin-top: 20px;
  margin-left: var(--x-spacing-mobile);
  margin-right: var(--x-spacing-mobile);
  border: 1px solid #1a1a1a;
  border-radius: 10px;
  padding-bottom: 50px;
}

.table-wrapper {
  display: flex;
  justify-content: center;
  align-self: flex-start;
  margin-left: var(--x-spacing-mobile);
  margin-right: var(--x-spacing-mobile);
  align-items: center;
  border-radius: 10px;
  margin-top: 50px;
}

.date-navigation {
  display: flex;
  justify-content: center;
  gap: 50px;
  width: 80%;
  margin: 0 auto;
  align-items: center;
  margin-bottom: 30px;
}

.date-navigation .vector {
  font-size: 80px;
  cursor: pointer;
  transition: 0.2s ease-in;
  color: #ffc300;
}

.all-tables {
  margin-left: var(--x-spacing-mobile);
  margin-right: var(--x-spacing-mobile);
  margin-bottom: 30px;
  transition: all 1.5s;
  filter: blur(var(--blur-val));
  opacity: var(--opacity-val);
}

.all-tables h1 {
  color: #ffc300;
}

.date-navigation .vector:hover {
  color: #e6b000;
}

.button {
  width: 200px;
}

.time-navigation {
  display: flex;
  justify-content: center;
  gap: 20px;
  width: 100%;
  margin: 20px auto;
  align-items: center;
}

.time-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-select {
  padding: 12px 20px;
  font-size: 1.2em;
  font-weight: bold;
  background: #111;
  color: #fff;
  border: 2px solid #333;
  border-radius: 8px;
  cursor: pointer;
  min-width: 120px;
  text-align: center;
  font-family: "Montserrat-Medium";
}

.time-select:focus {
  outline: none;
  border-color: #ffc300;
}

.time-vector {
  font-size: 50px !important;
  transition: 0.2s ease-in;
  color: #ffc300;
}

.time-vector.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.time-vector:not(.disabled):hover {
  color: #e6b000;
  transform: scale(1.1);
}

.now-btn {
  padding: 10px 15px !important;
  font-size: 0.9em !important;
}

.time-info {
  text-align: center;
  color: #999;
  font-size: 1.1em;
  margin-bottom: 20px;
  font-family: "Montserrat-Light";
}

@media screen and (min-width: 1024px) {
  .table-wrapper {
    margin-left: var(--x-spacing-desktop);
    margin-right: var(--x-spacing-desktop);
  }
  .header h1 {
    margin-left: var(--x-spacing-desktop);
    font-size: 45px;
    margin-bottom: 20px;
  }
  .date-navigation {
    width: 50%;
    padding-left: var(--x-spacing-desktop);
    padding-right: var(--x-spacing-desktop);
  }
  .all-tables {
    margin-left: 200px;
    margin-right: 200px;
  }
  .reservations-wrapper {
    margin-left: var(--x-spacing-desktop);
    margin-right: var(--x-spacing-desktop);
  }
}
</style>
