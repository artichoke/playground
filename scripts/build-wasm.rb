#!/usr/bin/env ruby
# frozen_string_literal: true

require 'fileutils'

module Artichoke
  module Playground
    module Build
      RUSTFLAGS = %w[
        -C
        link-arg=-s
        -C
        link-arg=MODULARIZE=1
        -C
        link-arg=-s
        -C
        link-arg=WASM=1
        -C
        link-arg=-s
        -C
        link-arg=ENVIRONMENT=web
        -C
        link-arg=-s
        -C
        link-arg=SUPPORT_LONGJMP=1
      ].freeze

      def self.debug
        ENV['RUSTFLAGS'] = RUSTFLAGS.join(' ')

        `cargo build --target wasm32-unknown-emscripten`

        FileUtils.mv(
          ['target/wasm32-unknown-emscripten/debug/playground.js',
           'target/wasm32-unknown-emscripten/debug/playground.wasm'],
          'src/wasm/'
        )
      rescue ArgumentError, Errno::ENOENT
        # pass
      end

      def self.release(verbose: false)
        ENV['RUSTFLAGS'] = RUSTFLAGS.join(' ')

        if verbose
          `cargo build --target wasm32-unknown-emscripten --release --verbose`
        else
          `cargo build --target wasm32-unknown-emscripten --release`
        end

        FileUtils.mv(
          ['target/wasm32-unknown-emscripten/release/playground.js',
           'target/wasm32-unknown-emscripten/release/playground.wasm'],
          'src/wasm/'
        )
      rescue ArgumentError, Errno::ENOENT
        # pass
      end

      def self.main
        if ARGV == ['--release', '--verbose'] || ARGV == ['--verbose', '--release']
          release(verbose: true)
        elsif ARGV == ['--release']
          release
        elsif ARGV.empty?
          debug
        else
          warn "Usage: #{$PROGRAM_NAME} [ --release ]"
        end
      end
    end
  end
end

Artichoke::Playground::Build.main if __FILE__ == $PROGRAM_NAME
