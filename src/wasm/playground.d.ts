declare function Module(): Module.Thenable;

declare const ArtichokeType: unique symbol;
declare const StringPointerType: unique symbol;

declare namespace Module {
  export class Thenable {
    then(thunk: (wasm: Ffi) => void): void;
  }

  export type Artichoke = number & { _opqaque: typeof ArtichokeType };
  export type StringPointer = number & { _opaque: typeof StringPointerType };

  export class Ffi {
    _artichoke_web_repl_init(): Artichoke;

    _artichoke_string_getlen(state: Artichoke, ptr: StringPointer): number;
    _artichoke_string_getch(
      state: Artichoke,
      ptr: StringPointer,
      index: number
    ): number;
    _artichoke_string_new(state: Artichoke): StringPointer;
    _artichoke_string_putch(
      state: Artichoke,
      ptr: StringPointer,
      byte: number
    ): void;
    _artichoke_string_free(state: Artichoke, ptr: StringPointer): void;

    _artichoke_eval(state: Artichoke, codeptr: StringPointer): StringPointer;
  }
}

export = Module;
