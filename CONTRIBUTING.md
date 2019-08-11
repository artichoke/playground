# Contributing to Artichoke

👋 Hi and welcome to [Artichoke](https://github.com/artichoke). Thanks for
taking the time to contribute! 💪💎🙌

The Artichoke Playground is a WebAssembly frontend to
[Artichoke Ruby](https://github.com/artichoke/artichoke) that lets you
experiment with the language in the browser.
[There is lots to do](https://github.com/artichoke/artichoke/issues).

If the Artichoke Playground does not run Ruby source code in the same way that
MRI does, it is a bug and we would appreciate if you
[filed an issue so we can fix it](https://github.com/artichoke/playground/issues/new).

If you would like to contribute code 👩‍💻👨‍💻, find an issue that looks interesting
and leave a comment that you're beginning to investigate. If there is no issue,
please file one before beginning to work on a PR.

## Discussion

If you'd like to engage in a discussion outside of GitHub, you can
[join Artichoke's public Discord server](https://discord.gg/QCe2tp2).

## Setup

The Artichoke Playground includes Rust, Ruby, Shell, and Text sources.
Developing on the Artichoke Playground requires configuring several
dependencies, which are orchestrated by [Yarn](https://yarnpkg.com/).

### Rust Toolchain

The Artichoke Playground depends on nightly Rust and several compiler plugins
for linting and formatting. The specific version of Rust Artichoke requires is
specified in the [toolchain file](/rust-toolchain)

#### Installation

The recommended way to install the Rust toolchain is with
[rustup](https://rustup.rs/). On macOS, you can install rustup with
[Homebrew](https://docs.brew.sh/Installation):

```shell
brew install rustup-init
rustup-init
```

Once you have rustup, you can install the Rust toolchain needed to compile the
Artichoke Playground.

```shell
rustup toolchain install "$(cat rust-toolchain)"
rustup component add rustfmt
rustup component add clippy
```

### Rust Crates

The Artichoke Playground depends on several Rust libraries, or crates. Once you
have the Rust toolchain installed, you can install the crates specified in
[`Cargo.lock`](/Cargo.lock) by running:

```shell
cargo build
```

You can check to see that this worked by running the following and observing no
errors:

```shell
cargo test
cargo fmt -- --check
cargo clippy --all-targets --all-features
```

### C Toolchain

#### `cc` Crate

The Artichoke Playground depends on Artichoke. Artichoke and some of its
dependencies use the Rust [`cc` crate](https://crates.io/crates/cc) to build.
`cc` uses a
[platform-dependent C compiler](https://github.com/alexcrichton/cc-rs#compile-time-requirements)
to compile C sources. On Unix, `cc` crate uses the `cc` binary.

#### mruby Backend

To build the Artichoke mruby backend, you will need a C compiler toolchain. By
default, mruby requires the following to compile:

- ar
- gcc
- bison
- gperf

You can override the requirement for gcc by setting the `CC` and `LD`
environment variables.

### Node.js

The Artichoke Playground uses Yarn and Node.js for linting and orchestration.

You will need to install
[Node.js](https://nodejs.org/en/download/package-manager/) and
[Yarn](https://yarnpkg.com/en/docs/install).

On macOS, you can install Node.js and Yarn with
[Homebrew](https://docs.brew.sh/Installation):

```shell
brew install node yarn
```

### Node.js Packages

Once you have Yarn installed, you can install the packages specified in
[`package.json`](/package.json) by running:

```shell
yarn install
```

You can check to see that this worked by running `yarn lint` and observing no
errors.

### Ruby

Artichoke and the Artichoke Playground require a recent Ruby 2.x and
[bundler](https://bundler.io/) 2.x. The [`.ruby-version`](/.ruby-version) file
in the root of Artichoke specifies Ruby 2.6.3.

If you use [RVM](https://rvm.io/), you can install Ruby dependencies by running:

```shell
rvm install "$(cat .ruby-version)"
gem install bundler
```

If you use [rbenv](https://github.com/rbenv/rbenv) and
[ruby-build](https://github.com/rbenv/ruby-build), you can install Ruby
dependencies by running:

```shell
rbenv install "$(cat .ruby-version)"
gem install bundler
rbenv rehash
```

To lint Ruby sources, Artichoke uses
[RuboCop](https://github.com/rubocop-hq/rubocop). `yarn lint` installs RuboCop
and all other gems automatically.

### Shell

The Artichoke Playground uses [shfmt](https://github.com/mvdan/sh) for
formatting and [shellcheck](https://github.com/koalaman/shellcheck) for linting
Shell scripts.

On macOS, you can install shfmt and shellcheck with
[Homebrew](https://docs.brew.sh/Installation):

```shell
brew install shfmt shellcheck
```

## Code Quality

### Linting

Once you [configure a development environment](#setup), run the following to
lint sources:

```shell
yarn lint
```

Merges will be blocked by CI if there are lint errors.

## Updating Dependencies

### Rust Toolchain

Because rustfmt, clippy, and the language server sometimes break on nightly, th
Artichoke Playground pegs a specific date archive of nightly. If you want to
update the pegged nightly version, choose one that has
[passing builds for rustfmt, clippy, and rls](https://rust-lang-nursery.github.io/rust-toolstate/);
otherwise, the build will fail on [CI](/.circleci/config.yml).

### Rust Crates

Version specifiers in `Cargo.toml` are NPM caret-style by default. A version
specifier of `4.1.2` means `4.1.2 <= version < 5.0.0`.

To see what crates are outdated, you can use
[cargo-outdated](https://github.com/kbknapp/cargo-outdated).

If you need to pull in an updated version of a crate for a bugfix or a new
feature, update the version number in `Cargo.toml`.

To update Rust crate dependencies run the following command and check in the
updated `Cargo.lock` file:

```shell
cargo update
```

### Artichoke

The Artichoke Playground pegs a version of `artichoke-backend` from the main
Artichoke repository by git hash. To update the version of Artichoke deployed to
the playground, update this hash in [`Cargo.toml`](/playground/Cargo.toml).

### Node.js Packages

To see what packages are outdated, you can run `yarn outdated`.

To update Node.js package dependencies run the following command and check in
the updated `yarn.lock` file:

```shell
yarn upgrade
```

If after running `yarn upgrade` there are still outdated packages reported by
`yarn outdated`, there has likely been a major release of a dependency. If you
would like to update the dependency and deal with any breakage, please do;
otherwise, please
[file an issue](https://github.com/artichoke/playground/issues/new).

## Code Analysis

### Source Code Statistics

To view statistics about the source code in the Artichoke Playground, you can
run `yarn loc`, which depends on [loc](https://github.com/cgag/loc). You can
install loc by running:

```shell
cargo install loc
```
