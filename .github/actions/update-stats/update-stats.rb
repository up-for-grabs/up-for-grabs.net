require 'safe_yaml'
require 'uri'
require 'octokit'
require 'pathname'
require "graphql/client"
require "graphql/client/http"

SafeYAML::OPTIONS[:default_mode] = :safe

def valid_url? (url)
    begin
     uri = URI.parse(url)
     uri.kind_of?(URI::HTTP) || uri.kind_of?(URI::HTTPS)
   rescue URI::InvalidURIError
     false
   end
end

def try_read_owner_repo (url)
    # path semgent in Ruby looks like /{owner}/repo so we drop the
    # first array value (which should be an empty string) and then
    # combine the next two elements

    pathSegments = url.path.split('/')

    if pathSegments.length < 3 then
        # this likely means the URL points to a filtered search URL
        return nil
    else
        values = pathSegments.drop(1).take(2)

        if  values[0].casecmp("orgs") == 0 then
            # points to a project board for the organization
            return nil
        end

        return values.join('/')
    end
end

def find_github_url (url)
    if !valid_url?(url) then
      return nil
    end

    uri = URI.parse(url)

    if uri.host.casecmp("github.com") != 0 then
        return nil
    else
        return try_read_owner_repo(uri)
    end
end

def find_owner_repo_pair (yaml)
    site = yaml["site"]
    owner_and_repo = find_github_url(site)

    if owner_and_repo then
        return owner_and_repo
    end

    upforgrabs = yaml["upforgrabs"]["link"]
    owner_and_repo = find_github_url(upforgrabs)
    if owner_and_repo then
        return owner_and_repo
    end

    return nil
end

def find_project_label (yaml)
  name = yaml["upforgrabs"]["name"]

  if name then
      return name
  end

  return nil
end

def relativePath (full_path)
  root = Pathname.new($root_directory)
  Pathname.new(full_path).relative_path_from(root).to_s
end

def reformat_file (full_path)
  path = relativePath(full_path)
  yaml = File.read(full_path)
  obj = YAML.load(yaml)

  File.open(full_path, 'w')  {|f| f.write obj.to_yaml(:line_width => 100) }
end

def update_project_stats (full_path, count, updated_at)
  path = relativePath(full_path)
  yaml = File.read(full_path)
  obj = YAML.load(yaml)

  # TODO: do we need to be careful here
  obj.store("stats", { 'issue-count' => count, 'last-updated' => updated_at })

  File.open(full_path, 'w')  {|f| f.write obj.to_yaml(:line_width => 100) }
end

def verify_file (full_path)
  begin
    reformat_file (full_path)

    path = relativePath(full_path)
    contents = File.read(full_path)
    yaml = YAML.load(contents)

    ownerAndRepo = find_owner_repo_pair(yaml)

    if ownerAndRepo == nil then
      return
    end

    items = ownerAndRepo.split('/')
    owner = items[0]
    name = items[1]

    link = yaml["upforgrabs"]["link"]

    if !link.start_with?("https://github.com/")
      puts "Skipping project #{ownerAndRepo} as UpForGrabs URL is outside GitHub"
      return
    end

    label = find_project_label(yaml)

    result = $GraphQLClient.query(IssueCountForLabel, variables: { owner: owner, name: name, label: label })

    if result.data.repository.nil?
      puts "Cannot find repository for project '#{ownerAndRepo}'"
    elsif result.data.repository.label.nil?
      puts "Cannot find label '#{label}' for project '#{ownerAndRepo}'"
    else
      count = result.data.repository.label.issues.total_count
      updated_at = result.data.repository.updated_at

      # enable this at a later stage
      update_project_stats(full_path, count, updated_at)
    end

    rate_limit = result.data.rate_limit
    resets_in = Time.parse(rate_limit.reset_at) - Time.now

    limit = rate_limit.limit
    remaining = rate_limit.remaining

    remaining_percent = (remaining * 100) / limit

    if remaining % 10 == 0 && remaining_percent < 20 then
      puts "Rate limit: #{remaining}/#{limit} - #{resets_in.to_i}s before reset"
    end

    if (remaining == 0) then
      puts "This script is currently rate-limited by the GitHub API"
      puts "Marking as inconclusive to indicate that no further work will be done here"
      exit 78
    end

  rescue Psych::SyntaxError => e
    puts "Unable to parse the contents of file #{path} - Line: #{e.line}, Offset: #{e.offset}, Problem: #{e.problem}"
  rescue Octokit::NotFound
    puts "No repository found in GitHub API"
  rescue GraphQL::Client::Error => e
    puts "GraphQL exception for file: " + e.to_s
  rescue
    puts "Unknown exception for file: " + $!.to_s
  end
end

repo = ENV['GITHUB_REPOSITORY']

puts "Inspecting projects files for '#{repo}'"

start = Time.now

$client = Octokit::Client.new(:access_token => ENV['GITHUB_TOKEN'])

HTTP = GraphQL::Client::HTTP.new("https://api.github.com/graphql") do
  def headers(context)
    # Optionally set any HTTP headers
    { "User-Agent": "shiftkey-testing-graphql-things" }
    { "Authorization": "bearer #{ENV['GITHUB_TOKEN']}"}
  end
end

Schema = GraphQL::Client.load_schema(HTTP)

$GraphQLClient = GraphQL::Client.new(schema: Schema, execute: HTTP)

IssueCountForLabel = $GraphQLClient.parse <<-'GRAPHQL'
  query($owner: String!, $name: String!, $label: String!) {
    repository(owner: $owner, name: $name) {
      updatedAt
      label(name: $label) {
        issues(states: OPEN) {
          totalCount
        }
      }
    }
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
  }
GRAPHQL

$root_directory = ENV['GITHUB_WORKSPACE']
$verbose = ENV['VERBOSE_OUTPUT']
projects = File.join($root_directory, '_data', 'projects', '*.yml')

Dir.glob(projects).each { |path| verify_file(path) }

finish = Time.now
delta = finish - start

puts "Operation took #{delta}s"

exit 0
