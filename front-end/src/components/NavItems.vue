<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import NavItem from "@/components/NavItem.vue";

import FoodIcon from "~icons/fluent/food-16-filled";
import CardListIcon from "~icons/bi/card-list";
import SearchIcon from "~icons/ant-design/search-outlined";
import PlusIcon from "~icons/akar-icons/plus";
import LockIcon from "~icons/mdi/lock";
import LogoutIcon from "~icons/mdi/logout";

const isAdmin = ref(false);

const checkAuth = () => {
  isAdmin.value = sessionStorage.getItem("adminAuthenticated") === "true";
};

const logout = () => {
  sessionStorage.removeItem("adminAuthenticated");
  isAdmin.value = false;
  window.location.href = "/";
};

onMounted(() => {
  checkAuth();
  // Check auth status periodically
  window.addEventListener("storage", checkAuth);
});

onUnmounted(() => {
  window.removeEventListener("storage", checkAuth);
});
</script>

<template>
  <div class="nav-items">
    <NavItem route-name="reservations" text="Reservations">
      <template #icon>
        <CardListIcon />
      </template>
    </NavItem>
    <NavItem route-name="new-reservation" text="New Reservation">
      <template #icon>
        <FoodIcon />
      </template>
    </NavItem>
    <NavItem route-name="search" text="Search">
      <template #icon>
        <SearchIcon />
      </template>
    </NavItem>
    <NavItem route-name="add-table" text="Add Table">
      <template #icon>
        <PlusIcon />
      </template>
    </NavItem>
    <div v-if="isAdmin" class="logout-btn" @click="logout" title="Logout">
      <LogoutIcon />
      <span>Logout</span>
    </div>
  </div>
</template>

<style scoped>
.nav-items {
  display: flex;
  font-family: "Montserrat-Medium";
  font-weight: normal;
  justify-content: space-around;
  gap: 20px;
  align-items: center;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  color: #ffd700;
  padding: 5px 10px;
  border-radius: 5px;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(255, 215, 0, 0.2);
}

@media screen and (min-width: 1024px) {
  .nav-items {
    gap: 35px;
  }
}
</style>
