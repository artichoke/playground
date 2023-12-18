import { Buffer } from "node:buffer";
import { readFileSync } from "node:fs";
import path from "node:path";

import { defineConfig } from "vite";

import minifyHtml from "@minify-html/node";
import { Eta } from "eta";
import hljs from "highlight.js";
import { marked } from "marked";

marked.setOptions({
  renderer: new marked.Renderer(),
  highlight: (code, language) => {
    const highlighted = hljs.highlight(code, {
      language,
      ignoreIllegals: true,
    });
    const html = highlighted.value;
    return html;
  },
  langPrefix: "hljs artichoke-highlight language-",
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false,
});

const includeMarkdown = (source) => {
  const filePath = path.resolve(__dirname, "src", source);
  const content = readFileSync(filePath);
  return marked.parse(content.toString());
};

const etaPlugin = () => {
  return {
    name: "eta-html-transform",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        const eta = new Eta({ views: "src" });
        return eta.renderString(html, { includeMarkdown });
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
  base: "/rubyconf/",
  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "src", "index.html"),
        2019: path.resolve(__dirname, "src", "2019", "index.html"),
      },
    },
  },
  plugins: [etaPlugin(), minifyHtmlPlugin()],
  server: {
    port: 3000,
    hot: true,
  },
});
