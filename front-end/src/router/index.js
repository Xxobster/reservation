import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";

// Check if admin is authenticated
const isAdminAuthenticated = () => {
  return sessionStorage.getItem("adminAuthenticated") === "true";
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/reservations",
      name: "reservations",
      component: () => import("../views/ReservationsView.vue"),
      meta: { requiresAdmin: true },
    },
    {
      path: "/new-reservation",
      name: "new-reservation",
      component: () => import("../views/NewReservationView.vue"),
      // Public - no auth required
    },
    {
      path: "/menu",
      name: "menu",
      component: () => import("../views/MenuView.vue"),
      // Public - no auth required
    },
    {
      path: "/delivery",
      name: "delivery",
      component: () => import("../views/DeliveryView.vue"),
      // Public - no auth required
    },
    {
      path: "/partners",
      name: "partners",
      component: () => import("../views/PartnersView.vue"),
    },
    {
      path: "/search",
      name: "search",
      component: () => import("../views/SearchView.vue"),
      meta: { requiresAdmin: true },
    },
    {
      path: "/add-table",
      name: "add-table",
      component: () => import("../views/AddTableView.vue"),
      meta: { requiresAdmin: true },
    },
    {
      path: "/admin-settings",
      name: "admin-settings",
      component: () => import("../views/AdminSettingsView.vue"),
      meta: { requiresAdmin: true },
    },
    {
      path: "/guesthouse-deliveries",
      name: "guesthouse-deliveries",
      component: () => import("../views/GuesthouseDeliveriesView.vue"),
      meta: { requiresAdmin: true },
    },
    {
      path: "/about",
      name: "about",
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "notFound",
      component: () => import("../views/NotFoundView.vue"),
    },
  ],
});

// Navigation guard
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAdmin && !isAdminAuthenticated()) {
    // Store the intended destination
    sessionStorage.setItem("intendedRoute", to.fullPath);
    // Redirect to home with a flag to show PIN modal
    next({ name: "home", query: { requirePin: "true", intended: to.name } });
  } else {
    next();
  }
});

export default router;
