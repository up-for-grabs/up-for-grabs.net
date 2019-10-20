# frozen_string_literal: true

require 'safe_yaml'
require 'uri'
require 'pathname'
require 'find'
require 'json_schemer'

require_relative 'directory_validator.rb'
require_relative 'data_files_validator.rb'

root = File.expand_path('..', __dir__)

DirectoryValidator.check(root)
DataFilesValidator.check(root)
