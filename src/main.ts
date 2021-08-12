import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import * as monaco from "monaco-editor";

// Assets with well-known filenames
import "@artichokeruby/logo/img/artichoke-logo.png";
import "@artichokeruby/logo/img/artichoke-logo.svg";
import "@artichokeruby/logo/img/artichoke-logo-inverted.png";
import "@artichokeruby/logo/img/artichoke-logo-inverted.svg";
import "@artichokeruby/logo/img/playground.png";
import "@artichokeruby/logo/img/playground-social-logo.png";
import "./assets/robots.txt";

import Interpreter from "./interpreter";
import PlaygroundChrome from "./playground-chrome";
import { PlaygroundRunAction, EvalType } from "./run-action";
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
let sourceCode: string = example.trim();
if (window.location.hash) {
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
const outputPane = monaco.editor.create(outputElement, {
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
const urlParameters = new URLSearchParams(window.location.search);
if (urlParameters.has("embed")) {
  const embeddableElement = document.getElementById("embeddable");
  embeddableElement?.setAttribute(
    "style",
    "position: absolute; width: 100%; height: 100%; top:0; left: 0; background-color: white; max-width: 100%"
  );
}

// eslint-disable-next-line new-cap
Module().then((wasm: Readonly<Module.Ffi>): void => {
  const chrome = new PlaygroundChrome(editor, outputPane);

  const level = "playground-interpreter-init";
  window.gtag("event", "level_start", {
    level_name: level,
  });

  const artichoke = new Interpreter(wasm);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const buildInfoElement = document.getElementById("artichoke-build-info")!;

  // On `Interpreter` init, Rust code generates the interpreter meta and stores
  // it in string heap position `0`.
  buildInfoElement.textContent = artichoke.read(0 as Module.StringPointer);

  // When the user clicks the "Run" button, grab the source code from the editor
  // buffer and eval it on an Artichoke Wasm interpreter.
  const runButton = document.getElementById("run");
  runButton?.addEventListener(
    "click",
    new PlaygroundRunAction(EvalType.button, chrome).makeHandler(artichoke)
  );

  // Add an editor action to run the buffer in an Artichoke Wasm interpreter.
  // This action is triggered by Ctrl/Cmd+F8 (the "play" button on a Mac
  // keyboard) and has the same side effects as clicking the "Run" button in the
  // webapp chrome.
  editor.addAction({
    id: "artichoke-playground-run-ruby",
    label: "Run Ruby source code",
    // eslint-disable-next-line no-bitwise
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.F8],
    contextMenuGroupId: "2_playground_eval",

    run: new PlaygroundRunAction(EvalType.codeAction, chrome).makeHandler(
      artichoke
    ),
  });

  window.gtag("event", "level_end", {
    level_name: level,
    success: true,
  });
});
