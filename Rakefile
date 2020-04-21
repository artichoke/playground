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
    sh 'npm run fmt'
    sh 'npm run fmt:md'
    sh 'npm run fmt:yaml'
  end

  desc 'Run eslint'
  task eslint: :deps do
    sh 'npx eslint --fix .'
  end

  desc 'Install linting dependencies'
  task :deps do
    sh 'npm ci'
  end
end
