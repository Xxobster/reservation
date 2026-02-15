<script setup>
const partners = [
  {
    name: "La Boulange French Bakery",
    url: "https://maps.app.goo.gl/8u2irRVBtVXzvPLo9",
    description: "An artisanal French bakery and café in Pakse offering authentic pastries, fresh baguettes, and rich coffee in a warm, Parisian-inspired setting.",
  },
  {
    name: "Sompong sunset view guest (Khampheng River Views Sunset Guesthouse)",
    url: "https://maps.app.goo.gl/HfkT2QpCb5qSK7wp7",
    description: "A peaceful guesthouse on Don Khone with scenic river views, free Wi-Fi, and comfortable rooms — ideal for sunset watching and relaxed island stays.",
  },
  {
    name: "ミスターBゲストハウス&レストラン (Mr B. Guesthouse – Don Det)",
    url: "https://maps.app.goo.gl/6G2DsncQUkQww4yh6",
    description: "A local guesthouse on Don Det offering simple accommodation and a friendly atmosphere — a laid-back base for exploring the 4,000 Islands.",
  },
  {
    name: "Sabai ça Baille (Sabai ça Baille Guesthouse – Pakse)",
    url: "https://maps.app.goo.gl/hZpYd4EeNvxeh4CR9",
    description: "A highly-rated guesthouse near downtown Pakse with garden terraces, free Wi-Fi, and comfortable rooms — perfect for a restful stay close to local attractions.",
  },
  {
    name: "SéSé Wine and Beer",
    url: "https://maps.app.goo.gl/sFhPZVzu24RGfe3o7",
    description: "A lively wine bar and beer spot in Pakse featuring Belgian brews, French wines, local bites, and a relaxed ambience for evenings with friends.",
  },
  {
    name: "Pakse Green Adventure Travel",
    url: "https://maps.app.goo.gl/K656x8GnP6ETCmqF9",
    description: "A travel agency in Pakse offering tours, transport arrangements, and adventure bookings for exploring Southern Laos.",
  },
  {
    name: "Bon Appetit Restaurant",
    url: "https://maps.app.goo.gl/H1ZYn5AP2HvVzqR49",
    description: "A beloved French restaurant in Vang Vieng serving refined cuisine and classic dishes in a stylish setting — a favorite for locals and visitors alike.",
  },
  {
    name: "Don Falang - Don Det",
    url: "https://maps.app.goo.gl/nbVV7M8wfW6NQJo27",
    description: "Don Falang is a small private island near Don Det offering a peaceful homestay experience, surrounded by the Mekong and far from the noise of the main island.",
  },
  {
    name: "Fandee Island - Treehouses, Tiny Houses & Zipline - Tad Lo, Boloven Loop Pakse ດອນຝັນດີ",
    url: "https://maps.app.goo.gl/ipJcVturAn2nVMbx6",
    description: "Fandee Island in Tad Lo offers unique treehouses and tiny houses set in lush riverside nature, with a zipline and easy access to waterfalls along the Boloven Loop.",
  },
];
</script>

<template>
  <div class="delivery-page">
    <div class="header">
      <img src="/img/logo-white.png?v=2" alt="S&M Bistro" class="logo" />
      <h1 class="title-ananias">Our Partners</h1>
      <p class="subtitle">Trusted places we recommend — click a name to open in Google Maps</p>
    </div>

    <div class="partners-list">
      <article v-for="(partner, index) in partners" :key="index" class="partner-card">
        <h2 class="partner-name">
          <a :href="partner.url" target="_blank" rel="noopener noreferrer" class="partner-link">{{ partner.name }}</a>
        </h2>
        <p class="partner-description">{{ partner.description }}</p>
      </article>
    </div>
  </div>
</template>

<style scoped>
.delivery-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #000;
}
.header {
  text-align: center;
  margin-bottom: 30px;
}
.logo {
  max-width: 200px;
  margin-bottom: 20px;
}
.header h1 {
  font-size: 2em;
  margin-bottom: 10px;
  color: #ffc300;
  text-transform: uppercase;
  letter-spacing: 3px;
}
.header h1.title-ananias {
  font-family: "Ananias", Georgia, serif;
}
.subtitle {
  font-family: "Montserrat-LightItalic";
  font-style: italic;
  color: #888;
  font-size: 1em;
}

.partners-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.partner-card {
  background: #0a0a0a;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #1a1a1a;
  transition: background 0.2s;
}
.partner-card:hover {
  background: #111;
  border-color: #222;
}
.partner-name {
  font-family: "Montserrat-Bold";
  color: #fff;
  font-size: 1.15em;
  margin: 0 0 12px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #222;
  text-transform: none;
  letter-spacing: 0;
}
.partner-link {
  color: #ffc300;
  text-decoration: none;
}
.partner-link:hover {
  text-decoration: underline;
}
.partner-description {
  font-family: "Montserrat-LightItalic";
  font-style: italic;
  color: #888;
  font-size: 0.95em;
  line-height: 1.5;
  margin: 0;
}
</style>
