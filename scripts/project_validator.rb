# frozen_string_literal: true

# Represents the checks performed on a project to ensure it can be parsed
# and used as site data in Jekyll
class Project
  attr_accessor :full_path, :relative_path

  def initialize(relative_path, full_path)
    @relative_path = relative_path
    @full_path = full_path
  end

  def self.valid_url?(url)
    uri = URI.parse(url)
    uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
  rescue URI::InvalidURIError
    false
  end

  def validate_tag_list(taglist)
    result = ''
    taglist.each do |tag|
      result += "Tag '#{tag}' contains uppercase characters\n" if tag =~ /[A-Z]/
      result += "Tag '#{tag}' contains spaces or '_' (should use '-' instead)\n" if tag =~ /[\s_]/
      result += verify_preferred_tag(tag)
    end
    return "\nTag verification failed!\n" + result if result != ''

    result
  end

  def verify_preferred_tag(tag)
    return "Use '#{PREFERENCES[tag]}' instead of #{tag}\n" unless PREFERENCES[tag].nil?

    ''
  end

  def validation_errors
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

    errors.concat(validate_summary(yaml))
    errors.concat(validate_tags(yaml))
    errors.concat(validate_upforgrabs(yaml))

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

  def validate_summary(yaml)
    errors = []

    errors << "Required 'name' attribute is not defined" if yaml['name'].nil?

    errors << "Required 'site' attribute is not defined" if yaml['site'].nil?

    errors << "Required 'site' attribute to be a valid url" unless Project.valid_url?(yaml['site'])

    errors << "Required 'desc' attribute is not defined" if yaml['desc'].nil?

    errors
  end

  def validate_tags(yaml)
    errors = []

    tags = yaml['tags']

    errors << 'No tags defined for file' if tags.nil? || tags.empty?

    tags_validation_errors = validate_tag_list(tags)
    errors.concat(tags_validation_errors) unless tags_validation_errors.empty?

    dups = tags.group_by { |t| t }.keep_if { |_, t| t.length > 1 }

    errors << "Duplicate tags found: #{dups.keys.join ', '}" if dups.any?

    errors
  end

  def validate_upforgrabs(yaml)
    errors = []

    # validating the current schema
    errors << "Required 'upforgrabs' attribute is not defined" if yaml['upforgrabs'].nil?

    # bail out early if not found
    return errors if yaml['upforgrabs'].nil?

    errors << "Required 'upforgrabs.name' attribute is not defined" if yaml['upforgrabs']['name'].nil?

    errors << "Required 'upforgrabs.link' attribute is not defined" if yaml['upforgrabs']['link'].nil?

    errors << "Required 'upforgrabs.link' attribute to be a valid url" unless Project.valid_url?(yaml['upforgrabs']['link'])

    errors
  end
end
