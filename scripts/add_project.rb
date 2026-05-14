#!/usr/bin/env ruby
# frozen_string_literal: true

# This script provides an interactive command-line tool to add new projects
# to the up-for-grabs list. It prompts the user for project details and
# includes validation to ensure the generated YAML file adheres to the
# project's data structure and content requirements.
#
# Usage: ruby scripts/add_project.rb
#
# The script will generate a new YAML file in the `_data/projects/` directory.

require 'yaml'
require 'fileutils'

# Prompts the user for input and validates it based on provided rules.
#
# @param prompt [String] The message to display to the user.
# @param validation_regex [Regexp, nil] An optional regular expression to validate the input.
# @param error_message [String, nil] A custom error message to display on validation failure.
# @yieldparam input [String] The user's input string.
# @yieldreturn [Object, nil] The processed input if valid, or nil if validation fails within the block.
# @return [String] The validated and processed input.
def get_validated_input(prompt, validation_regex = nil, error_message = nil)
  loop do
    puts prompt
    print "> " # Add a prompt indicator for better UX
    input = gets.chomp.strip

    if input.empty?
      puts "Error: Input cannot be empty. Please try again."
      next
    end

    if validation_regex && input !~ validation_regex
      puts error_message || "Error: Invalid input format. Please try again."
      next
    end

    if block_given?
      result = yield input
      if result
        return result
      else
        puts error_message || "Error: Invalid input. Please try again."
        next
      end
    end

    return input
  end
end

# --- Main Script ---

puts "\n--- Add New Project to Up-For-Grabs ---"
puts "This tool will guide you through adding your project. Please provide accurate details."

# 1. Project Name
project_name = get_validated_input(
  "\nEnter the project name (e.g., 'My Awesome Project'). This will be used as the display name:",
  nil,
  "Project name cannot be empty."
)

# 2. Project Description
project_description = get_validated_input(
  "\nEnter a brief description of the project. This should be a single paragraph:",
  nil,
  "Project description cannot be empty."
)

# 3. Project URL
project_url = get_validated_input(
  "\nEnter the project's GitHub URL (e.g., 'https://github.com/owner/repo').\n" \
  "This must be a valid GitHub repository URL:",
  /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+(\.git)?\/?$/,
  "Error: Invalid GitHub URL. Must start with 'https://github.com/' and be a valid repository URL."
)

# 4. Tags
tags = get_validated_input(
  "\nEnter comma-separated tags for the project (e.g., 'csharp,dotnet,web').\n" \
  "Important: Each tag must be lowercase, contain no spaces, and use only alphanumeric characters or hyphens.\n" \
  "Example: 'csharp', 'web-development', 'api'",
  nil,
  "Error: Invalid tags. Please ensure they are comma-separated, lowercase, and contain no spaces or special characters other than hyphens."
) do |input|
  raw_tags = input.split(',').map(&:strip).reject(&:empty?)
  processed_tags = []
  all_tags_valid = true

  raw_tags.each do |tag|
    if tag =~ /^[a-z0-9-]+$/
      processed_tags << tag
    else
      puts "  Invalid tag found: '#{tag}'. Tags must be lowercase, no spaces, alphanumeric or hyphens."
      all_tags_valid = false
      break # Exit the loop on first invalid tag
    end
  end
  all_tags_valid ? processed_tags : nil
end

# --- Generate YAML Data ---

project_data = {
  'name' => project_name,
  'description' => project_description,
  'url' => project_url,
  'tags' => tags,
  'upforgrabs' => {
    'name' => project_name # This is a common pattern in existing YAML files
  }
}

# Determine filename
# Sanitize project name for filename: lowercase, replace spaces with hyphens, remove non-alphanumeric
# Ensure the filename is not empty after sanitization
filename_base = project_name.downcase.gsub(/[^a-z0-9\s-]/, '').gsub(/\s+/, '-').gsub(/^-+|-+$/, '')
if filename_base.empty?
  puts "Error: Could not generate a valid filename from the project name '#{project_name}'. Please choose a different name."
  exit(1)
end

output_dir = '_data/projects'
output_file = File.join(output_dir, "#{filename_base}.yml")

# Ensure directory exists
FileUtils.mkdir_p(output_dir) unless File.directory?(output_dir)

# Check if file already exists
if File.exist?(output_file)
  puts "\nWarning: A project file with the name '#{filename_base}.yml' already exists."
  puts "Do you want to overwrite it? (yes/no)"
  print "> "
  overwrite = gets.chomp.strip.downcase
  unless overwrite == 'yes'
    puts "Operation cancelled. File not overwritten."
    exit(0)
  end
end

begin
  File.open(output_file, 'w') do |file|
    file.write(project_data.to_yaml)
  end
  puts "\nSuccess: Project '#{project_name}' successfully added to '#{output_file}'."
  puts "Next steps: Please review the generated file, commit it, and submit a pull request!"
rescue StandardError => e
  puts "Error: Failed to write project file. Reason: #{e.message}"
  exit(1)
end