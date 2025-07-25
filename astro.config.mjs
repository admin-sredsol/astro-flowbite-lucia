import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import tailwind from "@astrojs/tailwind";
import serviceworker from "astrojs-service-worker";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  security: {
    checkOrigin: true,
  },
  integrations: [tailwind(), serviceworker()],
});
