# frozen_string_literal: true

require 'yaml'
require 'json'
require 'json_schemer'
require 'pathname'

# Validates project data files against schema and business rules.
# Business rules:
# 1. Tags must be lowercase and contain no spaces.
# 2. Project files must be valid YAML.
class DataValidator
  def initialize
    @schema = JSON.parse(File.read('scripts/schema.json'))
    @schemer = JSONSchemer.schema(@schema)
  end

  def validate_file(file_path)
    data = YAML.safe_load(File.read(file_path))
    
    # Schema validation
    unless @schemer.valid?(data)
      errors = @schemer.validate(data).map { |e| e['data_pointer'] }.join(', ')
      puts "Validation failed for #{file_path} at: #{errors}"
      return false
    end

    # Business rule validation
    if data['tags']
      data['tags'].each do |tag|
        unless tag.match?(/^[a-z0-9-]+$/)
          puts "Validation failed for #{file_path}: Tag '#{tag}' is invalid."
          puts "Requirement: Tags must be lowercase, contain no spaces, and use hyphens instead of spaces."
          return false
        end
      end
    end

    true
  end
end

# Main execution logic
if __FILE__ == $0
  validator = DataValidator.new
  files = Dir.glob('_data/projects/*.yml')
  
  success = true
  files.each do |file|
    unless validator.validate_file(file)
      success = false
    end
  end

  exit 1 unless success
end