# frozen_string_literal: true

require 'safe_yaml'
require 'uri'
require 'octokit'
require 'pathname'

require 'json_schemer'
require 'up_for_grabs_tooling'

def repository_check(project)
  result = GitHubRepositoryActiveCheck.run(project)

  if result[:rate_limited]
    puts 'This script is currently rate-limited by the GitHub API'
    puts 'Marking as inconclusive to indicate that no further work will be done here'
    exit 0
  end

  return "The GitHub repository '#{project.github_owner_name_pair}' has been marked as archived, which suggests it is not active." if result[:reason] == 'archived'

  return "The GitHub repository '#{project.github_owner_name_pair}' cannot be found. Please confirm the location of the project." if result[:reason] == 'missing'

  return "The GitHub repository '#{result[:old_location]}' is now at '#{result[:location]}'. Please update this project before this is merged." if result[:reason] == 'redirect'

  return "The GitHub repository '#{project.github_owner_name_pair}' could not be confirmed. Error details: #{result[:error]}" if result[:reason] == 'error'

  nil
end

def find_label(project)
  yaml = project.read_yaml
  yaml['upforgrabs']['name']
end

def label_check(project)
  result = GitHubRepositoryLabelActiveCheck.run(project)

  if result[:rate_limited]
    puts 'This script is currently rate-limited by the GitHub API'
    puts 'Marking as inconclusive to indicate that no further work will be done here'
    exit 0
  end

  label = find_label(project)

  if result[:reason] == 'repository-missing'
    return "I couldn't find the GitHub repository '#{project.github_owner_name_pair}' that was used in the `upforgrabs.link` value." \
           " Please confirm this is correct or hasn't been mis-typed."
  end

  if result[:reason] == 'missing'
    return "The `upforgrabs.name` value '#{label}' isn't in use on the project in GitHub." \
           ' This might just be a mistake due because of copy-pasting the reference template or be mis-typed.' \
           " Please check the list of labels at https://github.com/#{project.github_owner_name_pair}/labels and update the project file to use the correct label."
  end

  yaml = project.read_yaml
  link = yaml['upforgrabs']['link']
  url = result[:url]

  link_needs_rewriting = link != url && link.include?('/labels/')

  if link_needs_rewriting
    return "The label '#{label}' for GitHub repository '#{project.github_owner_name_pair}' does not match the specified `upforgrabs.link` value. Please update it to `#{url}`."
  end

  nil
end

def review_project(project, schemer)
  validation_errors = ProjectValidator.validate(project, schemer)

  return { project: project, kind: 'validation', validation_errors: validation_errors } if validation_errors.any?

  # TODO: label suggestions should be their own thing?

  return { project: project, kind: 'valid' } unless project.github_project?

  repository_error = repository_check(project)

  return { project: project, kind: 'repository', message: repository_error } unless repository_error.nil?

  label_error = label_check(project)

  return { project: project, kind: 'label', message: label_error } unless label_error.nil?

  { project: project, kind: 'valid' }
end

def cleanup_old_comments(client, pull_request_number)
  Object.const_set :PullRequestComments, client.parse(<<-'GRAPHQL')
    query ($owner: String!, $name: String!, $number: Int!) {
      repository(owner: $owner, name: $name) {
        pullRequest(number: $number) {
          comments(first: 50) {
            nodes {
              id
              body
              author {
                login
                __typename
              }
            }
          }
        }
      }
    }
  GRAPHQL

  repo = ENV['GITHUB_REPOSITORY']
  owner, name = repo.split('/')

  variables = { owner: owner, name: name, number: pull_request_number }

  response = client.query(PullRequestComments, variables: variables)

  pull_request = response.data.repository.pull_request
  comments = pull_request.comments

  return unless comments.nodes.any?

  Object.const_set :DeleteIssueComment, client.parse(<<-'GRAPHQL')
    mutation ($input: DeleteIssueCommentInput!) {
      deleteIssueComment(input: $input)
    }
  GRAPHQL

  login = 'shiftbot'
  type = 'User'
  preamble = '<!-- PULL REQUEST ANALYZER GITHUB ACTION -->'

  comments.nodes.each do |node|
    author = node.author
    match = author.login == login && author.__typename == type && node.body.include?(preamble)

    next unless match

    variables = { input: { id: node.id } }
    response = client.query(DeleteIssueComment, variables: variables)

    if response.errors.any?
      message = response.errors[:data].join(', ')
      puts "Message when deleting commit failed: #{message}"
    end
  end
end

def generate_comment_for_pull_request(projects, schemer)
  markdown_body = "<!-- PULL REQUEST ANALYZER GITHUB ACTION -->

  :wave: I'm a robot checking the state of this pull request to save the human reveiwers time." \
  " I noticed this PR added or modififed the data files under `_data/projects/` so I had a look at what's changed.\n\n" \
  "As you make changes to this pull request, I'll re-run these checks.\n\n"

  messages = projects.compact.map { |p| review_project(p, schemer) }.map do |result|
    path = result[:project].relative_path

    if result[:kind] == 'valid'
      "#### `#{path}` :white_check_mark: \nNo problems found, everything should be good to merge!"
    elsif result[:kind] == 'validation'
      message = result[:validation_errors].map { |e| "> - #{e}" }.join "\n"
      "#### `#{path}` :x:\nI had some troubles parsing the project file, or there were fields that are missing that I need.\n\nHere's the details:\n#{message}"
    elsif result[:kind] == 'repository' || result[:kind] == 'label'
      "#### `#{path}` :x:\n#{result[:message]}"
    else
      "#### `#{path}` :question:\nI got a result of type '#{result[:kind]}' that I don't know how to handle. I need to mention @shiftkey here as he might be able to fix it."
    end
  end

  markdown_body + messages.join("\n\n")
end

def add_comment_to_pull_request(client, subject_id, markdown_body)
  Object.const_set :AddCommentToPullRequest, client.parse(<<-'GRAPHQL')
    mutation ($input: AddCommentInput!) {
      addComment(input: $input) {
        commentEdge {
          node {
            url
          }
        }
      }
    }
  GRAPHQL

  variables = { input: { body: markdown_body, subjectId: subject_id } }

  response = client.query(AddCommentToPullRequest, variables: variables)

  return unless response.errors.any?

  message = response.errors[:data].join(', ')
  puts "Error encountered while trying to add comment: #{message}"
end

root = ENV['GITHUB_WORKSPACE']

# this file seems to not include the expected `/github` root folder name
# test this and we may have to adjust these rules
unless (payload_relative_path = ENV['GITHUB_EVENT_PATH'])
  puts 'Expected environment variable GITHUB_EVENT_PATH was not set'
  exit 1
end

unless File.exist?(payload_relative_path)
  puts "Environment variable GITHUB_EVENT_PATH points to file that doesn't exist: '#{payload_relative_path}'"
  exit 1
end

json_text = File.read(payload_relative_path)

obj = JSON.parse(json_text)
pull_request_number = obj['number']
subject_id = obj['pull_request']['node_id']
base_sha = obj['pull_request']['base']['sha']
base_ref = obj['pull_request']['base']['ref']
default_branch = obj['pull_request']['base']['repo']['default_branch']

unless base_ref == default_branch
  puts "PR is targeting base branch '#{base_ref}' which is not the default branch. Ignoring..."
  exit 0
end

diff_output = ''

Dir.chdir(root) do
  diff_output = `git diff #{base_sha}..#{ENV['GITHUB_SHA']} --name-only -- _data/projects/`
end

raw_files = diff_output.split("\n")

files = raw_files.map(&:chomp)

if files.empty?
  puts 'No project files need to be validated by this PR'
  exit 0
end

projects = files.map do |f|
  full_path = File.join(root, f)
  return nil unless File.exist?(full_path)

  Project.new(f, full_path)
end

http = GraphQL::Client::HTTP.new('https://api.github.com/graphql') do
  def headers(_context)
    {
      "User-Agent": 'up-for-grabs-graphql-label-queries',
      "Authorization": "bearer #{ENV['GITHUB_TOKEN']}"
    }
  end
end

schema = GraphQL::Client.load_schema(http)

client = GraphQL::Client.new(schema: schema, execute: http)

cleanup_old_comments(client, pull_request_number)

schema = Pathname.new("#{root}/schema.json")
schemer = JSONSchemer.schema(schema)

markdown_body = generate_comment_for_pull_request(projects, schemer)

add_comment_to_pull_request(client, subject_id, markdown_body)
