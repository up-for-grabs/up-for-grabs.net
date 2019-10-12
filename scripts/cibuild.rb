# frozen_string_literal: true

require 'safe_yaml'
require 'uri'
require 'pathname'
require 'find'
require 'json_schemer'

require_relative 'project_validator.rb'

def check_folder(root)
  other_files = []

  Find.find("#{root}/_data/projects") do |path|
    next unless FileTest.file?(path)

    other_files << path if File.extname(path) != '.yml'
  end

  count = other_files.count

  return unless count.positive?

  puts "#{count} files found in projects directory which are not YAML files:"
  r = Pathname.new(root)

  other_files.each do |f|
    relative_path = Pathname.new(f).relative_path_from(r).to_s
    puts " - #{relative_path}"
  end

  exit(-1)
end

root = File.expand_path('..', __dir__)

check_folder(root)

projects = Dir["#{root}/_data/projects/*.yml"].map do |f|
  relative_path = Pathname.new(f).relative_path_from(root).to_s
  Project.new(relative_path, f)
end

projects_with_errors = []
projects_without_issues = []

schema = Pathname.new("#{root}/schema.json")
schemer = JSONSchemer.schema(schema)

projects.each do |p|
  validation_errors = p.validation_errors(schemer)
  if validation_errors.empty?
    projects_without_issues << [p, nil]
  else
    projects_with_errors << [p, validation_errors]
  end
end

if projects_with_errors.any?
  puts "#{projects_with_errors.count} errors found processing projects:"
  projects_with_errors.each do |project, errors|
    puts " - #{project.relative_path}:"
    errors.each { |error| puts "    - #{error}" }
  end
  exit(-1)
else
  puts "#{projects_without_issues.count} files processed - no errors found!"
end
