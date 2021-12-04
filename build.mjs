/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-var-requires */

import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderFile } from "eta";
import esbuild from "esbuild";

// eslint-disable-next-line no-shadow
const require = createRequire(import.meta.url);
const minifyHtml = require("@minify-html/js");

// eslint-disable-next-line no-shadow
const __dirname = fileURLToPath(new URL(".", import.meta.url));

const assets = Object.freeze([
  "src/assets/robots.txt",
  "node_modules/@artichokeruby/logo/img/artichoke-logo.png",
  "node_modules/@artichokeruby/logo/img/artichoke-logo.svg",
  "node_modules/@artichokeruby/logo/img/artichoke-logo-inverted.png",
  "node_modules/@artichokeruby/logo/img/artichoke-logo-inverted.svg",
  "node_modules/@artichokeruby/logo/img/playground.png",
  "node_modules/@artichokeruby/logo/img/playground-social-logo.png",
  "node_modules/@artichokeruby/logo/favicons/favicon-32x32.png",
  "node_modules/@artichokeruby/logo/favicons/favicon-128x128.png",
  "node_modules/@artichokeruby/logo/favicons/favicon-192x192.png",
  "node_modules/@artichokeruby/logo/favicons/favicon-196x196.png",
  "node_modules/@artichokeruby/logo/favicons/favicon-152x152.png",
  "node_modules/@artichokeruby/logo/favicons/favicon-180x180.png",
  "node_modules/@artichokeruby/logo/favicons/safari-pinned-tab.svg",
  "node_modules/@artichokeruby/logo/favicons/mstile-150x150.png",
  "node_modules/@artichokeruby/logo/favicons/browserconfig.xml",
  "node_modules/@artichokeruby/logo/favicons/site.webmanifest",
  "node_modules/@artichokeruby/logo/optimized/artichoke-playground-safari-revision-4938-dark-mode.png",
  "node_modules/@artichokeruby/logo/optimized/artichoke-playground-safari-revision-4938-light-mode.png",
  "node_modules/@artichokeruby/logo/optimized/artichoke-playground-social-safari-revision-4938-dark-mode.png",
  "node_modules/@artichokeruby/logo/optimized/artichoke-playground-social-safari-revision-4938-light-mode.png",
  "node_modules/@artichokeruby/logo/optimized/nav-white.svg",
  "node_modules/@artichokeruby/logo/optimized/wordmark-black.svg",
  "node_modules/@artichokeruby/logo/social/twitter-logo-black.svg",
  "node_modules/@artichokeruby/logo/social/github-logo.svg",
  "node_modules/@artichokeruby/logo/social/discord-logo.svg",
]);

const build = async () => {
  await fs.mkdir("dist/social", { recursive: true });

  await Promise.all(
    assets.map(async (asset) => {
      const file = path.basename(asset);
      if (asset.includes("/social/")) {
        await fs.copyFile(asset, path.join(__dirname, "dist", "social", file));
      } else {
        await fs.copyFile(asset, path.join(__dirname, "dist", file));
      }
    })
  );

  await fs.copyFile(
    path.join(__dirname, "src", "wasm", "playground.wasm"),
    path.join(__dirname, "dist", "playground.wasm")
  );

  let index = await renderFile(
    "index.html",
    {},
    { views: path.join(__dirname, "src") }
  );

  if (process.argv.includes("--release")) {
    const cfg = minifyHtml.createConfiguration({
      ensure_spec_compliant_unquoted_attribute_values: true,
      keep_html_and_head_opening_tags: true,
      keep_closing_tags: true,
      minify_js: true,
      minify_css: true,
      remove_bangs: false,
    });

    index = minifyHtml.minify(index, cfg);
  }

  await fs.writeFile(path.join(__dirname, "dist", "index.html"), index);

  await esbuild.build({
    entryPoints: {
      main: "./src/main.ts",
      "editor.worker": "monaco-editor/esm/vs/editor/editor.worker.js",
      "json.worker": "monaco-editor/esm/vs/language/json/json.worker.js",
      "css.worker": "monaco-editor/esm/vs/language/css/css.worker.js",
      "html.worker": "monaco-editor/esm/vs/language/html/html.worker.js",
      "ts.worker": "monaco-editor/esm/vs/language/typescript/ts.worker",
    },
    entryNames: "[name].bundle",
    bundle: true,
    outdir: "./dist",
    loader: {
      ".rb": "text",
      ".ttf": "file",
    },
    minify: process.argv.includes("--release"),
  });
};

(async function main() {
  try {
    await build();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
