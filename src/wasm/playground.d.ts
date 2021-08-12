declare function Module(): Module.Thenable;

declare const ARTICHOKE_TYPE: unique symbol;
declare const STRING_POINTER_TYPE: unique symbol;

declare namespace Module {
  export class Thenable {
    public then(thunk: (wasm: Ffi) => void): void;
  }

  export type Artichoke = number & { _opaque: typeof ARTICHOKE_TYPE };
  export type StringPointer = number & { _opaque: typeof STRING_POINTER_TYPE };

  export class Ffi {
    public _artichoke_web_repl_init(): Artichoke;

    public _artichoke_string_getlen(
      state: Artichoke,
      ptr: StringPointer
    ): number;
    public _artichoke_string_getch(
      state: Artichoke,
      ptr: StringPointer,
      index: number
    ): number;
    public _artichoke_string_new(state: Artichoke): StringPointer;
    _artichoke_string_putch(
      state: Artichoke,
      ptr: StringPointer,
      byte: number
    ): void;
    public _artichoke_string_free(state: Artichoke, ptr: StringPointer): void;

    public _artichoke_eval(
      state: Artichoke,
      codeptr: StringPointer
    ): StringPointer;
  }
}

export = Module;
