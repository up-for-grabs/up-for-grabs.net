# frozen_string_literal: true

require 'safe_yaml'
require 'uri'
require 'pathname'
require 'find'
require 'json_schemer'
require 'up_for_grabs_tooling'

root = Pathname.new(File.dirname(__dir__))

result = CommandLineValidator.validate(root)

CommandLineFormatter.output(result)

exit(1) unless result[:success]
