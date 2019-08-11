#!/usr/bin/env bash

set -euo pipefail

yarn install
PATH="$(yarn bin):$PATH"
export PATH
cd "$(pkg-dir)"

set -x

mkdir -p target/wasm32-unknown-emscripten/debug/deps
touch target/wasm32-unknown-emscripten/debug/playground.wasm
touch target/wasm32-unknown-emscripten/debug/deps/playground.js
mkdir -p target/wasm32-unknown-emscripten/release/deps
touch target/wasm32-unknown-emscripten/release/playground.wasm
touch target/wasm32-unknown-emscripten/release/deps/playground.js

# Yarn orchestration

## Lint package.json
pjv

# Rust sources

## Format with rustfmt
cargo fmt
## Lint with Clippy
cargo clippy --all-targets --all-features
## Lint docs
cargo doc --no-deps --all

# Lint Ruby sources

lint_ruby_sources() {
  pushd "$@" >/dev/null
  bundle install >/dev/null
  bundle exec rubocop -a
  popd >/dev/null
}

lint_ruby_sources examples

# Shell sources

## Format with shfmt
shfmt -f . | grep -v target/ | grep -v node_modules/ | grep -v /vendor/ | xargs shfmt -i 2 -ci -s -w
## Lint with shellcheck
shfmt -f . | grep -v target/ | grep -v node_modules/ | grep -v /vendor/ | xargs shellcheck

# Web sources

## Format with prettier
./scripts/format-text.sh --format "css"
./scripts/format-text.sh --format "html"
./scripts/format-text.sh --format "js"
./scripts/format-text.sh --format "json"
./scripts/format-text.sh --format "yaml"
./scripts/format-text.sh --format "yml"
## Lint with eslint
# TODO: uncomment once there are JS or HTML sources in the repo
# yarn run eslint --fix --ext .html,.js .

# Text sources

## Format with prettier
./scripts/format-text.sh --format "md"
