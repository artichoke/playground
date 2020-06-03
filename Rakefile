# frozen_string_literal: true

require 'fileutils'

task default: :lint

desc 'Lint and format'
task lint: %i[lint:format lint:clippy lint:rubocop lint:eslint]

namespace :lint do
  desc 'Run Clippy'
  task :clippy do
    roots = Dir.glob('**/{build,lib,main}.rs')
    roots.each do |root|
      FileUtils.touch(root)
    end
    sh 'cargo clippy'
  end

  desc 'Run RuboCop'
  task :rubocop do
    sh 'rubocop -a'
  end

  desc 'Format sources'
  task format: :deps do
    sh 'cargo fmt -- --color=auto'
    sh 'npm run fmt'
  end

  desc 'Run ESlint'
  task eslint: :deps do
    sh 'npx eslint --fix .'
  end

  desc 'Install linting dependencies'
  task :deps do
    sh 'npm ci'
  end
end
