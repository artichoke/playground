import { Buffer } from "node:buffer";
import { readFileSync } from "node:fs";
import path from "node:path";

import { defineConfig } from "vite";

import minifyHtml from "@minify-html/node";
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

const minifyHtmlPlugin = () => {
  return {
    name: "minify-html-transform",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        const input = Buffer.from(html);

        const output = minifyHtml.minify(input, {
          ensure_spec_compliant_unquoted_attribute_values: true,
          keep_html_and_head_opening_tags: true,
          keep_closing_tags: true,
          minify_js: true,
          minify_css: true,
          remove_bangs: false,
        });

        return output.toString();
      },
    },
  };
};

export default defineConfig({
  root: path.resolve(__dirname, "src"),
  build: {
    outDir: "../dist",
  },
  plugins: [etaPlugin(), minifyHtmlPlugin()],
  server: {
    port: 5500,
    hot: true,
  },
});
