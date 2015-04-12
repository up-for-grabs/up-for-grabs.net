require 'yaml'

$projects_dir = "_data/projects/"

def add_project p
  # flatten the node
  contents = {
    'name' => p["name"],
    'desc' => p["desc"],
    'site' => p["site"],
    'tags' => p["tags"],
    'upforgrabs' => p["upforgrabs"]
  }

  # dump the file to disk in the new location
  new_filename = p["name"].downcase
      .gsub(" ", "-")
      .gsub("\\", "-")
      .gsub("#", "sharp")
      .gsub("(", "")
      .gsub(")", "")
      .gsub("\"", "")
  path = $projects_dir + new_filename + ".yml"
  File.open(path, 'w') {|f| f.write(contents.to_yaml) }
end

Dir.mkdir($projects_dir) unless Dir.exists?($projects_dir)

projects = YAML.load_file('_data/projects.yml')
projects.each_entry { |p| add_project p }
