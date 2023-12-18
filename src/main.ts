import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
import "monaco-editor/esm/vs/editor/editor.all.js";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import "monaco-editor/esm/vs/basic-languages/ruby/ruby.contribution";

import Interpreter from "./interpreter";
import PlaygroundChrome from "./playground-chrome";
import { PlaygroundRunAction, EvalType } from "./run-action";
import Module from "./wasm/playground.js";

import example from "./examples/forwardable_regexp_io.rb?raw";

// Since packaging is done outside of the ESM build, we need to instruct the
// editor how esbuild has named the bundles that contain the web workers.
//
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
(self as any).MonacoEnvironment = {
  getWorker(_, label) {
    switch (label) {
      case "json":
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return new jsonWorker();
      case "css":
      case "scss":
      case "less":
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return new cssWorker();
      case "html":
      case "handlebars":
      case "razor":
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return new htmlWorker();
      case "typescript":
      case "javascript":
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return new tsWorker();
      case "yaml":
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return new yamlWorker();
      default:
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return new editorWorker();
    }
  },
};

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
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("embed")) {
  const embeddableElement = document.getElementById("embeddable");
  embeddableElement?.setAttribute(
    "style",
    "position: absolute; width: 100%; height: 100%; top:0; left: 0; background-color: white; max-width: 100%",
  );
}

Module().then((wasm: Module.Ffi): void => {
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
    new PlaygroundRunAction(EvalType.button, chrome).makeHandler(artichoke),
  );

  // Add an editor action to run the buffer in an Artichoke Wasm interpreter.
  // This action is triggered by Ctrl/Cmd+F8 (the "play" button on a Mac
  // keyboard) and has the same side effects as clicking the "Run" button in the
  // webapp chrome.
  editor.addAction({
    id: "artichoke-playground-run-ruby",
    label: "Run Ruby source code",
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.F8],
    contextMenuGroupId: "2_playground_eval",
    run: new PlaygroundRunAction(EvalType.codeAction, chrome).makeHandler(
      artichoke,
    ),
  });

  window.gtag("event", "level_end", {
    level_name: level,
    success: true,
  });
});
