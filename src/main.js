import ace from "ace-builds";
import "ace-builds/src-noconflict/mode-ruby";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/webpack-resolver";

// Favicons
import "assets/favicons/android-chrome-192x192.png";
import "assets/favicons/android-chrome-512x512.png";
import "assets/favicons/apple-touch-icon.png";
import "assets/favicons/browserconfig.xml";
import "assets/favicons/favicon-16x16.png";
import "assets/favicons/favicon-32x32.png";
import "assets/favicons/favicon.ico";
import "assets/favicons/mstile-150x150.png";
import "assets/favicons/safari-pinned-tab.svg";
import "assets/favicons/site.webmanifest";

// OpenGraph icons
import "assets/artichoke-logo.png";
import "assets/artichoke-logo.svg";

// Exported images
import "assets/playground.png";

// eslint-disable-next-line import/extensions
import Module from "rust/playground.js";
import "rust/playground.wasm";

import example from "ruby/delegate_json_regexp.rb";

const editor = ace.edit("editor", {
  mode: "ace/mode/ruby",
  theme: "ace/theme/monokai",
  fontSize: 14,
  tabSize: 2,
  useSoftTabs: true,
});

editor.getSession().on("change", () => {
  const encoded = encodeURIComponent(editor.getValue());
  window.location.hash = encoded;
});

let value;
if (window.location.hash.length === 0) {
  value = example.trim();
} else {
  value = decodeURIComponent(window.location.hash).slice(1);
}
ace.edit("editor").setValue(value, -1);

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("embed")) {
  document
    .getElementById("embeddable")
    .setAttribute(
      "style",
      "position: absolute; width: 100%; height: 100%; top:0; left: 0; background-color: white; max-width: 100%"
    );
}

const interp = (mod) => {
  const state = mod._artichoke_web_repl_init();
  return {
    read(ptr) {
      const len = mod._artichoke_string_getlen(state, ptr);
      const bytes = [];
      for (let idx = 0; idx < len; idx += 1) {
        const byte = mod._artichoke_string_getch(state, ptr, idx);
        bytes.push(byte);
      }
      return new TextDecoder().decode(new Uint8Array(bytes));
    },
    write(s) {
      const ptr = mod._artichoke_string_new(state);
      const bytes = new TextEncoder().encode(s);
      for (let idx = 0; idx < bytes.length; idx += 1) {
        const byte = bytes[idx];
        mod._artichoke_string_putch(state, ptr, byte);
      }
      return ptr;
    },
    evalRuby(source) {
      const code = this.write(source);
      const output = mod._artichoke_eval(state, code);
      const result = this.read(output);
      mod._artichoke_string_free(state, code);
      mod._artichoke_string_free(state, output);
      return result;
    },
  };
};

const playgroundRun = (state) => () => {
  const codeEditor = ace.edit("editor");
  const source = codeEditor.getValue();
  const output = state.evalRuby(source);
  document.getElementById("output").innerText = output;
};

Module().then((mod) => {
  const artichoke = interp(mod);
  document.getElementById("artichoke-build-info").innerText = artichoke.read(0);
  document
    .getElementById("run")
    .addEventListener("click", playgroundRun(artichoke));
});
