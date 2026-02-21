module.exports = {
  apps: [
    {
      name: "smbistro-api",
      cwd: "/home/restaurant-table-reservation-system/back-end",
      script: "./src/app.js",
      interpreter: "node",
      env: { NODE_ENV: "production" },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
    },
  ],
};
