# frozen_string_literal: true

require 'safe_yaml'
require 'uri'
require 'pathname'
require 'find'
require 'json_schemer'
require 'up_for_grabs_tooling'

require_relative 'directory_reporter.rb'
require_relative 'data_files_reporter.rb'

root = File.dirname(__dir__)

DirectoryReporter.check(root)
DataFilesReporter.check(root)
