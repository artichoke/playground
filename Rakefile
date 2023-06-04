# frozen_string_literal: true

require 'open-uri'
require 'shellwords'

require 'bundler/audit/task'
require 'rubocop/rake_task'
require 'tomlrb'

task default: %i[format lint]

desc 'Lint sources'
task lint: %i[lint:eslint lint:clippy lint:rubocop:autocorrect]

namespace :lint do
  RuboCop::RakeTask.new(:rubocop)

  desc 'Lint JavaScript and TypeScript sources with eslint'
  task :eslint do
    sh 'npm run lint:fix'
  end

  desc 'Lint Rust sources with Clippy'
  task :clippy do
    sh 'cargo clippy --workspace --all-features --all-targets'
    sh 'cargo clippy --workspace --all-features --all-targets --target wasm32-unknown-emscripten'
  end

  desc 'Lint Rust sources with Clippy restriction pass (unenforced lints)'
  task :'clippy:restriction' do
    lints = [
      'clippy::dbg_macro',
      'clippy::get_unwrap',
      'clippy::indexing_slicing',
      'clippy::panic',
      'clippy::print_stdout',
      'clippy::expect_used',
      'clippy::unwrap_used',
      'clippy::todo',
      'clippy::unimplemented',
      'clippy::unreachable'
    ]
    command = ['cargo', 'clippy', '--'] + lints.flat_map { |lint| ['-W', lint] }
    sh command.shelljoin
  end
end

desc 'Format sources'
task format: %i[format:rust format:text]

namespace :format do
  desc 'Format Rust sources with rustfmt'
  task :rust do
    sh 'cargo fmt -- --color=auto'
  end

  desc 'Format text, YAML, and Markdown sources with prettier'
  task :text do
    sh 'npx prettier --write "**/*"'
  end
end

desc 'Format sources'
task fmt: %i[fmt:rust fmt:text]

namespace :fmt do
  desc 'Format Rust sources with rustfmt'
  task :rust do
    sh 'cargo fmt -- --color=auto'
  end

  desc 'Format text, YAML, and Markdown sources with prettier'
  task :text do
    sh 'npx prettier --write "**/*"'
  end
end

desc 'Build Rust workspace'
task :build do
  sh 'cargo build --workspace'
end

desc 'Generate Rust API documentation'
task :doc do
  ENV['RUSTFLAGS'] = '-D warnings'
  ENV['RUSTDOCFLAGS'] = '-D warnings --cfg docsrs'
  sh 'rustup run --install nightly cargo doc --workspace --target wasm32-unknown-emscripten'
end

desc 'Generate Rust API documentation and open it in a web browser'
task :'doc:open' do
  ENV['RUSTFLAGS'] = '-D warnings'
  ENV['RUSTDOCFLAGS'] = '-D warnings --cfg docsrs'
  sh 'rustup run --install nightly cargo doc --workspace --open --target wasm32-unknown-emscripten'
end

desc 'Run Playground unit tests'
task :test do
  sh 'cargo test --workspace'
end

Bundler::Audit::Task.new

namespace :release do
  link_check_files = FileList.new('**/*.md') do |f|
    f.exclude('emsdk/**/*')
    f.exclude('node_modules/**/*')
    f.exclude('**/target/**/*')
    f.exclude('**/vendor/*/**/*')
    f.include('*.md')
    f.include('**/vendor/*.md')
  end

  link_check_files.sort.uniq.each do |markdown|
    desc 'Check for broken links in markdown files'
    task markdown_link_check: markdown do
      command = ['npx', 'markdown-link-check', '--config', '.github/markdown-link-check.json', markdown]
      sh command.shelljoin
      sleep(rand(1..5))
    end
  end
end

namespace :toolchain do
  desc 'Sync Rust toolchain to all sources'
  task sync: %i[sync:manifests sync:ci]

  rust_toolchain = Tomlrb.load_file('rust-toolchain.toml', symbolize_keys: true)
  toolchain_version = rust_toolchain[:toolchain][:channel]

  namespace :sync do
    desc 'Sync the root rust-toolchain version to all crate manifests'
    task :manifests do
      regexp = /^rust-version = "(.*)"$/
      next_rust_version = "rust-version = \"#{toolchain_version}\""

      pkg_files = FileList.new(['Cargo.toml'])

      failures = pkg_files.map do |file|
        contents = File.read(file)

        if (existing_version = contents.match(regexp))
          File.write(file, contents.gsub(regexp, next_rust_version)) if existing_version != next_rust_version
          next
        end

        puts "Failed to update #{file}, ensure there is a rust-version specified" if Rake.verbose
        file
      end.compact

      raise 'Failed to update some rust-versions' if failures.any?
    end

    desc 'Sync the root rust-toolchain version to CI jobs'
    task :ci do
      workflow_files = FileList.new('.github/workflows/*.yaml')

      workflow_files.each do |file|
        contents = File.read(file)
        contents = contents.gsub(/(toolchain: "?)\d+\.\d+\.\d+("?)/, "\\1#{toolchain_version}\\2")

        File.write(file, contents)
      end
    end
  end
end
