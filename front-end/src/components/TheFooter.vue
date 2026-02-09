<script setup>
import NavItem from "@/components/NavItem.vue";
import { useRouter, useRoute } from "vue-router";
import { computed, ref, onMounted } from "vue";
import { getSettings } from "@/services/settingsAPI";

const router = useRouter();
const route = useRoute();
const whatsappUrl = ref("https://wa.me/41793917577");
const displayPhone = ref("+41 79 391 75 77");
const isDeliveryPage = computed(() => route.name === "delivery");

onMounted(async () => {
  try {
    const res = await getSettings();
    const num = (res.data?.whatsappGeneral || "").replace(/\D/g, "") || "41793917577";
    whatsappUrl.value = `https://wa.me/${num}`;
    displayPhone.value = num.startsWith("41") ? `+41 ${num.slice(2, 4)} ${num.slice(4, 7)} ${num.slice(7, 9)} ${num.slice(9, 11)}` : `+${num}`;
  } catch (_) {}
});
</script>

<template>
  <footer>
    <div class="footer-wrapper">
      <img
        class="footer-logo"
        src="/img/logo-white.png?v=2"
        alt="S&M Bistro"
        @click="router.push({ name: 'home' })"
      />
      <nav>
        <NavItem class="item" route-name="new-reservation" text="Book a Table" />
        <NavItem class="item" route-name="delivery" text="Delivery / Pick-up" />
      </nav>
      <div class="contact-info">
        <div class="whatsapp-row">
          <img src="/img/qr-whatsapp.png" alt="WhatsApp QR" class="qr-whatsapp" />
          <a :href="whatsappUrl" target="_blank" class="whatsapp-link">
            <span>📱 WhatsApp: {{ displayPhone }}</span>
          </a>
        </div>
        <p v-if="!isDeliveryPage">Don Det, Sunset Side</p>
      </div>
      <div class="line"></div>
      <div class="copyright">© S&M Bistro Since 2567. Don Det, Laos.</div>
    </div>
  </footer>
</template>

<style scoped>
footer {
  background-color: #000;
  border-top: 1px solid #1a1a1a;
  font-family: "Montserrat-Light";
}
.footer-wrapper {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  gap: 25px;
  width: 100%;
  padding: 60px var(--x-spacing-mobile);
}

.footer-logo {
  width: 150px;
  cursor: pointer;
  margin-bottom: 10px;
}

nav {
  display: flex;
  gap: 30px;
  justify-content: center;
  align-items: center;
  color: var(--snow-white);
}

.item {
  font-size: 12px;
}

.contact-info {
  text-align: center;
}

.whatsapp-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.qr-whatsapp {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background: #fff;
  padding: 4px;
  box-sizing: border-box;
}

.whatsapp-link {
  display: inline-block;
  color: #ffc300;
  text-decoration: none;
  transition: color 0.2s;
}

.whatsapp-link:hover {
  color: #25D366;
}

.contact-info p {
  font-family: "Montserrat-LightItalic";
  font-style: italic;
  color: #666;
  font-size: 0.9em;
}

.line {
  height: 1px;
  width: 200px;
  background-color: #222;
}

.copyright {
  color: #444;
  font-size: 11px;
  font-family: "Montserrat-Light";
}

@media screen and (min-width: 1024px) {
  .footer-wrapper {
    padding: 80px var(--x-spacing-desktop);
  }
  nav {
    gap: 50px;
  }
  .item {
    font-size: 14px;
  }
  .copyright {
    font-size: 12px;
  }
}
</style>
