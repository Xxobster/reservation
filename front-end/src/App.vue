<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import TheNavbar from "@/components/TheNavbar.vue";
import TheFooter from "@/components/TheFooter.vue";
import PinModal from "@/components/PinModal.vue";

const route = useRoute();
const router = useRouter();
const showPinModal = ref(false);
const intendedRoute = ref(null);

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
  // Navigate to the intended route
  if (intendedRoute.value) {
    router.push({ name: intendedRoute.value });
  }
  intendedRoute.value = null;
};

const onPinCancel = () => {
  showPinModal.value = false;
  intendedRoute.value = null;
};
</script>

<template>
  <div class="wrapper">
    <TheNavbar />
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
