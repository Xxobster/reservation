<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import NavItem from "@/components/NavItem.vue";

import FoodIcon from "~icons/fluent/food-16-filled";
import CardListIcon from "~icons/bi/card-list";
import SearchIcon from "~icons/ant-design/search-outlined";
import PlusIcon from "~icons/akar-icons/plus";
import LogoutIcon from "~icons/mdi/logout";
import LoginIcon from "~icons/mdi/login";
import DeliveryIcon from "~icons/mdi/truck-delivery";
import HandshakeIcon from "~icons/mdi/handshake";

const props = defineProps({
  /** When provided by App.vue, navbar updates immediately on PIN success without refresh */
  adminAuthenticated: { type: Boolean, default: undefined },
});

const router = useRouter();

const isAdminFromStorage = ref(false);
const checkAuth = () => {
  isAdminFromStorage.value = sessionStorage.getItem("adminAuthenticated") === "true";
};

// Use parent state when provided (updates on PIN success); otherwise fall back to sessionStorage
const isAdmin = computed(() =>
  props.adminAuthenticated !== undefined ? props.adminAuthenticated : isAdminFromStorage.value
);

const logout = () => {
  sessionStorage.removeItem("adminAuthenticated");
  window.location.href = "/";
};

const showLogin = () => {
  router.push({ name: "home", query: { requirePin: "true" } });
};

onMounted(() => {
  checkAuth();
  window.addEventListener("storage", checkAuth);
});

onUnmounted(() => {
  window.removeEventListener("storage", checkAuth);
});
</script>

<template>
  <div class="nav-items">
    <!-- Admin only links -->
    <NavItem v-if="isAdmin" route-name="reservations" text="Reservations">
      <template #icon>
        <CardListIcon />
      </template>
    </NavItem>
    
    <!-- Delivery/Pick-up - Public -->
    <NavItem route-name="delivery" text="Delivery/Pick-up">
      <template #icon>
        <DeliveryIcon />
      </template>
    </NavItem>
    
    <!-- New Reservation - Public -->
    <NavItem route-name="new-reservation" text="New Reservation">
      <template #icon>
        <FoodIcon />
      </template>
    </NavItem>

    <!-- Our Partners - Public -->
    <NavItem route-name="partners" text="Our Partners">
      <template #icon>
        <HandshakeIcon />
      </template>
    </NavItem>
    
    <!-- Admin only links -->
    <NavItem v-if="isAdmin" route-name="search" text="Search">
      <template #icon>
        <SearchIcon />
      </template>
    </NavItem>
    <NavItem v-if="isAdmin" route-name="add-table" text="Add Table">
      <template #icon>
        <PlusIcon />
      </template>
    </NavItem>
    
    <!-- Login/Logout button -->
    <div v-if="isAdmin" class="auth-btn logout" @click="logout" title="Logout">
      <LogoutIcon />
      <span>Logout</span>
    </div>
    <div v-else class="auth-btn login" @click="showLogin" title="Admin Login">
      <LoginIcon />
      <span>Login</span>
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

.auth-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  padding: 5px 12px;
  border-radius: 5px;
  transition: all 0.2s;
  font-size: 0.9em;
}

.auth-btn.logout {
  color: #ffc300;
  border: 1px solid #ffc300;
}

.auth-btn.logout:hover {
  background: rgba(255, 195, 0, 0.2);
}

.auth-btn.login {
  color: #ffc300;
  border: 1px solid #ffc300;
}

.auth-btn.login:hover {
  background: rgba(255, 195, 0, 0.2);
}

@media screen and (min-width: 1024px) {
  .nav-items {
    gap: 35px;
  }
}
</style>
