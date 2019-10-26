# frozen_string_literal: true

require 'safe_yaml'
require 'uri'
require 'octokit'
require 'pathname'
require 'graphql/client'
require 'graphql/client/http'

require 'up_for_grabs_tooling'

def find_values_to_query_api(project)
  unless project.github_project?
    puts "Skipping project #{project.relative_path} as UpForGrabs URL is not on GitHub"
    return
  end

  owner_and_repo = project.github_owner_name_pair

  items = owner_and_repo.split('/')
  owner = items[0]
  name = items[1]

  yaml = project.read_yaml
  label = yaml['upforgrabs']['name']

  [owner, name, label]
end

def update_stats(project, repository, owner_and_repo, label)
  if repository.nil?
    puts "Cannot find repository for project '#{owner_and_repo}'"
  elsif repository.label.nil?
    puts "Cannot find label '#{label}' for project '#{owner_and_repo}'"
  else
    stats = {
      count: repository.label.issues.total_count,
      updated_at: repository.updated_at
    }

    project.update(stats) if $apply_changes
  end
end

def verify_project(project)
  project.format_yaml

  result = find_values_to_query_api(project)
  return if result.nil?

  owner, name, label = result

  variables = { owner: owner, name: name, label: label }

  result = $GraphQLClient.query(IssueCountForLabel, variables: variables)

  update_stats(project, result.data.repository, "#{owner}/#{name}", label)

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
  puts "Unable to parse the contents of file #{project.relative_path} - Line: #{e.line}, Offset: #{e.offset}, Problem: #{e.problem}"
rescue GraphQL::Client::Error => e
  puts "GraphQL exception for file #{project.relative_path}: '#{e}'"
rescue StandardError => e
  puts "Unknown exception for file #{project.relative_path}: '#{e}'"
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

current_repo = ENV['GITHUB_REPOSITORY']

client = Octokit::Client.new(access_token: ENV['GITHUB_TOKEN'])
prs = client.pulls current_repo

found_pr = prs.find { |pr| pr.title == 'Updated project stats' && pr.user.login == 'github-actions[bot]' }

if found_pr
  puts "There is a current PR open to update stats ##{found_pr.number} - review and merge that before we go again"
  exit 78
end

projects = Dir["#{$root_directory}/_data/projects/*.yml"].map do |f|
  relative_path = Pathname.new(f).relative_path_from($root_directory).to_s
  Project.new(relative_path, f)
end

projects.each { |p| verify_project(p) }

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
