# adds a contributing tag to each project which contains "CONTRIBUTING.md" in the root level of their default branch.
# pseudo code: functions: connect github api. load next yml file. if project has CONTRIBUTING.md at the top, set "contributing" to that url in the yml file.

require 'github_api'
require 'safe_yaml'
require 'uri'

# I'm also lazy so I copied some file io from cibuild.rb!

root = File.expand_path("..", __dir__)

all_yaml = Dir[root + "/_data/projects/*.yml"]
begin
  all_yaml.each do |f|
    contents = File.read(f)
    yaml = YAML.load(contents, :safe => true)
    url = yaml["upforgrabs"]["link"]
    uri = URI.parse(url)
    pieces = uri.path.split('/')
    # pieces[0] == "" sometimes for some reason
    offset = 0
    if pieces[0] == ""
      offset = 1
    end
    user = pieces[0 + offset]
    repo = pieces[1 + offset]
    contents_api = Github::Client::Repos::Contents.new

    contributing = contents_api.find user, repo, "CONTRIBUTING.md"
    yaml["contributing"] = contributing["html_url"]
    
    File.open(f, "w") do |file|
      file.syswrite(yaml.to_yaml)
    end
  end
rescue Exception => e
  puts e.message
end
