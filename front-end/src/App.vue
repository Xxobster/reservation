<script setup>
import { ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import TheNavbar from "@/components/TheNavbar.vue";
import TheFooter from "@/components/TheFooter.vue";
import PinModal from "@/components/PinModal.vue";

const route = useRoute();
const router = useRouter();
const showPinModal = ref(false);
const intendedRoute = ref(null);

// Single source of truth for admin state so navbar updates immediately on PIN success
const adminAuthenticated = ref(false);

const syncAdminFromStorage = () => {
  adminAuthenticated.value = sessionStorage.getItem("adminAuthenticated") === "true";
};

onMounted(() => {
  syncAdminFromStorage();
});

// Watch for PIN requirement in query
watch(
  () => route.query.requirePin,
  (requirePin) => {
    if (requirePin === "true") {
      intendedRoute.value = route.query.intended;
      showPinModal.value = true;
      // Clean up the URL
      router.replace({ query: {} });
    }
  },
  { immediate: true }
);

const onPinSuccess = () => {
  showPinModal.value = false;
  const goTo = intendedRoute.value;
  intendedRoute.value = null;
  // Full reload so navbar remounts and reads sessionStorage → admin links appear
  if (goTo) {
    const href = router.resolve({ name: goTo }).href;
    setTimeout(() => { window.location.assign(href); }, 100);
  } else {
    setTimeout(() => { window.location.reload(); }, 100);
  }
};

const onPinCancel = () => {
  showPinModal.value = false;
  intendedRoute.value = null;
};
</script>

<template>
  <div class="wrapper">
    <TheNavbar :admin-authenticated="adminAuthenticated" />
    <main>
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" :key="$route.name" />
        </Transition>
      </RouterView>
    </main>
    <TheFooter />
    
    <!-- PIN Modal for Admin Access -->
    <PinModal
      :is-open="showPinModal"
      @on-success="onPinSuccess"
      @on-cancel="onPinCancel"
    />
  </div>
</template>

<style scoped>
.wrapper {
  min-height: 100vh;
  background: #000;
}
main {
  background-color: #000;
  margin-top: var(--top-spacing);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease-out;
}
</style>
