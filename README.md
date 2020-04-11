# Artichoke Playground

[![GitHub Actions](https://github.com/artichoke/playground/workflows/CI/badge.svg)](https://github.com/artichoke/playground/actions)
[![GitHub Actions](https://github.com/artichoke/playground/workflows/Playground/badge.svg)](https://github.com/artichoke/playground/actions)
[![Discord](https://img.shields.io/discord/607683947496734760)](https://discord.gg/QCe2tp2)
[![Twitter](https://img.shields.io/twitter/follow/artichokeruby?label=Follow&style=social)](https://twitter.com/artichokeruby)

The Artichoke Playground is a WebAssembly frontend for
[Artichoke Ruby](https://github.com/artichoke/artichoke) hosted at
<https://artichoke.run>.

## Try Artichoke

<p align="center">
  <a href="https://artichoke.run">
    <img style="max-width: 400px" width="400" src="https://artichoke.run/playground.png?bust">
  </a>
  <br>
  <em>Artichoke Ruby Wasm Playground</em>
</p>

You can [try Artichoke in your browser](https://artichoke.run). The
[Artichoke Playground](https://github.com/artichoke/playground) runs a
[WebAssembly](https://webassembly.org/) build of
[Artichoke](https://github.com/artichoke/artichoke).

If you would prefer to run a local build of the playground, you can
[set up a Rust toolchain](/CONTRIBUTING.md#rust-toolchain) and a launch local
development server with:

```sh
rustup target add wasm32-unknown-emscripten
. scripts/install-emscripten-toolchain.sh
npm build
npm run dev:open
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
