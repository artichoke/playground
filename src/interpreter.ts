import Module from "./wasm/playground.js";

// `Interpreter` is a wrapper around an `Artichoke` interpreter and string heap.
//
// The interpreter allows marshalling byte strings between JavaScript and
// WebAssembly contexts by reading and writing one byte at a time.
//
// The interpreter exposes a method for evaling a JavaScript string as a Ruby
// source and extracting the result of the code's `stdout`, `stderr`, and
// `output.inspect` contents to a JavaSctipt string.
export default class Interpreter {
  // A handle to the Emscripten "shared object" containing the Artichoke
  // Playground's FFI exports.
  private readonly wasm: Module.Ffi;

  // An opaque pointer to an `Artichoke` interpreter and string heap.
  private readonly state: Module.Artichoke;

  // Telemetry for tracking how many times the interpreter has eval'd code.
  //
  // This number is used to generate "levels" for tracking with Google Analytics
  // and Google Tag Manager.
  private evalCounter = 0;

  constructor(ffi: Module.Ffi) {
    this.wasm = ffi;
    this.state = this.wasm._artichoke_web_repl_init();
  }

  // Unmarshal a string from the FFI state by retrieving the string contents
  // one byte at a time.
  //
  // Strings are UTF-8 encoded byte vectors.
  read(ptr: Module.StringPointer): string {
    const len: number = this.wasm._artichoke_string_getlen(this.state, ptr);
    const bytes = new Uint8Array(len);
    for (let idx = 0; idx < len; idx += 1) {
      const byte = this.wasm._artichoke_string_getch(this.state, ptr, idx);
      bytes[idx] = byte;
    }
    return new TextDecoder().decode(bytes);
  }

  // Marshal a string into the FFI state by allocating and pushing one byte at
  // a time.
  //
  // Strings are UTF-8 encoded byte vectors.
  write(s: string): Module.StringPointer {
    const ptr = this.wasm._artichoke_string_new(this.state);
    const bytes = new TextEncoder().encode(s);
    for (const byte of bytes) {
      this.wasm._artichoke_string_putch(this.state, ptr, byte);
    }
    return ptr;
  }

  // Write the source code into the shared Rust/JavaScript string heap and
  // eval this code on a new Artichoke interpreter via FFI.
  evalRuby(source: string): string {
    this.evalCounter += 1;

    const level = `eval-ffi-${this.evalCounter}`;
    window.gtag("event", "level_start", {
      level_name: level,
    });

    const code = this.write(source);
    const evalOutput = this.wasm._artichoke_eval(this.state, code);
    const result = this.read(evalOutput);
    this.wasm._artichoke_string_free(this.state, code);
    this.wasm._artichoke_string_free(this.state, evalOutput);

    window.gtag("event", "level_end", {
      level_name: level,
      success: true,
    });

    return result;
  }
}
