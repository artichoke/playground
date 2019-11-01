#!/usr/bin/env bash

ensure_emsdk() {
  # shellcheck disable=SC2091
  if [ ! -f "emsdk/emsdk" ]; then
    git clone https://github.com/emscripten-core/emsdk.git emsdk
    ./emsdk/emsdk install "$(cat emscripten-toolchain)"
  fi
  ./emsdk/emsdk activate "$(cat emscripten-toolchain)"
}

clean_emsdk() {
  rm -rf ./emsdk
}

ensure_emsdk
# shellcheck disable=SC1091
. ./emsdk/emsdk_env.sh
