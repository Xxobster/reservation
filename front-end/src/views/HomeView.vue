<script setup>
import ButtonFilled from "@/components/ButtonFilled.vue";
import ButtonOutlined from "@/components/ButtonOutlined.vue";
import { useRouter } from "vue-router";

const router = useRouter();
const changeRoute = (routeName) => router.push({ name: routeName });
const whatsappNumber = "41793917577";
const whatsappUrl = `https://wa.me/${whatsappNumber}`;
</script>

<template>
  <div class="home-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <img src="/img/logo-white.png?v=2" alt="S&M Bistro" class="logo" />
        <p class="tagline">Don Det Sunset Side</p>
        <p class="description">Artisanal Bread • French Wines • Pizza Baguette • Cheese & Cold Cuts</p>
        
        <div class="hero-buttons">
          <ButtonFilled text="Book a Table" @click="changeRoute('new-reservation')" />
          <ButtonOutlined text="Delivery / Pick-up" @click="changeRoute('delivery')" />
        </div>
      </div>
      
      <div class="hero-image">
        <img src="/img/raclette2.webp" alt="Raclette" />
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <div class="action-card">
        <h3>Contact Us</h3>
        <a :href="whatsappUrl" target="_blank" class="whatsapp-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Chat on WhatsApp
        </a>
        <p class="phone">+41 79 391 75 77</p>
        <img src="/img/qr-whatsapp.png" alt="WhatsApp QR" class="qr-code" />
      </div>
      
      <div class="action-card">
        <h3>Find Us</h3>
        <p class="location-text">Don Det, Sunset Side</p>
        <img src="/img/qr-location.png" alt="Location QR" class="qr-code" />
        <p class="qr-hint">Scan for directions</p>
      </div>
    </div>

    <!-- Highlights -->
    <div class="highlights">
      <div class="highlight-item">
        <span class="highlight-icon">🧀</span>
        <h4>RACLETTE!</h4>
        <p>Authentic Swiss raclette experience</p>
      </div>
      <div class="highlight-item">
        <span class="highlight-icon">🥖</span>
        <h4>Fresh Baguettes</h4>
        <p>Homemade daily</p>
      </div>
      <div class="highlight-item">
        <span class="highlight-icon">🍷</span>
        <h4>French Wines</h4>
        <p>Carefully selected</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #000;
}

.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  gap: 40px;
}

@media (min-width: 768px) {
  .hero-section {
    flex-direction: row;
    justify-content: center;
    padding: 60px;
    gap: 80px;
  }
}

.hero-content {
  text-align: center;
  max-width: 500px;
}

.logo {
  max-width: 280px;
  margin-bottom: 20px;
}

@media (min-width: 768px) {
  .logo {
    max-width: 350px;
  }
}

.tagline {
  font-family: "Montserrat-Light";
  font-size: 1.2em;
  color: #fff;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 15px;
}

.description {
  font-family: "Montserrat-LightItalic";
  font-style: italic;
  color: #aaa;
  margin-bottom: 30px;
}

.hero-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

@media (min-width: 768px) {
  .hero-buttons {
    flex-direction: row;
    justify-content: center;
  }
}

.hero-image img {
  max-width: 100%;
  width: 400px;
  border-radius: 10px;
  box-shadow: 0 20px 60px rgba(255, 195, 0, 0.2);
}

@media (min-width: 768px) {
  .hero-image img {
    width: 500px;
  }
}

/* Quick Actions */
.quick-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  padding: 40px 20px;
  background: #0a0a0a;
}

.action-card {
  background: #111;
  border: 1px solid #222;
  border-radius: 15px;
  padding: 30px;
  text-align: center;
  min-width: 250px;
  max-width: 300px;
}

.action-card h3 {
  font-family: "Montserrat-Bold";
  color: #ffc300;
  font-size: 1.3em;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.whatsapp-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #25D366;
  color: white;
  padding: 12px 25px;
  border-radius: 30px;
  font-family: "Montserrat-Medium";
  font-weight: bold;
  text-decoration: none;
  transition: all 0.3s;
  margin-bottom: 15px;
}

.whatsapp-btn:hover {
  background: #128C7E;
  transform: scale(1.05);
}

.phone {
  font-family: "Montserrat-Light";
  color: #888;
  margin-bottom: 15px;
}

.location-text {
  font-family: "Montserrat-Light";
  color: #fff;
  margin-bottom: 15px;
}

.qr-code {
  width: 120px;
  height: 120px;
  background: white;
  padding: 5px;
  border-radius: 10px;
}

.qr-hint {
  font-family: "Montserrat-LightItalic";
  font-style: italic;
  color: #666;
  font-size: 0.85em;
  margin-top: 10px;
}

/* Highlights */
.highlights {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 40px;
  padding: 60px 20px;
}

.highlight-item {
  text-align: center;
  max-width: 200px;
}

.highlight-icon {
  font-size: 3em;
  display: block;
  margin-bottom: 15px;
}

.highlight-item h4 {
  font-family: "Montserrat-Bold";
  color: #ffc300;
  font-size: 1.2em;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.highlight-item p {
  font-family: "Montserrat-LightItalic";
  font-style: italic;
  color: #888;
}
</style>
