# Artichoke Playground

[![GitHub Actions](https://github.com/artichoke/playground/workflows/CI/badge.svg)](https://github.com/artichoke/playground/actions)
[![GitHub Actions](https://github.com/artichoke/playground/workflows/Playground/badge.svg)](https://github.com/artichoke/playground/actions)
[![Discord](https://img.shields.io/discord/607683947496734760)](https://discord.gg/QCe2tp2)
[![Twitter](https://img.shields.io/twitter/follow/artichokeruby?label=Follow&style=social)](https://twitter.com/artichokeruby)

The Artichoke Playground is a WebAssembly frontend for [Artichoke
Ruby][artichoke-repo] hosted at <https://artichoke.run>.

## Try Artichoke

<p align="center">
  <a href="https://artichoke.run/#gh-light-mode-only">
    <img style="max-width: 400px" width="400" src="https://artichoke.run/artichoke-playground-safari-revision-4938-light-mode.png">
  </a>
  <a href="https://artichoke.run/#gh-dark-mode-only">
    <img style="max-width: 400px" width="400" src="https://artichoke.run/artichoke-playground-safari-revision-4938-dark-mode.png">
  </a>
  <br>
  <em>Artichoke Ruby Wasm Playground</em>
</p>

You can [try Artichoke in your browser][playground]. The [Artichoke
Playground][playground-repo] runs a [WebAssembly] build of
[Artichoke][artichoke-repo].

If you would prefer to run a local build of the playground, you can
[set up a Rust toolchain](CONTRIBUTING.md#rust-toolchain) and a launch local
development server with:

```sh
npm ci
. scripts/install-emscripten-toolchain.sh
npm run dev:debug # or npm run dev:release
```

## Contributing

Artichoke aspires to be an [MRI Ruby-compatible][mri-target] implementation of
the Ruby programming language. [There is lots to do][github-issues].

If the Artichoke Playground does not run Ruby source code in the same way that
MRI does, it is a bug and we would appreciate if you [filed an issue so we can
fix it][file-an-issue].

If you would like to contribute code 👩‍💻👨‍💻, find an issue that looks interesting
and leave a comment that you're beginning to investigate. If there is no issue,
please file one before beginning to work on a PR. [Good first issues are labeled
`E-easy`][e-easy].

### Discussion

If you'd like to engage in a discussion outside of GitHub, you can [join
Artichoke's public Discord server][discord].

[artichoke-repo]: https://github.com/artichoke/artichoke
[playground]: https://artichoke.run
[playground-repo]: https://github.com/artichoke/playground
[webassembly]: https://webassembly.org/
[mri-target]:
  https://github.com/artichoke/artichoke/blob/trunk/RUBYSPEC.md#mri-target
[github-issues]: https://github.com/artichoke/artichoke/issues
[file-an-issue]: https://github.com/artichoke/playground/issues/new
[discord]: https://discord.gg/QCe2tp2
[e-easy]: https://github.com/artichoke/artichoke/labels/E-easy
