# frozen_string_literal: true

task default: 'lint:all'

namespace :lint do
  desc 'Lint and format'
  task all: %i[format rubocop eslint]

  desc 'Run rubocop'
  task :rubocop do
    sh 'rubocop -a'
  end

  desc 'Format sources'
  task format: :deps do
    sh 'cargo fmt -- --color=auto'
    sh "npx prettier --write '**/*'"
    sh "npx prettier --prose-wrap always --write '**/*.md' '*.md'"
  end

  desc 'Run eslint'
  task eslint: :deps do
    sh 'npx eslint --fix .'
  end

  desc 'Install linting dependencies'
  task :deps do
    sh 'yarn install --frozen-lockfile'
  end
end
