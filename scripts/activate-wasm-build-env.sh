#!/usr/bin/env bash

link_args=(
  -s "NO_EXIT_RUNTIME=1"
  -s "WASM=1"
  -s "ASSERTIONS=1"
  -s "ENVIRONMENT=web"
  -s 'EXPORTED_FUNCTIONS=["_artichoke_web_repl_init","_artichoke_string_new","_artichoke_string_free","_artichoke_string_getlen","_artichoke_string_getch","_artichoke_string_putch","_artichoke_eval"]'
  -s 'EXTRA_EXPORTED_RUNTIME_METHODS=["ccall","cwrap"]'
)

declare -a rustc_linker_flags
for flag in "${link_args[@]}"; do
  rustc_linker_flags+=("-C")
  rustc_linker_flags+=("link-arg=$flag")
done

RUSTFLAGS="${rustc_linker_flags[*]}"
export RUSTFLAGS

ensure_emsdk() {
  # shellcheck disable=SC2091
  if [ ! -f "target/emsdk/emsdk" ]; then
    git clone https://github.com/emscripten-core/emsdk.git target/emsdk
    ./target/emsdk/emsdk install latest
  fi
  ./target/emsdk/emsdk activate latest
}

clean_emsdk() {
  rm -rf ./target/emsdk
}

ensure_emsdk
# shellcheck disable=SC1091
. target/emsdk/emsdk_env.sh
