# frozen_string_literal: true

# Check the projects directory for anything invalid
class DirectoryReporter
  def self.check(root)
    result = DirectoryValidator.validate(root)

    invalid_data_files_count = result[:invalid_data_files].length
    project_files_at_root_count = result[:project_files_at_root].length

    error = invalid_data_files_count.positive? || project_files_at_root_count.positive?

    if invalid_data_files_count.positive?
      puts "#{invalid_data_files_count} files found in projects directory which are not YAML files:"
      result[:invalid_data_files].each { |f| puts " - #{f}" }
    end

    if project_files_at_root_count.positive?
      puts "#{project_files_at_root_count} files found in root which look like project files:"
      result[:project_files_at_root].each { |f| puts " - #{f}" }
      puts 'Move these inside _data/projects/ to ensure they are listed on the site'
    end

    exit(-1) if error
  end
end
