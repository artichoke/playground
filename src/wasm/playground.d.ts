declare function Module(): Module.Thenable;

declare namespace Module {
  export class Thenable {
    then(thunk: (wasm: Ffi) => void): void;
  }

  export class Ffi {
    _artichoke_web_repl_init(): number;

    _artichoke_string_getlen(state: number, ptr: number): number;
    _artichoke_string_getch(state: number, ptr: number, index: number): number;
    _artichoke_string_new(state: number): number;
    _artichoke_string_putch(state: number, ptr: number, byte: number): void;
    _artichoke_string_free(state: number, ptr: number): void;

    _artichoke_eval(state: number, codeptr: number): number;
  }
}

export = Module;
