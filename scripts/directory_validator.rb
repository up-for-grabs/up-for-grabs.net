# frozen_string_literal: true

# Check the projects directory for anything invalid
class DirectoryValidator
  def self.check(root)
    other_files = []

    Find.find("#{root}/_data/projects") do |path|
      next unless FileTest.file?(path)

      other_files << path if File.extname(path) != '.yml'
    end

    count = other_files.count

    if count.positive?
      puts "#{count} files found in projects directory which are not YAML files:"
      r = Pathname.new(root)

      other_files.each do |f|
        relative_path = Pathname.new(f).relative_path_from(r).to_s
        puts " - #{relative_path}"
      end

      exit(-1)
    end

    valid_yaml_files = ['_config.yml', 'docker-compose.yml', '.rubocop.yml']

    Find.find("#{root}/") do |path|
      next unless FileTest.file?(path)
      next unless File.dirname(path) == root

      basename = File.basename(path)
      next if valid_yaml_files.include?(basename)

      other_files << basename if File.extname(path) == '.yml'
    end

    count = other_files.count

    return unless count.positive?

    puts "#{count} files found in root which look like content files:"
    r = Pathname.new(root)

    other_files.each do |f|
      puts " - #{f}"
    end

    puts 'Move these inside _data/projects to ensure they are listed on the site'

    exit(-1)
  end
end
