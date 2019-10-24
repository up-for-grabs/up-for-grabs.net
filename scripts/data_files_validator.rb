# frozen_string_literal: true

require_relative 'project.rb'

# Validate the data files
class DataFilesValidator
  def self.check(root)
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
  end
end
