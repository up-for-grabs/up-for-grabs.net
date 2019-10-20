# frozen_string_literal: true

require 'safe_yaml'
require 'uri'
require 'octokit'
require 'pathname'
require 'graphql/client'
require 'graphql/client/http'

SafeYAML::OPTIONS[:default_mode] = :safe

def valid_url?(url)
  uri = URI.parse(url)
  uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
rescue URI::InvalidURIError
  false
end

def try_read_owner_repo(url)
  # path semgent in Ruby looks like /{owner}/repo so we drop the
  # first array value (which should be an empty string) and then
  # combine the next two elements

  path_segments = url.path.split('/')

  # this likely means the URL points to a filtered search URL
  return nil if path_segments.length < 3

  values = path_segments.drop(1).take(2)

  # points to a project board for the organization
  return nil if values[0].casecmp('orgs').zero?

  values.join('/')
end

def find_github_url(url)
  return nil unless valid_url?(url)

  uri = URI.parse(url)

  return nil unless uri.host.casecmp('github.com').zero?

  try_read_owner_repo(uri)
end

def find_owner_repo_pair(yaml)
  site = yaml['site']
  owner_and_repo = find_github_url(site)

  return owner_and_repo if owner_and_repo

  upforgrabs = yaml['upforgrabs']['link']
  find_github_url(upforgrabs)
end

def relative_path(full_path)
  root = Pathname.new($root_directory)
  Pathname.new(full_path).relative_path_from(root).to_s
end

def reformat_file(full_path)
  yaml = File.read(full_path)
  obj = YAML.safe_load(yaml)

  tags = obj['tags']

  # TODO: use the list of matches in scripts/project.rb to replace incorrect values?
  obj.store('tags', tags.map(&:downcase).map { |s| s.gsub(' ', '-') })

  File.open(full_path, 'w') { |f| f.write obj.to_yaml(line_width: 100) }
end

def update_project_stats(full_path, count, updated_at)
  yaml = File.read(full_path)
  obj = YAML.safe_load(yaml)

  # TODO: do we need to be careful here
  obj.store('stats', 'issue-count' => count, 'last-updated' => updated_at)

  File.open(full_path, 'w') { |f| f.write obj.to_yaml(line_width: 100) }
end

def find_values_to_query_api(full_path)
  contents = File.read(full_path)
  yaml = YAML.safe_load(contents)

  owner_and_repo = find_owner_repo_pair(yaml)

  return if owner_and_repo.nil?

  items = owner_and_repo.split('/')
  owner = items[0]
  name = items[1]

  link = yaml['upforgrabs']['link']

  unless link.start_with?('https://github.com/')
    puts "Skipping project #{owner_and_repo} as UpForGrabs URL is outside GitHub"
    return nil
  end

  label = yaml['upforgrabs']['name']

  [owner, name, label]
end

def update_stats(full_path, repository, owner_and_repo, label)
  if repository.nil?
    puts "Cannot find repository for project '#{owner_and_repo}'"
  elsif repository.label.nil?
    puts "Cannot find label '#{label}' for project '#{owner_and_repo}'"
  else
    count = repository.label.issues.total_count
    updated_at = repository.updated_at

    update_project_stats(full_path, count, updated_at) if $apply_changes
  end
end

def verify_file(full_path)
  reformat_file full_path

  path = relative_path(full_path)

  result = find_values_to_query_api(full_path)
  return if result.nil?

  owner, name, label = result

  variables = { owner: owner, name: name, label: label }

  result = $GraphQLClient.query(IssueCountForLabel, variables: variables)

  update_stats(full_path, result.data.repository, "#{owner}/#{name}", label)

  rate_limit = result.data.rate_limit
  resets_in = Time.parse(rate_limit.reset_at) - Time.now

  limit = rate_limit.limit
  remaining = rate_limit.remaining

  remaining_percent = (remaining * 100) / limit

  puts "Rate limit: #{remaining}/#{limit} - #{resets_in.to_i}s before reset" if (remaining % 10).zero? && remaining_percent < 20

  if remaining.zero?
    puts 'This script is currently rate-limited by the GitHub API'
    puts 'Marking as inconclusive to indicate that no further work will be done here'
    exit 78
  end
rescue Psych::SyntaxError => e
  puts "Unable to parse the contents of file #{path} - Line: #{e.line}, Offset: #{e.offset}, Problem: #{e.problem}"
rescue GraphQL::Client::Error => e
  puts "GraphQL exception for file #{path}: '#{e}'"
rescue StandardError => e
  puts "Unknown exception for file #{path}: '#{e}'"
end

repo = ENV['GITHUB_REPOSITORY']

puts "Inspecting projects files for '#{repo}'"

start = Time.now

$client = Octokit::Client.new(access_token: ENV['GITHUB_TOKEN'])

HTTP = GraphQL::Client::HTTP.new('https://api.github.com/graphql') do
  def headers(_context)
    # Optionally set any HTTP headers
    {
      "User-Agent": 'shiftkey-testing-graphql-things',
      "Authorization": "bearer #{ENV['GITHUB_TOKEN']}"
    }
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
$apply_changes = ENV['APPLY_CHANGES']
projects = File.join($root_directory, '_data', 'projects', '*.yml')

current_repo = ENV['GITHUB_REPOSITORY']

client = Octokit::Client.new(access_token: ENV['GITHUB_TOKEN'])
prs = client.pulls current_repo

found_pr = prs.find { |pr| pr.title == 'Updated project stats' && pr.user.login == 'github-actions[bot]' }

if found_pr
  puts "There is a current PR open to update stats ##{found_pr.number} - review and merge that before we go again"
  exit 78
end

Dir.glob(projects).each { |path| verify_file(path) }

unless $apply_changes
  puts 'APPLY_CHANGES environment variable unset, exiting instead of making a new PR'
  exit 78
end

clean = true

branch_name = Time.now.strftime('updated-stats-%Y%m%d')

Dir.chdir($root_directory) do
  system('git config --global user.name "github-actions"')
  system('git config --global user.email "github-actions@users.noreply.github.com"')

  system("git remote set-url origin 'https://x-access-token:#{ENV['GITHUB_TOKEN']}@github.com/#{current_repo}.git'")

  clean = system('git diff --quiet > /dev/null')

  unless clean
    system("git checkout -b #{branch_name}")
    system("git commit -am 'regenerated project stats'")
    system("git push origin #{branch_name}")
  end
end

unless clean
  body = 'This PR regenerates the stats for all repositories that use a single label in a single GitHub repository'

  client.create_pull_request(current_repo, 'gh-pages', branch_name, 'Updated project stats', body) if found_pr.nil?
end

finish = Time.now
delta = finish - start

puts "Operation took #{delta}s"

exit 0
