"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
require("bootstrap");
require("bootstrap/dist/css/bootstrap.min.css");
const monaco = __importStar(require("monaco-editor"));
// Assets with well-known filenames
require("@artichokeruby/logo/img/playground.png");
require("@artichokeruby/logo/img/playground-social-logo.png");
require("./assets/robots.txt");
const playground_js_1 = __importDefault(require("./wasm/playground.js"));
require("./wasm/playground.wasm");
const forwardable_regexp_io_rb_1 = __importDefault(require("./examples/forwardable_regexp_io.rb"));
var EvalType;
(function (EvalType) {
    EvalType["Button"] = "button";
    EvalType["CodeAction"] = "code_action";
})(EvalType || (EvalType = {}));
// The playground serializes the content of the code editor into the URL
// location hash to allow for sharing and deep linking, similar to
// https://sorbet.run.
//
// On page load, try to parse the deep-linked code out of the location hash. If
// present, initialize the code editor with this code, otherwise, initialize the
// editor with the bundled example Ruby code.
let sourceCode;
if (window.location.hash.length === 0) {
    sourceCode = forwardable_regexp_io_rb_1.default.trim();
}
else {
    sourceCode = decodeURIComponent(window.location.hash).slice(1);
}
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const editorElement = document.getElementById("editor");
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
(_a = editor.getModel()) === null || _a === void 0 ? void 0 : _a.onDidChangeContent(() => {
    var _a, _b;
    const lines = (_b = (_a = editor.getModel()) === null || _a === void 0 ? void 0 : _a.getLinesContent()) !== null && _b !== void 0 ? _b : [];
    const content = lines.join("\n");
    const encoded = encodeURIComponent(content);
    // Don't break the back button.
    //
    // All edits to source code result in no additional browser history states.
    history.replaceState(undefined, "", `#${encoded}`);
});
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const outputElement = document.getElementById("output");
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
    embeddableElement === null || embeddableElement === void 0 ? void 0 : embeddableElement.setAttribute("style", "position: absolute; width: 100%; height: 100%; top:0; left: 0; background-color: white; max-width: 100%");
}
class Interpreter {
    constructor(wasm) {
        this.wasm = wasm;
        // Unmarshal a string from the FFI state by retrieving the string contents
        // one byte at a time.
        //
        // Strings are UTF-8 encoded byte vectors.
        this.read = (ptr) => {
            const len = this.wasm._artichoke_string_getlen(this.state, ptr);
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
        this.write = (s) => {
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
        this.evalRuby = (source) => {
            this.evalCounter += 1;
            const level = `eval-ffi-${this.evalCounter}`;
            window.gtag("event", "level_start", {
                level_name: level,
            });
            const code = this.write(source);
            const output = this.wasm._artichoke_eval(this.state, code);
            const result = this.read(output);
            this.wasm._artichoke_string_free(this.state, code);
            this.wasm._artichoke_string_free(this.state, output);
            window.gtag("event", "level_end", {
                level_name: level,
                success: true,
            });
            return result;
        };
        this.state = wasm._artichoke_web_repl_init();
        this.evalCounter = 0;
    }
}
let buttonEvalCounter = 0;
let codeActionEvalCounter = 0;
// Factory for an event handler that reads the source code int the editor
// buffer and evals it on an embedded Artichoke Wasm interpreter.
//
// The output editor is updated with the contents of the report from the
// interperter containing stdout, stderr, and the output from calling `inspect`
// on the returned value.
const playgroundRun = (interp, evalType) => () => {
    var _a, _b, _c;
    let counter;
    switch (evalType) {
        case EvalType.Button: {
            buttonEvalCounter += 1;
            counter = buttonEvalCounter;
            break;
        }
        case EvalType.CodeAction: {
            codeActionEvalCounter += 1;
            counter = codeActionEvalCounter;
            break;
        }
    }
    const level = `playground-run-${evalType}-${counter}`;
    window.gtag("event", "level_start", {
        level_name: level,
    });
    const sourceLines = (_b = (_a = editor.getModel()) === null || _a === void 0 ? void 0 : _a.getLinesContent()) !== null && _b !== void 0 ? _b : [];
    const source = sourceLines.join("\n");
    const result = interp.evalRuby(source);
    (_c = output.getModel()) === null || _c === void 0 ? void 0 : _c.setValue(result);
    window.gtag("event", "level_end", {
        level_name: level,
        success: true,
    });
};
playground_js_1.default().then((wasm) => {
    const level = `playground-interpreter-init`;
    window.gtag("event", "level_start", {
        level_name: level,
    });
    const artichoke = new Interpreter(wasm);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const buildInfoElement = document.getElementById("artichoke-build-info");
    buildInfoElement.textContent = artichoke.read(0);
    // When the user clicks the "Run" button, grab the source code from the editor
    // buffer and eval it on an Artichoke Wasm interpreter.
    const runButton = document.getElementById("run");
    runButton === null || runButton === void 0 ? void 0 : runButton.addEventListener("click", playgroundRun(artichoke, EvalType.Button));
    // Add an editor action to run the buffer in an Artichoke Wasm interpreter.
    // This action is triggered by Ctrl/Cmd+F8 (play button on a mac keyboard) and
    // has the same side effects as clicking the "Run" button in the webapp
    // chrome.
    editor.addAction({
        id: "artichoke-playground-run-ruby",
        label: "Run Ruby source code",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.F8],
        contextMenuGroupId: "2_playground_eval",
        run: playgroundRun(artichoke, EvalType.CodeAction),
    });
    window.gtag("event", "level_end", {
        level_name: level,
        success: true,
    });
});
