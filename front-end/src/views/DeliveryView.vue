<script setup>
import { ref, computed } from "vue";
import ButtonFilled from "@/components/ButtonFilled.vue";

// Menu categories based on actual S&M Bistro menu
const menuCategories = ref([
  {
    name: "Platters",
    items: [
      { id: 1, name: "Charcuterie Platter (120g)", price: 190000, description: "Selection of House-Made Delicatessen, served with French baguette, pickles and salted butter" },
      { id: 2, name: "Cheese Platter (100g)", price: 265000, description: "Assortment of Fine French Cheeses, accompanied by French baguette, pickles and salted butter" },
      { id: 3, name: "Mixed Platter (75g cheese / 100g meat)", price: 320000, description: "A curated mix of Fine French Cheeses and House-Made Delicatessen, paired with French baguette, pickles and salted butter" },
    ]
  },
  {
    name: "Appetizers",
    items: [
      { id: 4, name: "Traditional Pate", price: 75000, description: "Delicate blend of pork and pork liver, enhanced with house-made pickles and served with French baguette" },
      { id: 5, name: "Chicken Rillettes", price: 90000, description: "Slow-cooked chicken, hand-shredded and gently roasted, served with house-made pickles and French baguette" },
      { id: 6, name: "Eggplant Caviar with Sweet Paprika", price: 90000, description: "Slow-roasted Laotian eggplants, infused with olive oil and a hint of paprika and curry, served with olives, sunflower, pumpkin seeds, and French baguette" },
      { id: 7, name: "Green Olive Tapenade", price: 115000, description: "A house-prepared olive tapenade combining green olives, olive oil, fresh and roasted garlic, lime, and a touch of mustard, served with sunflower, pumpkin seeds, and French baguette" },
    ]
  },
  {
    name: "Small Bites",
    items: [
      { id: 8, name: "Salted Garlic Peanuts", price: 25000, description: "House-prepared peanuts, gently cooked in lightly salted water, then oven-dried for a crisp finish" },
      { id: 9, name: "Olives Bowl", price: 65000, description: "Bowl of Green Pitted Olives, lightly marinated" },
      { id: 10, name: "Mozzarella Bowl", price: 45000, description: "Diced mozzarella cubes marinated in olive oil, lime juice, and fresh mint for a light, fresh finish" },
      { id: 11, name: "Saucisson Bowl - France", price: 60000, description: "Traditional French pork saucisson, slowly air-dried and sliced by hand" },
    ]
  },
  {
    name: "Raclettes",
    items: [
      { id: 12, name: "Raclette (100g) - Half portion", price: 195000, description: "Raclette cheese, accompanied by shallots, potatoes, and pickles" },
      { id: 13, name: "Raclette (200g) - 1 portion", price: 345000, description: "Raclette cheese, accompanied by shallots, potatoes, and pickles" },
      { id: 14, name: "Raclette & Blue Cheese (180g)", price: 265000, description: "Raclette and Blue cheeses, accompanied by shallots, potatoes, and pickles" },
      { id: 15, name: "Raclette & Morbier (200g)", price: 415000, description: "Raclette and Morbier cheeses, accompanied by shallots, potatoes, and pickles" },
      { id: 16, name: "Charcuterie Option (100g)", price: 95000, description: "Add to your raclette: Delicatessen platter featuring house-made cured pork tenderloin, dry sausage (saucisson), and ham" },
    ]
  },
  {
    name: "Main Courses",
    items: [
      { id: 17, name: "Slow-Braised Chicken in Dark Beer", price: 150000, description: "Tender Chicken slowly braised in dark beer with Dijon mustard and sauteed onions, served with potatoes" },
      { id: 18, name: "Slow-Braised Pork in Caramel Sauce", price: 150000, description: "Succulent pieces of Pork simmered in a sweet and savory caramel sauce with toasted peanuts, served with potatoes" },
      { id: 19, name: "Pizza Baguette", price: 120000, description: "Crispy French baguette topped with tomato sauce, mozzarella and oregano" },
    ]
  },
  {
    name: "Extras",
    items: [
      { id: 20, name: "French Baguette", price: 30000, description: "Half French baguette" },
      { id: 21, name: "Cornichons Bowl", price: 50000, description: "Bowl of pickles" },
      { id: 22, name: "Potato", price: 10000, description: "Additional potato" },
      { id: 23, name: "Blue Cheese", price: 50000, description: "Extra blue cheese" },
      { id: 24, name: "Raclette Cheese", price: 95000, description: "Extra raclette cheese" },
    ]
  },
  {
    name: "Drinks",
    items: [
      { id: 25, name: "Coca-Cola", price: 25000, description: "330ml" },
      { id: 26, name: "Coca-Cola Zero", price: 25000, description: "330ml" },
      { id: 27, name: "Soda Water", price: 25000, description: "330ml" },
      { id: 28, name: "Still Water", price: 10000, description: "500ml" },
      { id: 29, name: "Beer Lao Gold", price: 40000, description: "640ml" },
      { id: 30, name: "Beer Lao Dark", price: 40000, description: "640ml" },
    ]
  }
]);

const orderType = ref("delivery");
const customerInfo = ref({ name: "", phone: "", guesthouse: "", notes: "" });
const basket = ref([]);

const formatPrice = (price) => price.toLocaleString() + " LAK";

const addToBasket = (item) => {
  const existingItem = basket.value.find(i => i.id === item.id);
  if (existingItem) existingItem.quantity++;
  else basket.value.push({ ...item, quantity: 1 });
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

const isOrderSubmitted = ref(false);
const orderError = ref(null);

const submitOrder = () => {
  orderError.value = null;
  if (basket.value.length === 0) { orderError.value = "Please add items to your basket"; return; }
  if (!customerInfo.value.name) { orderError.value = "Please enter your name"; return; }
  if (!customerInfo.value.phone) { orderError.value = "Please enter your phone number"; return; }
  if (orderType.value === "delivery" && !customerInfo.value.guesthouse) { orderError.value = "Please enter your guesthouse/hotel name"; return; }
  isOrderSubmitted.value = true;
};

const getWhatsAppOrderUrl = () => {
  const itemsList = basket.value.map(item => "- " + item.name + " x" + item.quantity + " = " + formatPrice(item.price * item.quantity)).join("\n");
  const deliveryLine = orderType.value === "delivery" ? "\nDelivery fee: " + formatPrice(DELIVERY_FEE_LAK) : "";
  const message = "New " + (orderType.value === "delivery" ? "DELIVERY" : "PICK-UP") + " Order\n\nCustomer: " + customerInfo.value.name + "\nPhone: " + customerInfo.value.phone + "\n" + (orderType.value === "delivery" ? "Guesthouse: " + customerInfo.value.guesthouse : "Pick-up at restaurant") + (customerInfo.value.notes ? "\nNotes: " + customerInfo.value.notes : "") + "\n\nOrder Items:\n" + itemsList + deliveryLine + "\n\nTOTAL: " + formatPrice(basketTotal.value);
  return "https://wa.me/41793917577?text=" + encodeURIComponent(message);
};

const resetOrder = () => {
  basket.value = [];
  customerInfo.value = { name: "", phone: "", guesthouse: "", notes: "" };
  isOrderSubmitted.value = false;
  orderError.value = null;
};
</script>

<template>
  <div class="delivery-page">
    <div class="header">
      <img src="/img/logo-white.png" alt="S&M Bistro" class="logo" />
      <h1 class="title-ananias">Delivery & Pick-up</h1>
      <p class="subtitle">Order delicious food for delivery to your guesthouse or pick-up at S&M Bistro</p>
    </div>

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
    </div>

    <div class="content-wrapper">
      <div class="menu-section">
        <h2>Our Menu</h2>
        <div v-for="category in menuCategories" :key="category.name" class="menu-category">
          <h3>{{ category.name }}</h3>
          <div class="menu-items">
            <div v-for="item in category.items" :key="item.id" class="menu-item">
              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-description">{{ item.description }}</div>
                <div class="item-price">{{ formatPrice(item.price) }}</div>
              </div>
              <button class="add-btn" @click="addToBasket(item)">+</button>
            </div>
          </div>
        </div>
      </div>

      <div class="basket-section">
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
            <textarea v-model="customerInfo.notes" placeholder="Special requests (optional)" class="form-input" rows="2"></textarea>
          </div>

          <div v-if="orderError" class="error-message">{{ orderError }}</div>

          <div v-if="isOrderSubmitted" class="order-confirmed">
            <div class="success-icon">✓</div>
            <h3>Order Ready to Send!</h3>
            <p>Click the button below to send your order via WhatsApp:</p>
            <a :href="getWhatsAppOrderUrl()" target="_blank" class="whatsapp-order-btn">📱 Send Order via WhatsApp</a>
            <button class="new-order-btn" @click="resetOrder">Start New Order</button>
          </div>

          <ButtonFilled v-else text="Place Order" @click="submitOrder" class="place-order-btn" />
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
.header h1 { font-family: "Montserrat-Bold"; font-size: 2em; margin-bottom: 10px; color: #ffc300; text-transform: uppercase; letter-spacing: 3px; }
.subtitle { font-family: "Montserrat-LightItalic"; font-style: italic; color: #888; font-size: 1em; }
.order-type-section { display: flex; justify-content: center; gap: 20px; margin-bottom: 20px; }
.order-type-btn { display: flex; flex-direction: column; align-items: center; padding: 20px 40px; background: #111; border-radius: 12px; cursor: pointer; transition: all 0.3s; border: 2px solid #222; }
.order-type-btn:hover { background: #1a1a1a; border-color: #333; }
.order-type-btn.active { border-color: #ffc300; background: rgba(255, 195, 0, 0.1); }
.order-type-btn .icon { font-size: 2em; margin-bottom: 10px; }
.delivery-info { text-align: center; margin-bottom: 30px; padding: 20px; background: #0a0a0a; border-radius: 10px; }
.location-qr { width: 100px; height: 100px; background: white; padding: 5px; border-radius: 8px; margin-bottom: 10px; }
.delivery-info p { font-family: "Montserrat-LightItalic"; color: #888; }
.content-wrapper { display: grid; grid-template-columns: 1fr; gap: 30px; }
@media screen and (min-width: 768px) { .content-wrapper { grid-template-columns: 1fr 400px; } }
.menu-section h2 { font-family: "Montserrat-Bold"; margin-bottom: 20px; color: #fff; text-transform: uppercase; letter-spacing: 2px; }
.menu-category { margin-bottom: 30px; }
.menu-category h3 { font-family: "Montserrat-Bold"; color: #ffc300; font-size: 1.2em; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #222; text-transform: uppercase; letter-spacing: 2px; }
.menu-items { display: flex; flex-direction: column; gap: 10px; }
.menu-item { display: flex; justify-content: space-between; align-items: center; background: #0a0a0a; padding: 15px; border-radius: 10px; transition: background 0.2s; border: 1px solid #1a1a1a; }
.menu-item:hover { background: #111; border-color: #222; }
.item-info { flex: 1; padding-right: 15px; }
.item-name { font-family: "Montserrat-Medium"; font-weight: bold; margin-bottom: 5px; color: #fff; }
.item-description { font-family: "Montserrat-LightItalic"; font-style: italic; color: #666; font-size: 0.85em; margin-bottom: 8px; line-height: 1.4; }
.item-price { font-family: "Montserrat-Light"; color: #ffc300; font-weight: bold; }
.add-btn { width: 40px; height: 40px; border-radius: 50%; background: #ffc300; color: #000; border: none; font-size: 1.5em; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.add-btn:hover { background: #e6b000; transform: scale(1.1); }
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
.title-ananias { font-family: "Ananias", Georgia, serif !important; }
.customer-form h3 { margin-bottom: 15px; font-family: "Montserrat-Bold"; color: #ffc300; text-transform: uppercase; letter-spacing: 1px; }
.form-input { width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #222; border-radius: 8px; background: #111; color: white; font-size: 1em; box-sizing: border-box; font-family: "Montserrat-Light"; }
.form-input:focus { outline: none; border-color: #ffc300; }
.form-input::placeholder { color: #444; }
.error-message { background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #ef4444; padding: 10px; border-radius: 8px; text-align: center; }
.order-confirmed { text-align: center; padding: 20px; background: rgba(255, 195, 0, 0.1); border: 1px solid #ffc300; border-radius: 10px; }
.success-icon { width: 60px; height: 60px; background: #ffc300; color: #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2em; margin: 0 auto 15px; }
.order-confirmed h3 { color: #ffc300; }
.whatsapp-order-btn { display: block; background: #25D366; color: white; padding: 15px 25px; border-radius: 10px; text-decoration: none; font-weight: bold; margin: 15px 0; transition: all 0.2s; font-family: "Montserrat-Medium"; }
.whatsapp-order-btn:hover { background: #128C7E; }
.new-order-btn { background: #222; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; margin-top: 10px; font-family: "Montserrat-Light"; }
.new-order-btn:hover { background: #333; }
.place-order-btn { width: 100%; margin-top: 15px; }
.payment-info { margin-top: 40px; padding: 30px; background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 15px; text-align: center; }
.payment-info h3 { margin-bottom: 20px; font-family: "Montserrat-Bold"; color: #ffc300; text-transform: uppercase; letter-spacing: 2px; }
.payment-info p { margin: 10px 0; color: #888; font-family: "Montserrat-Light"; }
.payments-img { max-width: 300px; margin-top: 20px; border-radius: 10px; }
</style>
