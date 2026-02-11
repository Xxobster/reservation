<script setup>
import { ref, computed, onMounted } from "vue";
import ButtonFilled from "@/components/ButtonFilled.vue";
import { getSettings } from "@/services/settingsAPI";
import { createDelivery } from "@/services/deliveryAPI";
import { getGuesthouseList } from "@/services/guesthouseAPI";

const showPaymentsFullscreen = ref(false);

// Delivery / Pick-up menu
const menuCategories = ref([
  {
    name: "Make your own",
    items: [
      { id: 1, name: "Half French baguette", nameTh: "ขนมปังบาแกตต์ฝรั่งเศสครึ่งก้อน", price: 30000, description: "" },
      { id: 2, name: "Butter (15g)", nameTh: "เนย (15 กรัม)", price: 15000, description: "" },
      { id: 3, name: "Mango Jelly (30g)", nameTh: "วุ้นมะม่วง (30 กรัม)", price: 15000, description: "" },
      { id: 4, name: "Dulce de Leche (30g)", nameTh: "ดุลเซเดเลเช (30 กรัม)", price: 10000, description: "" },
      { id: 5, name: "Plain Yogurt", nameTh: "โยเกิร์ตรสธรรมชาติ", price: 40000, description: "" },
      { id: 6, name: "Choco Cereals", nameTh: "ซีเรียลช็อคโกแลต", price: 55000, description: "" },
      { id: 7, name: "Milk (200mL)", nameTh: "นม (200 มล.)", price: 25000, description: "" },
    ]
  },
  {
    name: "Sunset Aperitif Collection",
    items: [
      { id: 12, name: "Salted Peanuts", nameTh: "ถั่วลิสงคั่วเกลือ", price: 25000, description: "House peanuts, lightly salted & oven-dried to a crisp" },
      { id: 13, name: "Olives Bowl", nameTh: "ชามโอลีฟ", price: 65000, description: "Green pitted olives, lightly marinated" },
      { id: 14, name: "Mozzarella Bowl", nameTh: "ชามมอสซาเรลลา", price: 45000, description: "Cubes in olive oil, lime & mint" },
      { id: 15, name: "Saucisson Bowl — France", nameTh: "ชามซอสซิสซอง — ฝรั่งเศส", price: 60000, description: "Air-dried pork saucisson, hand-sliced" },
    ]
  },
  {
    name: "Sandwiches",
    items: [
      { id: 8, name: "Traditional Pâté Sandwich", nameTh: "แซนด์วิชพาสต้าแบบดั้งเดิม", price: 75000, description: "Pork & liver pâté, house pickles, served in a half French baguette" },
      { id: 9, name: "Chicken Rillettes Sandwich", nameTh: "แซนด์วิชริยองไก่", price: 90000, description: "Slow-cooked rillettes, pickles, served in a half French baguette" },
      { id: 10, name: "Eggplant Caviar with Sweet Paprika Sandwich", nameTh: "แซนด์วิชคาเวียร์มะเขือกับพริกหวาน", price: 90000, description: "Roasted eggplant, paprika & seeds, served in a half French baguette" },
      { id: 11, name: "Green Olive Tapenade Sandwich", nameTh: "แซนด์วิชทาเปนาด์โอลีฟเขียว", price: 115000, description: "A house-crafted green olive tapenade, blended with olive oil, fresh and roasted garlic, lime, and a delicate hint of mustard, served in a half French baguette" },
      { id: 34, name: "Ham, butter and cornichons Sandwich", nameTh: "แซนด์วิชแฮม เนย และคอร์นิชอง", price: 105000, description: "Ham layered with creamy butter and crisp cornichons, served in a half French baguette" },
      { id: 35, name: "Butter and Comté Sandwich", nameTh: "แซนด์วิชเนยและกงเต", price: 150000, description: "Silky butter and aged Comté cheese, simply nestled in a half French baguette" },
    ]
  },
  {
    name: "Platters",
    items: [
      { id: 16, name: "Charcuterie Platter (120g)", nameTh: "จานเนื้อและไส้กรอก (120 กรัม)", price: 190000, description: "House delicatessen, French baguette, pickles & butter" },
      { id: 17, name: "Cheese Platter (100g)", nameTh: "จานชีส (100 กรัม)", price: 265000, description: "Fine French cheeses, French baguette, pickles & butter" },
      { id: 18, name: "Mixed Platter (75g cheese / 100g meat)", nameTh: "จานรวม (ชีส 75 กรัม / เนื้อ 100 กรัม)", price: 320000, description: "Cheeses & delicatessen, French baguette, pickles & butter" },
    ]
  },
  {
    name: "Main Courses",
    items: [
      { id: 19, name: "Slow-Braised Chicken in Dark Beer", nameTh: "ไก่ตุ๋นเบียร์ดำ", price: 150000, description: "Chicken slowly braised in dark beer with Dijon mustard and sautéed onions, served with potatoes" },
      { id: 20, name: "Slow-Braised Pork in Caramel Sauce", nameTh: "หมูตุ๋นซอสคาราเมล", price: 150000, description: "Pieces of Pork simmered in a sweet and savory caramel sauce with toasted peanuts, served with potatoes" },
    ]
  },
  {
    name: "French Wines",
    items: [
      { id: 33, name: "Camille de Labrie – Saint-Émilion (Red, 750 mL)", nameTh: "ไวน์ Camille de Labrie – Saint-Émilion (แดง 750 มล.)", price: 710000, description: "A refined Saint-Émilion with silky tannins, ripe red fruit, subtle spice, and an elegant, lingering finish" },
    ]
  },
  {
    name: "DRINKS",
    items: [
      { id: 36, name: "Choco Shake", nameTh: "ช็อกโกแลตเชค", price: 35000, description: "" },
    ]
  },
  {
    name: "Pizza Baguette",
    items: [
      { id: 21, name: "Pizza Baguette", nameTh: "พิซซ่าบาแกตต์", price: 120000, description: "Crispy French baguette, tomato sauce, mozzarella & oregano" },
      { id: 22, name: "Blue Cheese", nameTh: "เบลูชีส", price: 50000, description: "", isPizzaTopping: true },
      { id: 23, name: "Raclette Cheese", nameTh: "ราคเล็ตชีส", price: 95000, description: "", isPizzaTopping: true },
      { id: 24, name: "Olive Oil", nameTh: "น้ำมันโอลีฟ", price: 30000, description: "", isPizzaTopping: true },
      { id: 25, name: "Olive", nameTh: "โอลีฟ", price: 35000, description: "", isPizzaTopping: true },
      { id: 26, name: "Oignons", nameTh: "หอมใหญ่", price: 10000, description: "", isPizzaTopping: true },
      { id: 27, name: "Potato", nameTh: "มันฝรั่ง", price: 10000, description: "", isPizzaTopping: true },
      { id: 28, name: "Ham", nameTh: "แฮม", price: 45000, description: "", isPizzaTopping: true },
      { id: 29, name: "Bacon", nameTh: "เบคอน", price: 45000, description: "", isPizzaTopping: true },
      { id: 30, name: "Dry Sausage", nameTh: "ไส้กรอกแห้ง", price: 60000, description: "", isPizzaTopping: true },
      { id: 31, name: "Cured Pork", nameTh: "หมูแฮม", price: 60000, description: "", isPizzaTopping: true },
      { id: 32, name: "Reblochon", nameTh: "เรโบลชง", price: 95000, description: "", isPizzaTopping: true },
    ]
  }
]);

const settings = ref({
  whatsappDelivery: "41793917577",
  deliveryEnabled: true,
  pickupEnabled: true,
  deliveryStartTime: "11:00",
  deliveryEndTime: "21:00",
  pickupStartTime: "11:00",
  pickupEndTime: "21:00",
  deliveryFeeGuesthouseLAK: 30000,
  deliveryFeeDeliveryPersonLAK: 20000,
});

onMounted(async () => {
  try {
    const res = await getSettings();
    const d = res.data || {};
    settings.value = {
      whatsappDelivery: (d.whatsappDelivery || "").replace(/\D/g, "") || "41793917577",
      deliveryEnabled: d.deliveryEnabled !== false,
      pickupEnabled: d.pickupEnabled !== false,
      deliveryStartTime: d.deliveryStartTime || "11:00",
      deliveryEndTime: d.deliveryEndTime || "21:00",
      pickupStartTime: d.pickupStartTime || "11:00",
      pickupEndTime: d.pickupEndTime || "21:00",
      deliveryFeeGuesthouseLAK: typeof d.deliveryFeeGuesthouseLAK === "number" ? d.deliveryFeeGuesthouseLAK : 30000,
      deliveryFeeDeliveryPersonLAK: typeof d.deliveryFeeDeliveryPersonLAK === "number" ? d.deliveryFeeDeliveryPersonLAK : 20000,
    };
  } catch (_) {}
  try {
    const ghRes = await getGuesthouseList();
    const list = ghRes.data?.list;
    guesthouseList.value = Array.isArray(list) ? list : [];
  } catch (_) {
    guesthouseList.value = [];
  }
});

const orderType = ref("delivery");
const customerInfo = ref({ name: "", phone: "", guesthouse: "", roomNumber: "", pickupTime: "", notes: "" });
const basket = ref([]);
const guesthouseList = ref([]);
const guesthouseDropdownOpen = ref(false);
let guesthouseDropdownCloseTimer = null;

const filteredGuesthouses = computed(() => {
  const q = (customerInfo.value.guesthouse || "").trim().toLowerCase();
  if (!q) return guesthouseList.value;
  return guesthouseList.value.filter((name) => name.toLowerCase().includes(q));
});

const openGuesthouseDropdown = () => {
  if (guesthouseDropdownCloseTimer) clearTimeout(guesthouseDropdownCloseTimer);
  guesthouseDropdownOpen.value = true;
};

const closeGuesthouseDropdown = () => {
  guesthouseDropdownCloseTimer = setTimeout(() => {
    guesthouseDropdownOpen.value = false;
  }, 200);
};

const selectGuesthouse = (name) => {
  customerInfo.value.guesthouse = name;
  guesthouseDropdownOpen.value = false;
};

function parseTimeToMinutes(hhmm) {
  const [h, m] = (hhmm || "00:00").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}
function isWithinHours(startHhmm, endHhmm) {
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const start = parseTimeToMinutes(startHhmm);
  const end = parseTimeToMinutes(endHhmm);
  if (start <= end) return current >= start && current <= end;
  return current >= start || current <= end;
}

// Current time in minutes since midnight (for pick-up slot filtering)
const nowMinutes = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

// Pick-up time slots: only times from now until 21:00, in 30-min steps (e.g. 19:55 -> 20:00, 20:30, 21:00)
const pickupTimeSlots = computed(() => {
  const current = nowMinutes();
  const slots = [];
  for (let hour = 11; hour <= 21; hour++) {
    for (let min = 0; min < 60; min += 30) {
      if (hour === 21 && min > 0) break;
      const slotMins = hour * 60 + min;
      if (slotMins > current) slots.push(`${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
    }
  }
  return slots;
});

const pickupTimeSlotsEmpty = computed(() => pickupTimeSlots.value.length === 0);

const withinDeliveryHours = computed(() => isWithinHours(settings.value.deliveryStartTime, settings.value.deliveryEndTime));
const withinPickupHours = computed(() => isWithinHours(settings.value.pickupStartTime, settings.value.pickupEndTime));

const deliveryUnavailable = computed(() => orderType.value === "delivery" && !settings.value.deliveryEnabled);
const pickupUnavailable = computed(() => orderType.value === "pickup" && !settings.value.pickupEnabled);
const deliveryOutsideHours = computed(() => orderType.value === "delivery" && settings.value.deliveryEnabled && !withinDeliveryHours.value);
const pickupOutsideHours = computed(() => orderType.value === "pickup" && settings.value.pickupEnabled && !withinPickupHours.value);

const basketDisabled = computed(() => deliveryUnavailable.value || pickupUnavailable.value || deliveryOutsideHours.value || pickupOutsideHours.value);
const showDeliveryHours = computed(() => orderType.value === "delivery" && settings.value.deliveryEnabled);
const showPickupHours = computed(() => orderType.value === "pickup" && settings.value.pickupEnabled);

const formatPrice = (price) => price.toLocaleString() + " LAK";

const showAddedToast = ref(false);
let addedToastTimer = null;

const addToBasket = (item) => {
  if (basketDisabled.value) return;
  if (item.isPizzaTopping && !hasPizzaBaguetteInBasket.value) return;
  const existingItem = basket.value.find(i => i.id === item.id);
  if (existingItem) existingItem.quantity++;
  else basket.value.push({ ...item, quantity: 1 });
  if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
    showAddedToast.value = true;
    if (addedToastTimer) clearTimeout(addedToastTimer);
    addedToastTimer = setTimeout(() => { showAddedToast.value = false; }, 3000);
  }
};

const scrollToBasket = () => {
  document.getElementById("basket-section")?.scrollIntoView({ behavior: "smooth" });
};

const removeFromBasket = (itemId) => {
  const index = basket.value.findIndex(i => i.id === itemId);
  if (index > -1) {
    if (basket.value[index].quantity > 1) basket.value[index].quantity--;
    else basket.value.splice(index, 1);
  }
};

const removeAllFromBasket = (itemId) => {
  basket.value = basket.value.filter(i => i.id !== itemId);
};

const deliveryFeeGuesthouseLAK = computed(() => settings.value.deliveryFeeGuesthouseLAK ?? 30000);
const deliveryFeeDeliveryPersonLAK = computed(() => settings.value.deliveryFeeDeliveryPersonLAK ?? 20000);
const deliveryFeeTotalLAK = computed(() => (deliveryFeeGuesthouseLAK.value || 0) + (deliveryFeeDeliveryPersonLAK.value || 0));

const basketSubtotal = computed(() => basket.value.reduce((total, item) => total + (item.price * item.quantity), 0));
const basketTotal = computed(() =>
  orderType.value === "delivery" ? basketSubtotal.value + deliveryFeeTotalLAK.value : basketSubtotal.value
);
const basketItemCount = computed(() => basket.value.reduce((total, item) => total + item.quantity, 0));

const PIZZA_BAGUETTE_ID = 21;
const hasPizzaBaguetteInBasket = computed(() => basket.value.some((i) => i.id === PIZZA_BAGUETTE_ID));

const canAddTopping = (item) => !item.isPizzaTopping || hasPizzaBaguetteInBasket.value;

const getBasketQty = (itemId) => {
  const entry = basket.value.find((i) => i.id === itemId);
  return entry ? entry.quantity : 0;
};

const isOrderSubmitted = ref(false);
const orderError = ref(null);
const customerLocation = ref(null);
const isRequestingLocation = ref(false);

const submitOrder = () => {
  orderError.value = null;
  if (basket.value.length === 0) { orderError.value = "Please add items to your basket"; return; }
  if (!customerInfo.value.name) { orderError.value = "Please enter your name"; return; }
  if (!customerInfo.value.phone) { orderError.value = "Please enter your phone number"; return; }
  if (orderType.value === "delivery" && !customerInfo.value.guesthouse) { orderError.value = "Please enter your guesthouse/hotel name"; return; }
  if (orderType.value === "delivery") {
    const gh = String(customerInfo.value.guesthouse || "").trim();
    if (!guesthouseList.value.includes(gh)) {
      orderError.value = "Please select your guesthouse from the list (it must match the name as on Google Maps).";
      return;
    }
  }
  if (orderType.value === "delivery" && !customerInfo.value.roomNumber) { orderError.value = "Please enter your room number"; return; }
  if (orderType.value === "pickup") {
    if (!customerInfo.value.pickupTime) { orderError.value = "Please select a pick-up time"; return; }
    const chosenMins = parseTimeToMinutes(customerInfo.value.pickupTime);
    if (chosenMins <= nowMinutes()) { orderError.value = "Pick-up time must be in the future."; return; }
  }
  if (orderType.value === "delivery" && typeof navigator !== "undefined" && navigator.geolocation) {
    isRequestingLocation.value = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        customerLocation.value = loc;
        try { sessionStorage.setItem("deliveryLocation", JSON.stringify(loc)); } catch (_) {}
        isRequestingLocation.value = false;
        isOrderSubmitted.value = true;
      },
      (err) => {
        customerLocation.value = null;
        isRequestingLocation.value = false;
        isOrderSubmitted.value = true;
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
    );
  } else {
    isOrderSubmitted.value = true;
  }
};

// English labels for order section
const ORDER_ITEMS_LABEL_EN = "Order Items:";
const DELIVERY_FEE_LABEL_EN = "Delivery fee:";
const TOTAL_LABEL_EN = "TOTAL:";
// Thai labels (same order details, below the English)
const ORDER_ITEMS_LABEL_TH = "รายการที่สั่ง:";
const DELIVERY_FEE_LABEL_TH = "ค่าส่ง:";
const TOTAL_LABEL_TH = "รวมทั้งสิ้น:";

const ADD_PREFIX_EN = "add ";
const ADD_PREFIX_TH = "เพิ่ม "; // "add" in Thai

const getWhatsAppOrderUrl = () => {
  const nameEn = (item) => (item.isPizzaTopping ? ADD_PREFIX_EN : "") + item.name;
  const nameTh = (item) => (item.isPizzaTopping ? ADD_PREFIX_TH : "") + (item.nameTh != null ? item.nameTh : item.name);
  const itemsListEn = basket.value.map(item => "- " + nameEn(item) + " x" + item.quantity + " = " + formatPrice(item.price * item.quantity)).join("\n");
  const itemsListTh = basket.value.map(item => "- " + nameTh(item) + " x" + item.quantity + " = " + formatPrice(item.price * item.quantity)).join("\n");
  const deliveryLineEn = orderType.value === "delivery" ? "\n" + DELIVERY_FEE_LABEL_EN + " " + formatPrice(deliveryFeeTotalLAK.value) : "";
  const deliveryLineTh = orderType.value === "delivery" ? "\n" + DELIVERY_FEE_LABEL_TH + " " + formatPrice(deliveryFeeTotalLAK.value) : "";
  let deliveryDetails;
  if (orderType.value === "delivery") {
    deliveryDetails = "Guesthouse: " + customerInfo.value.guesthouse + "\nRoom: " + customerInfo.value.roomNumber;
    const loc = customerLocation.value || (() => { try { const s = sessionStorage.getItem("deliveryLocation"); return s ? JSON.parse(s) : null; } catch (_) { return null; } })();
    if (loc && typeof loc.lat === "number" && typeof loc.lng === "number") {
      deliveryDetails += "\n\nhttps://www.google.com/maps?q=" + loc.lat + "," + loc.lng;
    }
  } else {
    deliveryDetails = "Pick-up at restaurant" + (customerInfo.value.pickupTime ? "\nPick-up time: " + customerInfo.value.pickupTime : "");
  }
  const header = "New " + (orderType.value === "delivery" ? "DELIVERY" : "PICK-UP") + " Order\n\nCustomer: " + customerInfo.value.name + "\nPhone: " + customerInfo.value.phone + "\n" + deliveryDetails + (customerInfo.value.notes ? "\nNotes: " + customerInfo.value.notes : "");
  const orderEn = "\n\n" + ORDER_ITEMS_LABEL_EN + "\n" + itemsListEn + deliveryLineEn + "\n\n" + TOTAL_LABEL_EN + " " + formatPrice(basketTotal.value);
  const orderTh = "\n\n" + ORDER_ITEMS_LABEL_TH + "\n" + itemsListTh + deliveryLineTh + "\n\n" + TOTAL_LABEL_TH + " " + formatPrice(basketTotal.value);
  const message = header + orderEn + "\n\n---\n" + orderTh;
  return "https://wa.me/" + (settings.value.whatsappDelivery || "41793917577") + "?text=" + encodeURIComponent(message);
};

const recordDeliveryAndOpenWhatsApp = async () => {
  if (orderType.value === "delivery") {
    const gh = String(customerInfo.value.guesthouse || "").trim();
    if (!guesthouseList.value.includes(gh)) {
      orderError.value = "Please select your guesthouse from the list (it must match the name as on Google Maps).";
      return;
    }
  }
  const url = getWhatsAppOrderUrl();
  if (orderType.value === "delivery") {
    const loc = customerLocation.value || (() => {
      try {
        const s = sessionStorage.getItem("deliveryLocation");
        return s ? JSON.parse(s) : null;
      } catch (_) {
        return null;
      }
    })();
    try {
      await createDelivery({
        guesthouse: customerInfo.value.guesthouse,
        roomNumber: customerInfo.value.roomNumber || null,
        feeGuesthouseLAK: deliveryFeeGuesthouseLAK.value,
        lat: loc && typeof loc.lat === "number" ? loc.lat : null,
        lng: loc && typeof loc.lng === "number" ? loc.lng : null,
        customerName: customerInfo.value.name || null,
        customerPhone: customerInfo.value.phone || null,
        notes: customerInfo.value.notes || null,
      });
    } catch (_) {
      // still open WhatsApp if recording fails
    }
  }
  window.open(url, "_blank");
};

const resetOrder = () => {
  basket.value = [];
  customerInfo.value = { name: "", phone: "", guesthouse: "", roomNumber: "", pickupTime: "", notes: "" };
  customerLocation.value = null;
  try { sessionStorage.removeItem("deliveryLocation"); } catch (_) {}
  isOrderSubmitted.value = false;
  orderError.value = null;
};
</script>

<template>
  <div class="delivery-page">
    <div class="header">
      <img src="/img/logo-white.png?v=2" alt="S&M Bistro" class="logo" />
      <h1 class="title-ananias">Delivery & Pick-up</h1>
      <p class="subtitle">Order delicious food for delivery to your guesthouse or pick-up at S&M Bistro</p>
    </div>

    <div v-if="showAddedToast" class="added-toast">Added to basket (end of page)</div>

    <button type="button" class="basket-fab" aria-label="Go to basket" @click="scrollToBasket">
      <span class="basket-fab-icon">🛒</span>
      <span v-if="basketItemCount > 0" class="basket-fab-count">{{ basketItemCount }}</span>
    </button>

    <div class="order-type-section">
      <div class="order-type-btn" :class="{ active: orderType === 'delivery' }" @click="orderType = 'delivery'">
        <span class="icon">🛵</span><span>Delivery</span>
      </div>
      <div class="order-type-btn" :class="{ active: orderType === 'pickup' }" @click="orderType = 'pickup'">
        <span class="icon">🏪</span><span>Pick-up</span>
      </div>
    </div>

    <div v-if="deliveryUnavailable" class="unavailable-banner">
      <p>No Delivery possible at the moment.</p>
    </div>
    <div v-else-if="pickupUnavailable" class="unavailable-banner">
      <p>No Pick-up possible at the moment.</p>
    </div>
    <div v-else-if="showDeliveryHours" class="hours-banner">
      <p>Delivery hours: {{ settings.deliveryStartTime }} – {{ settings.deliveryEndTime }}</p>
      <p v-if="deliveryOutsideHours" class="outside-hours">Outside these hours you cannot add items to the basket.</p>
    </div>
    <div v-else-if="showPickupHours" class="hours-banner">
      <p>Pick-up hours: {{ settings.pickupStartTime }} – {{ settings.pickupEndTime }}</p>
      <p v-if="pickupOutsideHours" class="outside-hours">Outside these hours you cannot add items to the basket.</p>
    </div>
    
    <div v-if="orderType === 'pickup'" class="delivery-info">
      <img src="/img/qr-location.png" alt="Pick-up location" class="location-qr" />
      <p>Pick-up location</p>
      <a href="https://maps.app.goo.gl/83RVXvTnMWdtGhQc6" target="_blank" rel="noopener noreferrer" class="maps-link">Google Maps Location</a>
    </div>

    <div class="content-wrapper">
      <div class="menu-section">
        <h2>Our Menu</h2>
        <div v-for="category in menuCategories" :key="category.name" class="menu-category">
          <h3>{{ category.name }}</h3>
          <div class="menu-items">
            <div v-for="item in category.items" :key="item.id" class="menu-item" :class="{ 'topping-disabled': item.isPizzaTopping && !hasPizzaBaguetteInBasket, 'in-basket': getBasketQty(item.id) > 0 }">
              <div class="item-info">
                <div class="item-name">{{ (item.isPizzaTopping || (category.name === 'Pizza Baguette' && item.id !== 21)) ? 'add ' + item.name : item.name }}</div>
                <div v-if="item.description" class="item-description">{{ item.description }}</div>
                <p v-else-if="item.isPizzaTopping && !hasPizzaBaguetteInBasket" class="topping-hint">Add Pizza Baguette to basket first</p>
                <div class="item-price">{{ formatPrice(item.price) }}</div>
              </div>
              <div class="add-cell">
                <button type="button" class="add-btn" :disabled="!canAddTopping(item) || basketDisabled" @click="addToBasket(item)">+</button>
                <span v-if="getBasketQty(item.id) > 0" class="item-qty">{{ getBasketQty(item.id) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="basket-section" class="basket-section">
        <div class="basket-header">
          <h2>Your Basket</h2>
          <span class="item-count" v-if="basketItemCount > 0">{{ basketItemCount }} items</span>
        </div>

        <div v-if="basket.length === 0" class="empty-basket">
          <p>Your basket is empty</p>
          <p class="hint">Add items from the menu</p>
        </div>

        <div v-else class="basket-items">
          <div v-for="item in basket" :key="item.id" class="basket-item">
            <div class="basket-item-info">
              <div class="basket-item-name">{{ item.name }}</div>
              <div class="basket-item-price">{{ formatPrice(item.price * item.quantity) }}</div>
            </div>
            <div class="quantity-controls">
              <button class="qty-btn" @click="removeFromBasket(item.id)">-</button>
              <span class="quantity">{{ item.quantity }}</span>
              <button class="qty-btn" @click="addToBasket(item)">+</button>
              <button class="remove-btn" @click="removeAllFromBasket(item.id)">×</button>
            </div>
          </div>

          <div v-if="orderType === 'delivery'" class="basket-fee-lines">
            <div class="basket-fee-line">
              <span>Delivery fee (guesthouse)</span>
              <span class="fee-price">{{ formatPrice(deliveryFeeGuesthouseLAK) }}</span>
            </div>
            <div class="basket-fee-line">
              <span>Delivery fee (delivery person)</span>
              <span class="fee-price">{{ formatPrice(deliveryFeeDeliveryPersonLAK) }}</span>
            </div>
          </div>

          <div class="basket-total">
            <span>Total:</span>
            <span class="total-price">{{ formatPrice(basketTotal) }}</span>
          </div>

          <p v-if="orderType === 'delivery'" class="cash-delivery-only">💵 Cash on Delivery ONLY</p>

          <div class="customer-form">
            <h3>Your Details</h3>
            <input type="text" v-model="customerInfo.name" placeholder="Your Name *" class="form-input" />
            <input type="tel" v-model="customerInfo.phone" placeholder="Phone Number *" class="form-input" />
            <template v-if="orderType === 'delivery'">
              <div class="select-group guesthouse-combobox">
                <label for="guesthouse-input">Guesthouse / Hotel * (as displayed on Google Maps)</label>
                <input
                  id="guesthouse-input"
                  v-model="customerInfo.guesthouse"
                  type="text"
                  class="form-input"
                  placeholder="Type to search your guesthouse…"
                  autocomplete="off"
                  @focus="openGuesthouseDropdown"
                  @blur="closeGuesthouseDropdown"
                />
                <div v-if="guesthouseDropdownOpen && filteredGuesthouses.length > 0" class="guesthouse-dropdown">
                  <button
                    v-for="name in filteredGuesthouses"
                    :key="name"
                    type="button"
                    class="guesthouse-option"
                    @mousedown.prevent="selectGuesthouse(name)"
                  >
                    {{ name }}
                  </button>
                </div>
                <p v-if="guesthouseDropdownOpen && filteredGuesthouses.length === 0" class="guesthouse-no-match">No matching guesthouse. Add it in Admin Settings if needed.</p>
              </div>
            </template>
            <input v-if="orderType === 'delivery'" type="text" v-model="customerInfo.roomNumber" placeholder="Room Number *" class="form-input" />
            <div v-if="orderType === 'pickup'" class="select-group time-select">
              <label for="pickup-time">Pick-up time *</label>
              <p v-if="pickupTimeSlotsEmpty" class="pickup-no-slots">No pick-up slots left for today. Last slot is 21:00.</p>
              <select v-else id="pickup-time" v-model="customerInfo.pickupTime" class="form-input form-select">
                <option value="" disabled>Select time...</option>
                <option v-for="time in pickupTimeSlots" :key="time" :value="time">{{ time }}</option>
              </select>
            </div>
            <textarea v-model="customerInfo.notes" placeholder="Special requests (optional)" class="form-input" rows="2"></textarea>
          </div>

          <div v-if="orderError" class="error-message">{{ orderError }}</div>

          <div v-if="isOrderSubmitted" class="order-confirmed">
            <div class="success-icon">✓</div>
            <h3>Order Ready to Send!</h3>
            <p>Click the button below to send your order via WhatsApp:</p>
            <p v-if="orderType === 'delivery' && !customerLocation" class="location-tip">Location was not shared. Use this site over HTTPS and allow location when prompted to include a map link for delivery.</p>
            <button type="button" class="whatsapp-order-btn" @click="recordDeliveryAndOpenWhatsApp">📱 Send Order via WhatsApp</button>
            <button class="new-order-btn" @click="resetOrder">Start New Order</button>
          </div>

          <ButtonFilled v-else :text="isRequestingLocation ? 'Getting location...' : 'Place Order'" :disabled="isRequestingLocation" @click="submitOrder" class="place-order-btn" />
        </div>
      </div>
    </div>

    <div class="payment-info">
      <h3>Payment Options</h3>
      <template v-if="orderType === 'delivery'">
        <p>💵 Cash on Delivery ONLY</p>
      </template>
      <template v-else>
        <p>💵 Cash on Pick-up</p>
        <p>📱 BCEL / LDB QR Code</p>
        <p>💳 Revolut / Wise (+5% surcharge)</p>
        <img
          src="/img/payments.png"
          alt="Payment methods"
          class="payments-img payments-img-clickable"
          role="button"
          tabindex="0"
          @click="showPaymentsFullscreen = true"
          @keydown.enter="showPaymentsFullscreen = true"
        />
        <p class="payment-img-hint">Tap image to view full screen</p>
      </template>
    </div>

    <div class="contact-whatsapp-section">
      <p class="contact-whatsapp-text">For questions or special enquiries, please contact us on Whatsapp.</p>
      <a
        :href="'https://wa.me/' + (settings.whatsappDelivery || '41793917577')"
        target="_blank"
        rel="noopener noreferrer"
        class="whatsapp-contact-btn"
        aria-label="Contact us on WhatsApp"
      >
        <span class="whatsapp-contact-icon">💬</span>
        <span>Chat on WhatsApp</span>
      </a>
    </div>

    <!-- Fullscreen overlay for payment image (mobile-friendly) -->
    <Teleport to="body">
      <Transition name="payments-fade">
        <div
          v-if="showPaymentsFullscreen"
          class="payments-fullscreen"
          role="dialog"
          aria-label="Payment options full screen"
          @click.self="showPaymentsFullscreen = false"
        >
          <button
            type="button"
            class="payments-fullscreen-close"
            aria-label="Close"
            @click="showPaymentsFullscreen = false"
          >
            ×
          </button>
          <img
            src="/img/payments.png"
            alt="Payment methods"
            class="payments-fullscreen-img"
            @click.stop
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.delivery-page { max-width: 1200px; margin: 0 auto; padding: 20px; background: #000; }
.header { text-align: center; margin-bottom: 30px; }
.logo { max-width: 200px; margin-bottom: 20px; }
.header h1 { font-size: 2em; margin-bottom: 10px; color: #ffc300; text-transform: uppercase; letter-spacing: 3px; }
.header h1.title-ananias { font-family: "Ananias", Georgia, serif; }
.subtitle { font-family: "Montserrat-LightItalic"; font-style: italic; color: #888; font-size: 1em; }
.order-type-section { display: flex; justify-content: center; gap: 20px; margin-bottom: 20px; }
.order-type-btn { display: flex; flex-direction: column; align-items: center; padding: 20px 40px; background: #111; border-radius: 12px; cursor: pointer; transition: all 0.3s; border: 2px solid #222; }
.order-type-btn:hover { background: #1a1a1a; border-color: #333; }
.order-type-btn.active { border-color: #ffc300; background: rgba(255, 195, 0, 0.1); }
.order-type-btn .icon { font-size: 2em; margin-bottom: 10px; }
.delivery-info { text-align: center; margin-bottom: 30px; padding: 20px; background: #0a0a0a; border-radius: 10px; }
.location-qr { width: 100px; height: 100px; background: white; padding: 5px; border-radius: 8px; margin-bottom: 10px; }
.delivery-info p { font-family: "Montserrat-LightItalic"; color: #888; }
.delivery-info .maps-link { display: block; margin-top: 8px; font-family: "Montserrat-Medium"; color: #ffc300; text-decoration: none; }
.delivery-info .maps-link:hover { text-decoration: underline; }
.unavailable-banner { text-align: center; padding: 20px; margin-bottom: 20px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 10px; }
.unavailable-banner p { margin: 0; font-family: "Montserrat-Medium"; color: #fca5a5; font-size: 1.1rem; }
.hours-banner { text-align: center; padding: 16px; margin-bottom: 20px; background: #0a0a0a; border: 1px solid #222; border-radius: 10px; }
.hours-banner p { margin: 0 0 6px 0; font-family: "Montserrat-Medium"; color: #ccc; font-size: 0.95rem; }
.hours-banner p:last-child { margin-bottom: 0; }
.hours-banner .outside-hours { color: #888; font-size: 0.9rem; }
.content-wrapper { display: grid; grid-template-columns: 1fr; gap: 30px; }
@media screen and (min-width: 768px) { .content-wrapper { grid-template-columns: 1fr 400px; } }
.menu-section h2 { font-family: "Montserrat-Bold"; margin-bottom: 20px; color: #fff; text-transform: uppercase; letter-spacing: 2px; }
.menu-category { margin-bottom: 30px; }
.menu-category h3 { font-family: "Montserrat-Bold"; color: #ffc300; font-size: 1.2em; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #222; text-transform: uppercase; letter-spacing: 2px; }
.menu-items { display: flex; flex-direction: column; gap: 10px; }
.menu-item { display: flex; justify-content: space-between; align-items: center; background: #0a0a0a; padding: 15px; border-radius: 10px; transition: background 0.2s, border-color 0.2s; border: 1px solid #1a1a1a; }
.menu-item.topping-disabled { opacity: 0.7; }
.menu-item.in-basket { border: 2px solid rgba(255, 195, 0, 0.7); background: rgba(255, 195, 0, 0.08); }
.menu-item.in-basket:hover { background: rgba(255, 195, 0, 0.12); }
.topping-hint { font-family: "Montserrat-LightItalic"; font-size: 0.8em; color: #666; margin: 4px 0 0 0; }
.menu-item:hover { background: #111; border-color: #222; }
.menu-item.in-basket:hover { border-color: rgba(255, 195, 0, 0.85); }
.item-info { flex: 1; padding-right: 15px; }
.item-name { font-family: "Montserrat-Medium"; font-weight: bold; margin-bottom: 5px; color: #fff; }
.item-description { font-family: "Montserrat-LightItalic"; font-style: italic; color: #666; font-size: 0.85em; margin-bottom: 8px; line-height: 1.4; }
.item-price { font-family: "Montserrat-Light"; color: #ffc300; font-weight: bold; }
.add-cell { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.item-qty { font-family: "Montserrat-Light"; color: #ffc300; font-weight: bold; font-size: 1em; min-width: 1.2em; text-align: right; }
.add-btn { width: 40px; height: 40px; border-radius: 50%; background: #ffc300; color: #000; border: none; font-size: 1.5em; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
.add-btn:hover { background: #e6b000; transform: scale(1.1); }
.add-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.add-btn:disabled:hover { background: #ffc300; }
.basket-section { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 15px; padding: 20px; position: sticky; top: 20px; height: fit-content; }
.basket-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.basket-header h2 { font-family: "Montserrat-Bold"; color: #fff; text-transform: uppercase; letter-spacing: 1px; }
.item-count { background: #ffc300; color: #000; padding: 5px 12px; border-radius: 20px; font-size: 0.9em; font-family: "Montserrat-Medium"; }
.empty-basket { text-align: center; padding: 40px 20px; color: #444; }
.empty-basket .hint { font-size: 0.9em; margin-top: 10px; }
.basket-items { display: flex; flex-direction: column; gap: 15px; }
.basket-item { background: #111; padding: 15px; border-radius: 10px; border: 1px solid #1a1a1a; }
.basket-item-info { display: flex; justify-content: space-between; margin-bottom: 10px; }
.basket-item-name { font-family: "Montserrat-Medium"; font-weight: bold; color: #fff; }
.basket-item-price { font-family: "Montserrat-Light"; color: #ffc300; }
.quantity-controls { display: flex; align-items: center; gap: 10px; }
.qty-btn { width: 30px; height: 30px; border-radius: 50%; background: #222; color: white; border: none; font-size: 1.2em; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.qty-btn:hover { background: #333; }
.quantity { min-width: 30px; text-align: center; font-weight: bold; color: #fff; }
.remove-btn { width: 30px; height: 30px; border-radius: 50%; background: #ef4444; color: white; border: none; font-size: 1.2em; cursor: pointer; margin-left: auto; }
.remove-btn:hover { background: #dc2626; }
.basket-fee-lines { border-top: 1px dashed #333; }
.basket-fee-line { display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; background: #0a0a0a; font-family: "Montserrat-Medium"; color: #888; }
.fee-price { color: #ffc300; }
.basket-total { display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #111; border-radius: 10px; font-size: 1.2em; font-weight: bold; border: 1px solid #ffc300; margin-top: 5px; }
.basket-total span { color: #fff; }
.total-price { color: #ffc300 !important; }
.cash-delivery-only { text-align: center; margin-top: 12px; padding: 10px; background: rgba(255, 195, 0, 0.1); border: 1px solid rgba(255, 195, 0, 0.3); border-radius: 8px; color: #ffc300; font-family: "Montserrat-Medium"; font-size: 0.95em; }
.customer-form { margin-top: 20px; }
.customer-form h3 { margin-bottom: 15px; font-family: "Montserrat-Bold"; color: #ffc300; text-transform: uppercase; letter-spacing: 1px; }
.form-input { width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #222; border-radius: 8px; background: #111; color: white; font-size: 1em; box-sizing: border-box; font-family: "Montserrat-Light"; }
.form-input:focus { outline: none; border-color: #ffc300; }
.form-input::placeholder { color: #444; }
.select-group { margin-bottom: 10px; }
.select-group label { display: block; font-family: "Montserrat-Medium"; color: #fff; font-size: 14px; margin-bottom: 8px; }
.select-group .form-select { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23ffc300' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; }
.guesthouse-combobox { position: relative; }
.guesthouse-dropdown {
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  margin-top: 4px;
  max-height: 220px;
  overflow-y: auto;
  background: #111;
  border: 1px solid #333;
  border-radius: 8px;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}
.guesthouse-option {
  display: block;
  width: 100%;
  padding: 10px 12px;
  text-align: left;
  background: none;
  border: none;
  color: #fff;
  font-family: "Montserrat-Light";
  font-size: 1rem;
  cursor: pointer;
}
.guesthouse-option:hover { background: rgba(255, 195, 0, 0.15); color: #ffc300; }
.guesthouse-no-match { margin: 6px 0 0 0; font-size: 0.85rem; color: #888; }
.pickup-no-slots { margin: 0; padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; color: #fca5a5; font-family: "Montserrat-Light"; font-size: 0.95em; }
.error-message { background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #ef4444; padding: 10px; border-radius: 8px; text-align: center; }
.order-confirmed { text-align: center; padding: 20px; background: rgba(255, 195, 0, 0.1); border: 1px solid #ffc300; border-radius: 10px; }
.success-icon { width: 60px; height: 60px; background: #ffc300; color: #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2em; margin: 0 auto 15px; }
.order-confirmed h3 { color: #ffc300; }
.order-confirmed .location-tip { font-size: 0.85em; color: #888; margin: 8px 0 12px; }
.whatsapp-order-btn { display: block; background: #25D366; color: white; padding: 15px 25px; border-radius: 10px; text-decoration: none; font-weight: bold; margin: 15px 0; transition: all 0.2s; font-family: "Montserrat-Medium"; }
.whatsapp-order-btn:hover { background: #128C7E; }
.new-order-btn { background: #222; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; margin-top: 10px; font-family: "Montserrat-Light"; }
.new-order-btn:hover { background: #333; }
.place-order-btn { width: 100%; margin-top: 15px; }

.added-toast { display: none; }
@media screen and (max-width: 767px) {
  .added-toast { display: block; position: fixed; top: 16px; left: 50%; transform: translateX(-50%); background: #ffc300; color: #000; padding: 12px 20px; border-radius: 10px; font-family: "Montserrat-Medium"; font-size: 0.95em; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.3); animation: toastFade 0.3s ease; }
}
@keyframes toastFade { from { opacity: 0; transform: translateX(-50%) translateY(-10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

.basket-fab { display: none; }
@media screen and (max-width: 767px) {
  .basket-fab { display: flex; position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px; border-radius: 50%; background: #ffc300; color: #000; border: none; cursor: pointer; align-items: center; justify-content: center; z-index: 999; box-shadow: 0 4px 16px rgba(255, 195, 0, 0.4); transition: transform 0.2s; }
  .basket-fab:hover { transform: scale(1.08); }
  .basket-fab:active { transform: scale(0.98); }
  .basket-fab-icon { font-size: 1.6em; }
  .basket-fab-count { position: absolute; top: -4px; right: -4px; min-width: 22px; height: 22px; background: #000; color: #ffc300; border-radius: 50%; font-size: 0.75em; font-weight: bold; display: flex; align-items: center; justify-content: center; }
}
.payment-info { margin-top: 40px; padding: 30px; background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 15px; text-align: center; }
.payment-info h3 { margin-bottom: 20px; font-family: "Montserrat-Bold"; color: #ffc300; text-transform: uppercase; letter-spacing: 2px; }
.payment-info p { margin: 10px 0; color: #888; font-family: "Montserrat-Light"; }

.contact-whatsapp-section {
  margin-top: 30px;
  padding: 24px;
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 15px;
  text-align: center;
}
.contact-whatsapp-text { margin: 0 0 16px 0; color: #ccc; font-family: "Montserrat-Light"; font-size: 1rem; }
.whatsapp-contact-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  background: #25D366;
  color: #fff;
  text-decoration: none;
  border-radius: 10px;
  font-family: "Montserrat-Medium";
  font-size: 1rem;
  transition: background 0.2s;
}
.whatsapp-contact-btn:hover { background: #128C7E; color: #fff; }
.whatsapp-contact-icon { font-size: 1.4em; }
.payments-img { max-width: 300px; margin-top: 20px; border-radius: 10px; }
.payments-img-clickable { cursor: pointer; display: inline-block; }
.payments-img-clickable:hover { opacity: 0.9; }
.payment-img-hint { font-size: 0.85em; color: #666; margin-top: 8px; }

.payments-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px 20px 20px;
  box-sizing: border-box;
  overflow: auto;
}
.payments-fullscreen-close {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 10000;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: #ffc300;
  color: #000;
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-shadow: 0 2px 12px rgba(0,0,0,0.4);
}
.payments-fullscreen-close:hover { background: #e6b000; }
.payments-fullscreen-img {
  max-width: 100%;
  max-height: 100%;
  height: auto;
  width: auto;
  object-fit: contain;
  border-radius: 10px;
}
@media screen and (max-width: 767px) {
  .payments-fullscreen { padding: 56px 16px 16px; }
  .payments-fullscreen-close { top: 10px; right: 10px; width: 48px; height: 48px; font-size: 2rem; }
}
.payments-fade-enter-active,
.payments-fade-leave-active { transition: opacity 0.2s ease; }
.payments-fade-enter-from,
.payments-fade-leave-to { opacity: 0; }
</style>
