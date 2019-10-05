# frozen_string_literal: true

require 'safe_yaml'
require 'uri'

def strip_or_self!(str)
  str.strip! || str if str
end

def sanitize_yaml_string!(str, name)
  sanatized = strip_or_self!(str)
  sanatized = sanatized.sub(name + ': ', '')
                       .sub(name + ' : ', '')

  has_double_quotes = sanatized.start_with?('\"') && sanatized.end_with?('\"')
  has_single_quotes = sanatized.start_with?("'") && sanatized.end_with?("'")

  if has_double_quotes || has_single_quotes
    sanatized = sanatized.sub(/^\"/, '')
                         .sub(/\"$/, '')
                         .sub(/^'/, ')
                         .sub(/\'$/, ')
  end

  strip_or_self!(sanatized)
end

def check_folder
  # i'm lazy
  root = File.expand_path('..', __dir__)

  all_files = Dir["#{root}/_data/projects/*"]
  yaml_files = Dir["#{root}/_data/projects/*.yml"]

  # i'm lazy, there's gotta be an easier way to do this!
  yaml_files.each { |f| all_files.delete f }
  other_files = all_files.count

  return unless other_files.positive?

  puts "#{other_files} files in directory which are not YAML files:"
  all_files.each { |f| puts " - #{f}" }
  exit(-1)
end

def valid_url?(url)
  uri = URI.parse(url)
  uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
rescue URI::InvalidURIError
  false
end

def verify_preferred_tag(tag)
  # preference is a map of [bad tag]: [preferred tag]
  preference = {
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
  }
  return "Use '#{preference[tag]}' instead of #{tag}\n" if preference[tag].present?

  ''
end

def verify_tags(taglist)
  result = ''
  taglist.each do |tag|
    result += "Tag '#{tag}' contains uppercase characters\n" if tag =~ /[A-Z]/
    result += "Tag '#{tag}' contains spaces or '_' (should use '-' instead)\n" if tag =~ /[\s_]/
    result += verify_preferred_tag(tag)
  end
  return "\nTag verification failed!\n" + result if result != ''

  result
end

def verify_file(file)
  begin
    contents = File.read(file)

    if contents.index('- .NET')
      error = 'Please specify the .NET label in quotes'
      return [file, error]
    end

    yaml = YAML.safe_load(contents)

    if yaml['name'].nil?
      error = "Required 'name' attribute is not defined"
      return [file, error]
    end

    if yaml['site'].nil?
      error = "Required 'site' attribute is not defined"
      return [file, error]
    end

    unless valid_url?(yaml['site'])
      error = "Required 'site' attribute to be a valid url"
      return [file, error]
    end

    if yaml['desc'].nil?
      error = "Required 'desc' attribute is not defined"
      return [file, error]
    end

    tags = yaml['tags']
    if tags.nil? || tags.empty?
      error = 'No tags defined for file'
      return [file, error]
    end

    tags_verification = verify_tags(tags)
    return [f, tags_verification] unless tags_verification.empty?

    dups = tags.group_by { |e| e }.keep_if { |_, e| e.length > 1 }

    if dups.any?
      error = "Duplicate tags found: #{dups.keys.join ', '}"
      return [file, error]
    end

    if yaml['upforgrabs'].nil?
      error = "Required 'upforgrabs' attribute is not defined"
      return [file, error]
    end

    if yaml['upforgrabs']['name'].nil?
      error = "Required 'upforgrabs.name' attribute is not defined"
      return [file, error]
    end

    if yaml['upforgrabs']['link'].nil?
      error = "Required 'upforgrabs.link' attribute is not defined"
      return [file, error]
    end

    unless valid_url?(yaml['upforgrabs']['link'])
      error = "Required 'upforgrabs.link' attribute to be a valid url"
      return [file, error]
    end
  rescue Psych::SyntaxError => e
    error = "Unable to parse the contents of file - Line: #{e.line}, Offset: #{e.offset}, Problem: #{e.problem}"
    [file, error]
  rescue StandardError
    error = "Unknown exception for file: #{$ERROR_INFO}"
    [file, error]
  end

  [file, nil]
end

root = File.expand_path('..', __dir__)

check_folder

results = Dir["#{root}/_data/projects/*.yml"].map { |f| verify_file(f) }

files_with_errors = results.reject { |_, error| error.nil? }
success = results.select { |_, error| error.nil? }.count

if files_with_errors.count.positive?
  puts "#{success} files processed - #{files_with_errors.count} errors found:"
  files_with_errors.each { |path, error| puts "#{path} - #{error}" }
  exit(-1)
else
  puts "#{success} files processed - no errors found!"
end
