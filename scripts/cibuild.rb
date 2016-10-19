require 'safe_yaml'
require 'uri'

def check_folder
  # i'm lazy
  root = File.expand_path("..", __dir__)

  all_files =  Dir[root + "/_data/projects/*"]
  yaml_files =  Dir[root + "/_data/projects/*.yml"]

  # i'm lazy, there's gotta be an easier way to do this!
  yaml_files.each { |f| all_files.delete f }
  other_files = all_files.count

  if (other_files > 0) then
    puts "#{other_files} files in directory which are not YAML files:"
    all_files.each { |f| puts " - " + f }
    exit -1
  end
end

def valid_url? (url)
  begin
    uri = URI.parse(url)
    uri.kind_of?(URI::HTTP) || uri.kind_of?(URI::HTTPS)
  rescue URI::InvalidURIError
    false
  end
end

def github_link? (url)
  begin
    uri = URI.parse(url)
    if !uri.kind_of?(URI::HTTPS) then
      false
    end
    # being lazy here, don't care about subdomains
    /[\w*\.]?github\.com/.match uri.host
  rescue URI::InvalidURIError
    false
  end
end

def verify_file (f)
  begin
    contents = File.read(f)

    dotNetInQuote = contents.index("- .NET")

    if dotNetInQuote then
      error = "Please specify the .NET label in quotes"
      return [f, error]
    end

    yaml = YAML.load(contents, :safe => true)

    if yaml["name"].nil? then
      error = "Required 'name' attribute is not defined"
      return [f, error]
    end

    if yaml["site"].nil? then
      error = "Required 'site' attribute is not defined"
      return [f, error]
    end

    if !valid_url?(yaml["site"]) then
      error = "Required 'site' attribute to be a valid url"
      return [f, error]
    end

    if yaml["desc"].nil? then
      error = "Required 'desc' attribute is not defined"
      return [f, error]
    end

    tags = yaml["tags"]
    if tags.nil? || tags.empty? then
      error = "No tags defined for file"
      return [f, error]
    end

    dups = tags.group_by{ |e| e }.keep_if{|_, e| e.length > 1 }

    if dups.any? then
      tags = dups.keys.join ", "
      error = "Duplicate tags found: " + tags
      return [f, error]
    end

    if dups.any? then
      tags = dups.keys.join ", "
      error = "Duplicate tags found: " + tags
      return [f, error]
    end

    if yaml["upforgrabs"].nil? then
      error = "Required 'upforgrabs' attribute is not defined"
      return [f, error]
    end

    name = yaml["upforgrabs"]["name"]

    if name.nil? then
      error = "Required 'upforgrabs.name' attribute is not defined"
      return [f, error]
    end

    link = yaml["upforgrabs"]["link"]

    if link.nil? then
      error = "Required 'upforgrabs.link' attribute is not defined"
      return [f, error]
    end

    if !valid_url?(link) then
      error = "Required 'upforgrabs.link' attribute to be a valid url"
      return [f, error]
    end

    if github_link?(link) then

      if link.index('https://github.com/issues?q=') then
        # search across many repos, disregard as encoding is different
        return [f, nil]
      end

      if link.index('https://github.com/search?') then
        # search across many repos, disregard as encoding is different
        return [f, nil]
      end

      # lol, encoding is hard
      encodedName = URI::encode(name)
                        .sub('/', '%2F')
                        .sub(':', '%3A')
                        .sub('!', '%21')
                        .downcase

      link_down = link.downcase

      if link_down.index(encodedName).nil? then
        error = "The encoded attribute '#{encodedName}' doesn't exist on the 'upforgrabs.url' #{link_down}"
        return [f, error]
      end
    end

  rescue Psych::SyntaxError => e
    error = "Unable to parse the contents of file - Line: #{e.line}, Offset: #{e.offset}, Problem: #{e.problem}"
    return [f, error]
  rescue
    error = "Unknown exception for file: " + $!.to_s
    return [f, error]
  end

  return [f, nil]
end

root = File.expand_path("..", __dir__)

check_folder

results = Dir[root + "/_data/projects/*.yml"].map { |f| verify_file(f) }

files_with_errors = results.select { |file, error| error != nil }
error_count = files_with_errors.count

success = results.select { |file, error| error.nil? }.count

if (error_count > 0) then
  puts "#{success} files processed - #{error_count} errors found:"
  files_with_errors.each { |path, error| puts path + " - " + error }
  exit -1
else
  puts "#{success} files processed - no errors found!"
end
