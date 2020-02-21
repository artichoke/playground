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

The Artichoke Playground includes Rust, Ruby, and Text sources. Developing on
the Artichoke Playground requires configuring several dependencies, which are
orchestrated by [Yarn](https://yarnpkg.com/).

### Rust Toolchain

The Artichoke Playground depends on stable Rust and several compiler plugins for
linting and formatting. The specific version of Rust Artichoke requires is
specified in the [toolchain file](/rust-toolchain)

#### Installation

The recommended way to install the Rust toolchain is with
[rustup](https://rustup.rs/). On macOS, you can install rustup with
[Homebrew](https://docs.brew.sh/Installation):

```sh
brew install rustup-init
rustup-init
```

Once you have rustup, you can install the Rust toolchain needed to compile the
playground.

```sh
rustup toolchain install "$(cat rust-toolchain)"
rustup component add rustfmt
rustup component add clippy
```

### Rust Crates

The playground depends on several Rust libraries. In Rust, a library is called a
_crate_. Once you have the Rust toolchain installed, you can install the crates
specified in [`Cargo.lock`](/Cargo.lock) by running:

```sh
cargo build
```

You can check to see that this worked by running the following and observing no
errors:

```sh
cargo test
cargo fmt -- --check
cargo clippy --all-targets --all-features
```

### C Toolchain

#### `cc` Crate

Artichoke and some of its dependencies use the Rust
[`cc` crate](https://crates.io/crates/cc) to build. `cc` uses a
[platform-dependent C compiler](https://github.com/alexcrichton/cc-rs#compile-time-requirements)
to compile C sources. On Unix, `cc` crate uses the `cc` binary.

#### mruby Backend

To build the Artichoke mruby backend, you will need a C compiler toolchain. By
default, mruby requires the following to compile:

- clang
- bison
- ar

You can override the requirement for clang by setting the `CC` and `LD`
environment variables.

### Ruby

Artichoke requires a recent Ruby 2.x and [bundler](https://bundler.io/) 2.x. The
[`.ruby-version`](/.ruby-version) file in the root of Artichoke specifies Ruby
2.6.3.

If you use [RVM](https://rvm.io/), you can install Ruby dependencies by running:

```sh
rvm install "$(cat .ruby-version)"
gem install bundler
```

If you use [rbenv](https://github.com/rbenv/rbenv) and
[ruby-build](https://github.com/rbenv/ruby-build), you can install Ruby
dependencies by running:

```sh
rbenv install "$(cat .ruby-version)"
gem install bundler
rbenv rehash
```

The [`Gemfile`](/Gemfile) in Artichoke specifies several dev dependencies. You
can install these dependencies by running:

```sh
bundle install
```

Artichoke uses [`rake`](/Rakefile) as a task runner. You can see the available
tasks by running:

```console
$ bundle exec rake --tasks
rake doc               # Generate Rust API documentation
rake doc:open          # Generate Rust API documentation and open it in a web browser
rake lint:all          # Lint and format
rake lint:deps         # Install linting dependencies
rake lint:format       # Format sources
rake lint:restriction  # Lint with restriction pass (unenforced lints)
rake lint:rubocop      # Run rubocop
rake spec              # Run enforced ruby/spec suite
```

To lint Ruby sources, the playground uses
[RuboCop](https://github.com/rubocop-hq/rubocop). RuboCop runs as part of the
`lint:all` task. You can run only RuboCop by invoking the `lint:rubocop` task.

### Node.js

Node.js and Yarn are optional dependencies that are used for formatting text
sources with [prettier](https://prettier.io/).

Node.js is only required for formatting if modifying the following filetypes:

- `html`
- `js`
- `json`
- `md`
- `toml`
- `yaml`
- `yml`

You will need to install
[Node.js](https://nodejs.org/en/download/package-manager/) and
[Yarn](https://yarnpkg.com/en/docs/install).

On macOS, you can install Node.js and Yarn with
[Homebrew](https://docs.brew.sh/Installation):

```sh
brew install node yarn
```

### Node.js Packages

Once you have Yarn installed, you can install the packages specified in
[`package.json`](/package.json) by running:

```sh
yarn install
```

You can check to see that this worked by running `yarn lint` and observing no
errors.

## Code Quality

### Linting

Once you [configure a development environment](#setup), run the following to
lint sources:

```sh
rake lint:all
```

Merges will be blocked by CI if there are lint errors.

## Updating Dependencies

### Rust Toolchain

The rust-toolchain can be bumped to the latest stable compiler by editing the
[`rust-toolchain`](/rust-toolchain) file. This file is automatically picked up
by local builds and CI.

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
