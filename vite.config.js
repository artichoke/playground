import path from "node:path";

import { defineConfig } from "vite";

import { Eta } from "eta";

const etaPlugin = () => {
  return {
    name: "eta-html-transform",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        const eta = new Eta({ views: "src" });
        return eta.renderString(html);
      },
    },
  };
};

export default defineConfig({
  root: path.resolve(__dirname, "src"),
  build: {
    outDir: "../dist",
  },
  plugins: [etaPlugin()],
  server: {
    port: 5500,
    hot: true,
  },
});
