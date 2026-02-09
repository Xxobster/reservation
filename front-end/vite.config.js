import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Icons from "unplugin-icons/vite";

// Avoid ENOENT when env/container tries to load optional files (e.g. /.aws/credentials, /app/.env, /config.json)
function suppressOptionalFileLoad() {
  const virtualId = "\0vite-optional-env";
  const matches = (id) => {
    if (!id || typeof id !== "string") return false;
    const s = id.replace(/^file:\/\//, "");
    return (
      s === "/.aws/credentials" ||
      s === "/app/.env" ||
      s === "/config.json" ||
      /\.aws\/credentials$/.test(s) ||
      /\/\.env$/.test(s) ||
      /config\.json$/.test(s)
    );
  };
  return {
    name: "suppress-optional-file-load",
    resolveId(id) {
      if (matches(id)) return virtualId;
      return null;
    },
    load(id) {
      if (id === virtualId) return { code: "export default {};", map: null };
      return null;
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
  plugins: [suppressOptionalFileLoad(), Icons({ compiler: "vue3" }), vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
