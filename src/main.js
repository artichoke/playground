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
import "rust/playground.js";
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

const Heap = {
  read(state, ptr) {
    const len = window._artichoke_string_getlen(state, ptr);
    const bytes = [];
    for (let idx = 0; idx < len; idx += 1) {
      const byte = window._artichoke_string_getch(state, ptr, idx);
      bytes.push(byte);
    }
    return new TextDecoder().decode(new Uint8Array(bytes));
  },
  write(state, s) {
    const ptr = window._artichoke_string_new(state);
    const bytes = new TextEncoder().encode(s);
    for (let idx = 0; idx < bytes.length; idx += 1) {
      const byte = bytes[idx];
      window._artichoke_string_putch(state, ptr, byte);
    }
    return ptr;
  },
};

const evalRuby = (source) => {
  const { artichoke } = window;
  const code = Heap.write(artichoke, source);
  const output = window._artichoke_eval(artichoke, code);
  const result = Heap.read(artichoke, output);
  window._artichoke_string_free(artichoke, code);
  window._artichoke_string_free(artichoke, output);
  return result;
};

const playgroundRun = () => {
  const codeEditor = ace.edit("editor");
  const source = codeEditor.getValue();
  const output = evalRuby(source);
  document.getElementById("output").innerText = output;
};

window._artichoke_build_info = () => Heap.read(window.artichoke, 0);
window._artichoke_playground_eval = playgroundRun;
