<script setup>
import { ref, computed } from "vue";
import ButtonFilled from "@/components/ButtonFilled.vue";

// Delivery / Pick-up menu
const menuCategories = ref([
  {
    name: "Make your own",
    items: [
      { id: 1, name: "Half French baguette", price: 30000, description: "" },
      { id: 2, name: "Butter (15g)", price: 15000, description: "" },
      { id: 3, name: "Mango Jelly (30g)", price: 15000, description: "" },
      { id: 4, name: "Dulce de Leche (30g)", price: 10000, description: "" },
      { id: 5, name: "Plain Yogurt", price: 40000, description: "" },
      { id: 6, name: "Choco Cereals", price: 55000, description: "" },
      { id: 7, name: "Milk (200mL)", price: 25000, description: "" },
    ]
  },
  {
    name: "Sunset Aperitif Collection",
    items: [
      { id: 12, name: "Salted Peanuts", price: 25000, description: "House peanuts, lightly salted & oven-dried to a crisp" },
      { id: 13, name: "Olives Bowl", price: 65000, description: "Green pitted olives, lightly marinated" },
      { id: 14, name: "Mozzarella Bowl", price: 45000, description: "Cubes in olive oil, lime & mint" },
      { id: 15, name: "Saucisson Bowl — France", price: 60000, description: "Air-dried pork saucisson, hand-sliced" },
    ]
  },
  {
    name: "Sandwiches",
    items: [
      { id: 8, name: "Traditional Pâté Sandwich", price: 75000, description: "Pork & liver pâté, house pickles, served in a half French baguette" },
      { id: 9, name: "Chicken Rillettes Sandwich", price: 90000, description: "Slow-cooked rillettes, pickles, served in a half French baguette" },
      { id: 10, name: "Eggplant Caviar with Sweet Paprika Sandwich", price: 90000, description: "Roasted eggplant, paprika & seeds, served in a half French baguette" },
      { id: 11, name: "Green Olive Tapenade Sandwich", price: 115000, description: "A house-crafted green olive tapenade, blended with olive oil, fresh and roasted garlic, lime, and a delicate hint of mustard, served in a half French baguette" },
      { id: 34, name: "Ham, butter and cornichons Sandwich", price: 105000, description: "Ham layered with creamy butter and crisp cornichons, served in a half French baguette" },
      { id: 35, name: "Butter and Comté Sandwich", price: 150000, description: "Silky butter and aged Comté cheese, simply nestled in a half French baguette" },
    ]
  },
  {
    name: "Platters",
    items: [
      { id: 16, name: "Charcuterie Platter (120g)", price: 190000, description: "House delicatessen, French baguette, pickles & butter" },
      { id: 17, name: "Cheese Platter (100g)", price: 265000, description: "Fine French cheeses, French baguette, pickles & butter" },
      { id: 18, name: "Mixed Platter (75g cheese / 100g meat)", price: 320000, description: "Cheeses & delicatessen, French baguette, pickles & butter" },
    ]
  },
  {
    name: "Main Courses",
    items: [
      { id: 19, name: "Slow-Braised Chicken in Dark Beer", price: 150000, description: "Chicken slowly braised in dark beer with Dijon mustard and sautéed onions, served with potatoes" },
      { id: 20, name: "Slow-Braised Pork in Caramel Sauce", price: 150000, description: "Pieces of Pork simmered in a sweet and savory caramel sauce with toasted peanuts, served with potatoes" },
    ]
  },
  {
    name: "French Wines",
    items: [
      { id: 33, name: "Camille de Labrie – Saint-Émilion (Red, 750 mL)", price: 710000, description: "A refined Saint-Émilion with silky tannins, ripe red fruit, subtle spice, and an elegant, lingering finish" },
    ]
  },
  {
    name: "Pizza Baguette",
    items: [
      { id: 21, name: "Pizza Baguette", price: 120000, description: "Crispy French baguette, tomato sauce, mozzarella & oregano" },
      { id: 22, name: "Blue Cheese", price: 50000, description: "", isPizzaTopping: true },
      { id: 23, name: "Raclette Cheese", price: 95000, description: "", isPizzaTopping: true },
      { id: 24, name: "Olive Oil", price: 30000, description: "", isPizzaTopping: true },
      { id: 25, name: "Olive", price: 35000, description: "", isPizzaTopping: true },
      { id: 26, name: "Oignons", price: 10000, description: "", isPizzaTopping: true },
      { id: 27, name: "Potato", price: 10000, description: "", isPizzaTopping: true },
      { id: 28, name: "Ham", price: 45000, description: "", isPizzaTopping: true },
      { id: 29, name: "Bacon", price: 45000, description: "", isPizzaTopping: true },
      { id: 30, name: "Dry Sausage", price: 60000, description: "", isPizzaTopping: true },
      { id: 31, name: "Cured Pork", price: 60000, description: "", isPizzaTopping: true },
      { id: 32, name: "Reblochon", price: 95000, description: "", isPizzaTopping: true },
    ]
  }
]);

const orderType = ref("delivery");
const customerInfo = ref({ name: "", phone: "", guesthouse: "", roomNumber: "", notes: "" });
const basket = ref([]);

const formatPrice = (price) => price.toLocaleString() + " LAK";

const showAddedToast = ref(false);
let addedToastTimer = null;

const addToBasket = (item) => {
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

const DELIVERY_FEE_LAK = 50000;

const basketSubtotal = computed(() => basket.value.reduce((total, item) => total + (item.price * item.quantity), 0));
const basketTotal = computed(() =>
  orderType.value === "delivery" ? basketSubtotal.value + DELIVERY_FEE_LAK : basketSubtotal.value
);
const basketItemCount = computed(() => basket.value.reduce((total, item) => total + item.quantity, 0));

const PIZZA_BAGUETTE_ID = 21;
const hasPizzaBaguetteInBasket = computed(() => basket.value.some((i) => i.id === PIZZA_BAGUETTE_ID));

const canAddTopping = (item) => !item.isPizzaTopping || hasPizzaBaguetteInBasket.value;

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
  if (orderType.value === "delivery" && !customerInfo.value.roomNumber) { orderError.value = "Please enter your room number"; return; }
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

const getWhatsAppOrderUrl = () => {
  const itemsList = basket.value.map(item => "- " + item.name + " x" + item.quantity + " = " + formatPrice(item.price * item.quantity)).join("\n");
  const deliveryLine = orderType.value === "delivery" ? "\nDelivery fee: " + formatPrice(DELIVERY_FEE_LAK) : "";
  let deliveryDetails;
  if (orderType.value === "delivery") {
    deliveryDetails = "Guesthouse: " + customerInfo.value.guesthouse + "\nRoom: " + customerInfo.value.roomNumber;
    const loc = customerLocation.value || (() => { try { const s = sessionStorage.getItem("deliveryLocation"); return s ? JSON.parse(s) : null; } catch (_) { return null; } })();
    if (loc && typeof loc.lat === "number" && typeof loc.lng === "number") {
      deliveryDetails += "\n\nhttps://www.google.com/maps?q=" + loc.lat + "," + loc.lng;
    }
  } else {
    deliveryDetails = "Pick-up at restaurant";
  }
  const message = "New " + (orderType.value === "delivery" ? "DELIVERY" : "PICK-UP") + " Order\n\nCustomer: " + customerInfo.value.name + "\nPhone: " + customerInfo.value.phone + "\n" + deliveryDetails + (customerInfo.value.notes ? "\nNotes: " + customerInfo.value.notes : "") + "\n\nOrder Items:\n" + itemsList + deliveryLine + "\n\nTOTAL: " + formatPrice(basketTotal.value);
  return "https://wa.me/41793917577?text=" + encodeURIComponent(message);
};

const resetOrder = () => {
  basket.value = [];
  customerInfo.value = { name: "", phone: "", guesthouse: "", roomNumber: "", notes: "" };
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
            <div v-for="item in category.items" :key="item.id" class="menu-item" :class="{ 'topping-disabled': item.isPizzaTopping && !hasPizzaBaguetteInBasket }">
              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
                <div v-if="item.description" class="item-description">{{ item.description }}</div>
                <p v-else-if="item.isPizzaTopping && !hasPizzaBaguetteInBasket" class="topping-hint">Add Pizza Baguette to basket first</p>
                <div class="item-price">{{ formatPrice(item.price) }}</div>
              </div>
              <button type="button" class="add-btn" :disabled="!canAddTopping(item)" @click="addToBasket(item)">+</button>
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

          <div v-if="orderType === 'delivery'" class="basket-fee-line">
            <span>Delivery fee</span>
            <span class="fee-price">{{ formatPrice(DELIVERY_FEE_LAK) }}</span>
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
            <input v-if="orderType === 'delivery'" type="text" v-model="customerInfo.guesthouse" placeholder="Guesthouse/Hotel Name *" class="form-input" />
            <input v-if="orderType === 'delivery'" type="text" v-model="customerInfo.roomNumber" placeholder="Room Number *" class="form-input" />
            <textarea v-model="customerInfo.notes" placeholder="Special requests (optional)" class="form-input" rows="2"></textarea>
          </div>

          <div v-if="orderError" class="error-message">{{ orderError }}</div>

          <div v-if="isOrderSubmitted" class="order-confirmed">
            <div class="success-icon">✓</div>
            <h3>Order Ready to Send!</h3>
            <p>Click the button below to send your order via WhatsApp:</p>
            <p v-if="orderType === 'delivery' && !customerLocation" class="location-tip">Location was not shared. Use this site over HTTPS and allow location when prompted to include a map link for delivery.</p>
            <a :href="getWhatsAppOrderUrl()" target="_blank" class="whatsapp-order-btn">📱 Send Order via WhatsApp</a>
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
        <img src="/img/payments.png" alt="Payment methods" class="payments-img" />
      </template>
    </div>
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
.content-wrapper { display: grid; grid-template-columns: 1fr; gap: 30px; }
@media screen and (min-width: 768px) { .content-wrapper { grid-template-columns: 1fr 400px; } }
.menu-section h2 { font-family: "Montserrat-Bold"; margin-bottom: 20px; color: #fff; text-transform: uppercase; letter-spacing: 2px; }
.menu-category { margin-bottom: 30px; }
.menu-category h3 { font-family: "Montserrat-Bold"; color: #ffc300; font-size: 1.2em; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #222; text-transform: uppercase; letter-spacing: 2px; }
.menu-items { display: flex; flex-direction: column; gap: 10px; }
.menu-item { display: flex; justify-content: space-between; align-items: center; background: #0a0a0a; padding: 15px; border-radius: 10px; transition: background 0.2s; border: 1px solid #1a1a1a; }
.menu-item.topping-disabled { opacity: 0.7; }
.topping-hint { font-family: "Montserrat-LightItalic"; font-size: 0.8em; color: #666; margin: 4px 0 0 0; }
.menu-item:hover { background: #111; border-color: #222; }
.item-info { flex: 1; padding-right: 15px; }
.item-name { font-family: "Montserrat-Medium"; font-weight: bold; margin-bottom: 5px; color: #fff; }
.item-description { font-family: "Montserrat-LightItalic"; font-style: italic; color: #666; font-size: 0.85em; margin-bottom: 8px; line-height: 1.4; }
.item-price { font-family: "Montserrat-Light"; color: #ffc300; font-weight: bold; }
.add-btn { width: 40px; height: 40px; border-radius: 50%; background: #ffc300; color: #000; border: none; font-size: 1.5em; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
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
.basket-fee-line { display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; background: #0a0a0a; border-top: 1px dashed #333; font-family: "Montserrat-Medium"; color: #888; }
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
.payments-img { max-width: 300px; margin-top: 20px; border-radius: 10px; }
</style>
