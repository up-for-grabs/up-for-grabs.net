require 'safe_yaml'

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
  end
end

def verify_file (f)
  begin
    contents = File.read(f)
    yaml = YAML.load(contents, :safe => true)
    name = yaml[:name]

    # TODO: check for other values
    # TODO:
  rescue Psych::SyntaxError
    error = "Unable to parse the contents of file"
    return [f, error]
  rescue
    error = "Unknown exception for file: " + $!
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
