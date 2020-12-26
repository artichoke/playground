import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import * as monaco from "monaco-editor";

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
import "assets/artichoke-social-logo.png";

// Exported images
import "assets/playground.png";

import Module from "./wasm/playground.js";
import "./wasm/playground.wasm";

import example from "./examples/forwardable_regexp_io.rb";

// The playground serializes the content of the code editor into the URL
// location hash to allow for sharing and deep linking, similar to
// https://sorbet.run.
//
// On page load, try to parse the deep-linked code out of the location hash. If
// present, initialize the code editor with this code, otherwise, initialize the
// editor with the bundled example Ruby code.
let sourceCode;
if (window.location.hash.length === 0) {
  sourceCode = example.trim();
} else {
  sourceCode = decodeURIComponent(window.location.hash).slice(1);
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const editorElement = document.getElementById("editor")!;

// Source code editor for the Ruby program to be eval'd on an Artichoke
// interpreter.
const editor = monaco.editor.create(editorElement, {
  value: sourceCode,
  language: "ruby",
  theme: "vs-dark",
  fontSize: 14,
  automaticLayout: true,
});

// When the editor reports the source code content inside it has changed,
// update the deep-linked location hash to include this new program.
editor.getModel()?.onDidChangeContent(() => {
  const lines = editor.getModel()?.getLinesContent() ?? [];
  const content = lines.join("\n");
  const encoded = encodeURIComponent(content);
  // Don't break the back button.
  //
  // All edits to source code result in no additional browser history states.
  history.replaceState(undefined, "", `#${encoded}`);
});

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const outputElement = document.getElementById("output")!;

// Monaco editor for the output buffer. This editor is configured to be
// read-only and to approximate a tty with no word breaking or other editor
// features like the minimap.
const output = monaco.editor.create(outputElement, {
  language: "plaintext",
  theme: "vs-dark",
  fontSize: 14,
  automaticLayout: true,
  lineNumbers: "off",
  readOnly: true,
  wordWrap: "bounded",
  wordWrapBreakAfterCharacters: "",
  minimap: {
    enabled: false,
  },
});

// If the webapp is invoked with an `embed` query parameter, hide the webapp
// chrome so only the compiler info, source editor, and output editors are
// visible.
//
// Example URL: https://artichoke.run/?embed
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("embed")) {
  const embeddableElement = document.getElementById("embeddable");
  embeddableElement?.setAttribute(
    "style",
    "position: absolute; width: 100%; height: 100%; top:0; left: 0; background-color: white; max-width: 100%"
  );
}

class Interpreter {
  private state: number;

  constructor(private wasm: Module.Ffi) {
    this.state = wasm._artichoke_web_repl_init();
  }

  // Unmarshal a string from the FFI state by retrieving the string contents
  // one byte at a time.
  //
  // Strings are UTF-8 encoded byte vectors.
  read = (ptr: number): string => {
    const len: number = this.wasm._artichoke_string_getlen(this.state, ptr);
    const bytes = [];
    for (let idx = 0; idx < len; idx += 1) {
      const byte = this.wasm._artichoke_string_getch(this.state, ptr, idx);
      bytes.push(byte);
    }
    return new TextDecoder().decode(new Uint8Array(bytes));
  };

  // Marshal a string into the FFI state by allocating and pushing one byte at
  // a time.
  //
  // Strings are UTF-8 encoded byte vectors.
  write = (s: string): number => {
    const ptr = this.wasm._artichoke_string_new(this.state);
    const bytes = new TextEncoder().encode(s);
    for (let idx = 0; idx < bytes.length; idx += 1) {
      const byte = bytes[idx];
      this.wasm._artichoke_string_putch(this.state, ptr, byte);
    }
    return ptr;
  };

  // Write the source code into the shared Rust/JavaScript string heap and
  // eval this code on a new Artichoke interpreter via FFI.
  evalRuby = (source: string): string => {
    const code = this.write(source);
    const output = this.wasm._artichoke_eval(this.state, code);
    const result = this.read(output);
    this.wasm._artichoke_string_free(this.state, code);
    this.wasm._artichoke_string_free(this.state, output);
    return result;
  };
}

// Factory for an event handler that reads the source code int the editor
// buffer and evals it on an embedded Artichoke Wasm interpreter.
//
// The output editor is updated with the contents of the report from the
// interperter containing stdout, stderr, and the output from calling `inspect`
// on the returned value.
const playgroundRun = (interp: Interpreter) => (): void => {
  const sourceLines = editor.getModel()?.getLinesContent() ?? [];
  const source = sourceLines.join("\n");
  const result = interp.evalRuby(source);
  output.getModel()?.setValue(result);
};

Module().then((wasm: Module.Ffi): void => {
  const artichoke = new Interpreter(wasm);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const buildInfoElement = document.getElementById("artichoke-build-info")!;
  buildInfoElement.textContent = artichoke.read(0);

  // When the user clicks the "Run" button, grab the source code from the editor
  // buffer and eval it on an Artichoke Wasm interpreter.
  const runButton = document.getElementById("run");
  runButton?.addEventListener("click", playgroundRun(artichoke));

  // Add an editor action to run the buffer in an Artichoke Wasm interpreter.
  // This action is triggered by Ctrl/Cmd+F8 (play button on a mac keyboard) and
  // has the same side effects as clicking the "Run" button in the webapp
  // chrome.
  editor.addAction({
    id: "artichoke-playground-run-ruby",
    label: "Run Ruby source code",
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.F8],
    contextMenuGroupId: "2_playground_eval",
    run: playgroundRun(artichoke),
  });
});
