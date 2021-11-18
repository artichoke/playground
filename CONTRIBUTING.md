# Contributing to Artichoke

👋 Hi and welcome to [Artichoke]. Thanks for taking the time to contribute!
💪💎🙌

The Artichoke Playground is a WebAssembly frontend to [Artichoke Ruby] that lets
you experiment with the language in the browser. [There is lots to do].

If the Artichoke Playground does not run Ruby source code in the same way that
MRI does, it is a bug and we would appreciate if you [filed an issue so we can
fix it]. [File bugs specific to the Playground in this repository].

If you would like to contribute code 👩‍💻👨‍💻, find an issue that looks interesting
and leave a comment that you're beginning to investigate. If there is no issue,
please file one before beginning to work on a PR. [Good first issues are labeled
`E-easy`].

## Discussion

If you'd like to engage in a discussion outside of GitHub, you can [join
Artichoke's public Discord server].

## Setup

The Artichoke Playground includes Rust, Ruby, and Text sources. Developing on
the Artichoke Playground requires configuring several dependencies, which are
orchestrated by Rake.

### Rust Toolchain

The Artichoke Playground depends on stable Rust and several compiler plugins for
linting and formatting. The specific version of Rust Artichoke requires is
specified in the [toolchain file](rust-toolchain)

#### Installation

The recommended way to install the Rust toolchain is with [rustup]. On macOS,
you can install rustup with [Homebrew]:

```sh
brew install rustup-init
rustup-init
```

On Windows, you can install rustup from the official site and follow the
prompts: <https://rustup.rs/>. This requires a download of Visual Studio (the
[Community Edition][vs-community] is sufficient) and several C++ packages
selected through the VS component installer. (I'm not sure which packages are
required; I selected them all.)

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
specified in [`Cargo.lock`](Cargo.lock) by running:

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

Some artichoke dependencies, like the mruby [`sys`](artichoke-backend/src/sys)
FFI bindings and the [`onig`] crate, build C static libraries and require a C
compiler.

Artichoke specifically requires clang. WebAssembly targets require clang-8 or
newer.

On Windows, install the latest LLVM distribution from GitHub and add LLVM to
your PATH: <https://github.com/llvm/llvm-project/releases>.

#### `cc` Crate

Artichoke and some of its dependencies use the Rust [`cc` crate] to build. `cc`
uses a [platform-dependent C compiler] to compile C sources. On Unix, `cc` crate
uses the `cc` binary.

#### mruby Backend

To build the Artichoke mruby backend, you will need a C compiler toolchain. By
default, mruby requires the following to compile:

- clang
- ar

You can override the requirement for clang by setting the `CC` and `LD`
environment variables.

### Ruby

Artichoke requires a recent Ruby 2.x and [bundler](https://bundler.io/) 2.x. The
[`.ruby-version`](.ruby-version) file in the root of Artichoke specifies Ruby
2.6.3.

If you use [RVM], you can install Ruby dependencies by running:

```sh
rvm install "$(cat .ruby-version)"
gem install bundler
```

If you use [rbenv] and [ruby-build], you can install Ruby dependencies by
running:

```sh
rbenv install "$(cat .ruby-version)"
gem install bundler
rbenv rehash
```

The [`Gemfile`](Gemfile) in Artichoke specifies several dev dependencies. You
can install these dependencies by running:

```sh
bundle install
```

Artichoke uses [`rake`](Rakefile) as a task runner. You can see the available
tasks by running:

```console
$ bundle exec rake --tasks
rake build                        # Build Rust workspace
rake bundle:audit:check           # Checks the Gemfile.lock for insecure dependencies
rake bundle:audit:update          # Updates the bundler-audit vulnerability database
rake doc                          # Generate Rust API documentation
rake doc:open                     # Generate Rust API documentation and open it in a web browser
rake fmt                          # Format sources
rake fmt:rust                     # Format Rust sources with rustfmt
rake fmt:text                     # Format text, YAML, and Markdown sources with prettier
rake format                       # Format sources
rake format:rust                  # Format Rust sources with rustfmt
rake format:text                  # Format text, YAML, and Markdown sources with prettier
rake lint                         # Lint sources
rake lint:clippy                  # Lint Rust sources with Clippy
rake lint:clippy:restriction      # Lint Rust sources with Clippy restriction pass (unenforced lints)
rake lint:eslint                  # Lint JavaScript and TypeScript sources with eslint
rake lint:rubocop                 # Run RuboCop
rake lint:rubocop:auto_correct    # Auto-correct RuboCop offenses
rake release:markdown_link_check  # Check for broken links in markdown files
rake test                         # Run Playground unit tests
```

To lint Ruby sources, the playground uses [RuboCop]. RuboCop runs as part of the
`lint:all` task. You can run only RuboCop by invoking the `lint:rubocop` task.

### Python

Python is required for installing [emsdk], which is used for building on
WebAssembly targets.

On Windows, install the latest Python release from:
<https://www.python.org/downloads/>.

### Node.js

Node.js is required for bundling the webapp with esbuild and testing in
development.

Node.js is also required for formatting if modifying the following filetypes:

- `html`
- `js`
- `json`
- `md`
- `yaml`
- `yml`

You will need to install [Node.js].

On macOS, you can install Node.js with [Homebrew]:

```sh
brew install node
```

### Node.js Packages

Once you have Node.js installed, you can install the packages specified in
[`package.json`](package.json) by running:

```sh
npm ci
```

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
[`rust-toolchain`](rust-toolchain) file. This file is automatically picked up by
local builds and CI.

### Rust Crates

Version specifiers in `Cargo.toml` are NPM caret-style by default. A version
specifier of `4.1.2` means `4.1.2 <= version < 5.0.0`.

To see what crates are outdated, you can use [cargo-outdated].

If you need to pull in an updated version of a crate for a bugfix or a new
feature, update the version number in `Cargo.toml`. See
[artichoke/artichoke#548] for an example.

Regular dependency bumps are handled by [@dependabot].

### Artichoke

The Artichoke Playground pegs a version of `artichoke-backend` from the main
Artichoke repository by git hash. To update the version of Artichoke deployed to
the playground, update this hash in [`Cargo.toml`](playground/Cargo.toml).

[artichoke]: https://github.com/artichoke
[artichoke ruby]: https://github.com/artichoke/artichoke
[there is lots to do]: https://github.com/artichoke/artichoke/issues
[filed an issue so we can fix it]:
  https://github.com/artichoke/artichoke/issues/new
[file bugs specific to the playground in this repository]:
  https://github.com/artichoke/playground/issues/new
[good first issues are labeled `e-easy`]:
  https://github.com/artichoke/playground/labels/E-easy
[join artichoke's public discord server]: https://discord.gg/QCe2tp2
[rustup]: https://rustup.rs/
[homebrew]: https://docs.brew.sh/Installation
[vs-community]: https://visualstudio.microsoft.com/vs/community/
[`cc` crate]: https://crates.io/crates/cc
[platform-dependent c compiler]:
  https://github.com/alexcrichton/cc-rs#compile-time-requirements
[bundler]: https://bundler.io/
[rvm]: https://rvm.io/
[rbenv]: https://github.com/rbenv/rbenv
[ruby-build]: https://github.com/rbenv/ruby-build
[rubocop]: https://github.com/rubocop-hq/rubocop
[emsdk]: https://emscripten.org/docs/tools_reference/emsdk.html
[prettier]: https://prettier.io/
[node.js]: https://nodejs.org/en/download/package-manager/
[rust book chapter on testing]:
  https://doc.rust-lang.org/book/ch11-00-testing.html
[cargo-outdated]: https://github.com/kbknapp/cargo-outdated
[artichoke/artichoke#548]: https://github.com/artichoke/artichoke/pull/548
[@dependabot]: https://dependabot.com/
