# Artichoke Playground

[![CircleCI](https://circleci.com/gh/artichoke/playground.svg?style=svg)](https://circleci.com/gh/artichoke/playground)
[![Discord](https://img.shields.io/discord/607683947496734760)](https://discord.gg/QCe2tp2)

The Artichoke Playground is a WebAssembly frontend for
[Artichoke Ruby](https://github.com/artichoke/artichoke) hosted at
<https://artichoke.run>.

## Try Artichoke

You can [try Artichoke in your browser](https://artichoke.run). The Artichoke
Playground runs a [WebAssembly](https://webassembly.org/) build of
[Artichoke](https://github.com/artichoke/artichoke).

If you would prefer to run a local build,
[set up a Rust toolchain](/CONTRIBUTING.md#rust-toolchain) and launch local
development server with:

```shell
. scripts/activate-wasm-build-env.sh
cargo build --target wasm32-unknown-emscripten
yarn serve-wasm
```

## Contributing

Artichoke aspires to be a Ruby 2.6.3-compatible implementation of the Ruby
programming language.
[There is lots to do](https://github.com/artichoke/artichoke/issues).

If the Artichoke Playground does not run Ruby source code in the same way that
MRI does, it is a bug and we would appreciate if you
[filed an issue so we can fix it](https://github.com/artichoke/playground/issues/new).

If you would like to contribute code 👩‍💻👨‍💻, find an issue that looks interesting
and leave a comment that you're beginning to investigate. If there is no issue,
please file one before beginning to work on a PR.

### Discussion

If you'd like to engage in a discussion outside of GitHub, you can
[join Artichoke's public Discord server](https://discord.gg/QCe2tp2).
