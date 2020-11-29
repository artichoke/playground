# frozen_string_literal: true

require 'forwardable'

class Properties
  extend Forwardable
  def_delegators :@properties, :[], :[]=

  def initialize(name)
    @name = name
    @properties = {}
  end

  def inspect
    @name
  end

  def to_h
    @properties
  end
end

artichoke = Properties.new('Artichoke Ruby')
artichoke[:language] = 'Ruby'
artichoke[:implementation] = 'Artichoke'
artichoke[:target] = 'wasm'
artichoke[:emoji] = '💎'

puts artichoke.inspect if artichoke[:emoji] =~ /💎/

artichoke.to_h
