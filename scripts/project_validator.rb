# frozen_string_literal: true

# Represents the checks performed on a project to ensure it can be parsed
# and used as site data in Jekyll
class Project
  attr_accessor :full_path, :relative_path

  def initialize(relative_path, full_path)
    @relative_path = relative_path
    @full_path = full_path
  end

  def validate_tag_list(taglist)
    result = ''

    taglist.each do |tag|
      result += "Tag '#{tag}' contains uppercase characters\n" if tag =~ /[A-Z]/
      result += "Tag '#{tag}' contains spaces or '_' (should use '-' instead)\n" if tag =~ /[\s_]/
      result += verify_preferred_tag(tag)
    end

    return 'Tag verification failed - ' + result if result != ''

    result
  end

  def verify_preferred_tag(tag)
    return "Use '#{PREFERENCES[tag]}' instead of #{tag}\n" unless PREFERENCES[tag].nil?

    ''
  end

  def validation_errors(schemer)
    errors = []

    begin
      yaml = YAML.safe_load(File.read(@full_path))
    rescue Psych::SyntaxError => e
      errors << "Unable to parse the contents of file - Line: #{e.line}, Offset: #{e.offset}, Problem: #{e.problem}"
    rescue StandardError
      errors << "Unknown exception for file: #{$ERROR_INFO}"
    end

    # don't continue if there was a problem parsing
    return errors if errors.any?

    valid = schemer.valid?(yaml)
    unless valid
      raw_errors = schemer.validate(yaml).to_a
      formatted_messages = raw_errors.map do |err|
        field = err.fetch('data_pointer')
        value = err.fetch('data')
        type = err.fetch('type')

        if field.start_with?('/tags/')
          "Tag '#{value}' contains invalid characters. Allowed characters: a-z, 0-9, +, #, . or -"
        elsif field.start_with?('/site') || field.start_with?("/upforgrabs/link")
          "Field '#{field}' expects a URL but instead found '#{value}'. Please check and update this value."
        elsif field.start_with?('/stats/last-updated')
          "Field '#{field}' expects date-time string but instead found '#{value}'. Please check and update this value."
        elsif field.start_with?('/stats/issue-count')
          "Field '#{field}' expects a non-negative integer but instead found '#{value}'. Please check and update this value."
        else
          "Field '#{field}' with value '#{value}' failed to satisfy the rule '#{type}'. Check the value and try again."
        end
      end
      errors.concat(formatted_messages)
    end

    errors.concat(validate_tags(yaml))

    errors
  end

  private

  # preference is a map of [bad tag]: [preferred tag]
  PREFERENCES = {
    'algorithms' => 'algorithm',
    'appletv' => 'apple-tv',
    'asp-net' => 'asp.net',
    'aspnet' => 'asp.net',
    'aspnetmvc' => 'aspnet-mvc',
    'aspnetcore' => 'aspnet-core',
    'asp-net-core' => 'aspnet-core',
    'assembler' => 'assembly',
    'builds' => 'build',
    'collaborate' => 'collaboration',
    'coding' => 'code',
    'colour' => 'color',
    'commandline' => 'command-line',
    'csharp' => 'c#',
    'docs' => 'documentation',
    'dotnet-core' => '.net core',
    'encrypt' => 'encryption',
    'fsharp' => 'f#',
    'games' => 'game',
    'gatsby' => 'gatsbyjs',
    'golang' => 'go',
    'js' => 'javascript',
    'library' => 'libraries',
    'linters' => 'linter',
    'node' => 'node.js',
    'nodejs' => 'node.js',
    'nuget.exe' => 'nuget',
    'parser' => 'parsing',
    'react' => 'reactjs'
  }.freeze

  def validate_tags(yaml)
    errors = []

    tags = yaml['tags']

    errors << 'No tags defined for file' if tags.nil? || tags.empty?

    tags_validation_errors = validate_tag_list(tags)

    errors = errors.append(tags_validation_errors) unless tags_validation_errors.empty?

    dups = tags.group_by { |t| t }.keep_if { |_, t| t.length > 1 }

    errors << "Duplicate tags found: #{dups.keys.join ', '}" if dups.any?

    errors
  end
end
