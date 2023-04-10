# frozen_string_literal: true

require 'safe_yaml'
require 'uri'
require 'octokit'
require 'pathname'
require 'graphql/client'
require 'graphql/client/http'

require 'open3'

require 'up_for_grabs_tooling'

def run(cmd)
  warn "Running command: #{cmd}"
  stdout, stderr, status = Open3.capture3(cmd)

  {
    stdout:,
    stderr:,
    exit_code: status.exitstatus
  }
end

PREAMBLE_HEADER = '<!-- PULL REQUEST ANALYZER GITHUB ACTION -->'

GREETING_HEADER = ":wave: I'm a robot checking the state of this pull request to save the human reviewers time. " \
                  "I noticed this PR added or modififed the data files under `_data/projects/` so I had a look at what's changed." \
                  "\n\nAs you make changes to this pull request, I'll re-run these checks."

UPDATE_HEADER = 'Checking the latest changes to the pull request...'

ALLOWED_EXTENSIONS = ['.yml'].freeze

def get_header(initial_message)
  if initial_message
    GREETING_HEADER
  else
    UPDATE_HEADER
  end
end

def get_validation_message(result)
  path = result[:project].relative_path

  case result[:kind]
  when 'valid'
    "#### `#{path}` :white_check_mark:\nNo problems found, everything should be good to merge!"
  when 'validation'
    message = result[:validation_errors].map { |e| "> - #{e}" }.join "\n"
    "#### `#{path}` :x:\nI had some troubles parsing the project file, or there were fields that are missing that I need.\n\nHere's the details:\n#{message}"
  when 'tags'
    message = result[:tags_errors].map { |e| "> - #{e}" }.join "\n"
    "#### `#{path}` :x:\nI have some suggestions about the tags used in the project:\n\n#{message}"
  when 'link-url'
    "#### `#{path}` :x:\nThe `upforgrabs.url` value #{result[:url]} is not a valid URL - please check and update the value."
  when 'repository', 'label'
    "#### `#{path}` :x:\n#{result[:message]}"
  else
    "#### `#{path}` :question:\nI got a result of type '#{result[:kind]}' that I don't know how to handle. I need to mention @shiftkey here as he might be able to fix it."
  end
end

def generate_comment(dir, files, initial_message: true)
  projects = files.map do |f|
    full_path = File.join(dir, f)

    Project.new(f, full_path) if File.exist?(full_path)
  end

  projects.compact!

  markdown_body = "#{PREAMBLE_HEADER}\n\n#{get_header(initial_message)}\n\n"

  projects_without_valid_extensions = projects.reject { |p| ALLOWED_EXTENSIONS.include? File.extname(p.relative_path) }

  if projects_without_valid_extensions.any?
    messages = ['#### Unexpected files found in project directory']
    projects_without_valid_extensions.each do |p|
      messages << " - `#{p.relative_path}`"
    end
    messages << 'All files under `_data/projects/` must end with `.yml` to be listed on the site'
  elsif projects.count > 2
    results = projects.map { |p| review_project(p) }
    valid_projects, projects_with_errors = results.partition { |r| r[:kind] == 'valid' }

    if projects_with_errors.empty?
      messages = [
        "#### **#{valid_projects.count}** projects without issues :white_check_mark:",
        'Everything should be good to merge!'
      ]
    else
      messages = ["#### **#{valid_projects.count}** projects without issues :white_check_mark:"]
      messages << projects_with_errors.map { |result| get_validation_message(result) }
    end
  else
    messages = projects.map { |p| review_project(p) }.map { |r| get_validation_message(r) }
  end

  markdown_body + messages.join("\n\n")
end

def review_project(project)
  yaml = project.read_yaml

  warn "project YAML: '#{yaml}'"

  validation_errors = SchemaValidator.validate(project)

  return { project:, kind: 'validation', validation_errors: } if validation_errors.any?

  tags_errors = TagsValidator.validate(project)

  return { project:, kind: 'tags', tags_errors: } if tags_errors.any?

  yaml = project.read_yaml
  link = yaml['upforgrabs']['link']

  return { project:, kind: 'link-url', url: link } unless valid_url?(link)

  return { project:, kind: 'valid' } unless project.github_project?

  repository_error = repository_check(project)

  return { project:, kind: 'repository', message: repository_error } unless repository_error.nil?

  label_error = label_check(project)

  return { project:, kind: 'label', message: label_error } unless label_error.nil?

  { project:, kind: 'valid' }
end

def repository_check(project)
  # TODO: this looks for GITHUB_TOKEN underneath - it should not be hard-coded like this
  # TODO: cleanup the GITHUB_TOKEN setting once this is decoupled from the environment variable
  result = GitHubRepositoryActiveCheck.run(project)

  warn "repository_check returned result: #{result.inspect}"

  if result[:rate_limited]
    # logger.info 'This script is currently rate-limited by the GitHub API'
    # logger.info 'Marking as inconclusive to indicate that no further work will be done here'
    return nil
  end

  return "The GitHub repository '#{project.github_owner_name_pair}' has been marked as archived, which suggests it is not active." if result[:reason] == 'archived'

  return "The GitHub repository '#{project.github_owner_name_pair}' cannot be found. Please confirm the location of the project." if result[:reason] == 'missing'

  return "The GitHub repository '#{result[:old_location]}' is now at '#{result[:location]}'. Please update this project before this is merged." if result[:reason] == 'redirect'

  return "The GitHub repository '#{project.github_owner_name_pair}' could not be confirmed. Error details: #{result[:error]}" if result[:reason] == 'error'

  nil
end

def label_check(project)
  result = GitHubRepositoryLabelActiveCheck.run(project)

  warn "label_check returned result: #{result.inspect}"

  if result[:rate_limited]
    # logger.info 'This script is currently rate-limited by the GitHub API'
    # logger.info 'Marking as inconclusive to indicate that no further work will be done here'
    return nil
  end

  return "An error occurred while querying for the project label. Details: #{result[:error].inspect}" if result[:reason] == 'error'

  if result[:reason] == 'repository-missing'
    return "I couldn't find the GitHub repository '#{project.github_owner_name_pair}' that was used in the `upforgrabs.link` value. " \
           "Please confirm this is correct or hasn't been mis-typed."
  end

  return "I couldn't find the label that was used in the `upforgrabs.link` value. Please confirm this is correct or hasn't been mis-typed." if result[:reason] == 'missing'

  yaml = project.read_yaml
  label = yaml['upforgrabs']['name']

  if result[:reason] == 'missing'
    return "The `upforgrabs.name` value '#{label}' isn't in use on the project in GitHub. " \
           'This might just be a mistake due because of copy-pasting the reference template or be mis-typed. ' \
           "Please check the list of labels at https://github.com/#{project.github_owner_name_pair}/labels and update the project file to use the correct label."
  end

  link = yaml['upforgrabs']['link']
  url = result[:url]

  link_needs_rewriting = link != url && link.include?('/labels/')

  if link_needs_rewriting
    return "The label '#{label}' for GitHub repository '#{project.github_owner_name_pair}' does not match the specified `upforgrabs.link` value. Please update it to `#{url}`."
  end

  nil
end

def valid_url?(url)
  uri = URI.parse(url)
  uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
rescue URI::InvalidURIError
  false
end

start = Time.now

base_sha = ENV.fetch('BASE_SHA', nil)
head_sha = ENV.fetch('HEAD_SHA', nil)
git_remote_url = ENV.fetch('GIT_REMOTE_URL', nil)
dir = ENV.fetch('GITHUB_WORKSPACE', nil)

range = "#{base_sha}...#{head_sha}"

warn "Inspecting projects files that have changed for '#{range}' at '#{dir}' and remote '#{git_remote_url}'"

if git_remote_url
  # fetching the fork repository so that our commits are in this repository
  # for processing and comparison with the base branch
  run "git -C '#{dir}' remote add fork #{git_remote_url} -f"
end

result = run "git -C '#{dir}' diff #{range} --name-only -- _data/projects/"
unless result[:exit_code].zero?
  warn "Unable to compute diff range: #{range}..."
  warn "stderr: #{result[:stderr]}"
end

result = run "git -C '#{dir}' checkout #{head_sha}"
unless result[:exit_code].zero?
  warn "Unable to checkout HEAD commit: #{head_sha}..."
  warn "stderr: #{result[:stderr]}"
end

raw_files = result[:stdout].split("\n")

files = raw_files.map(&:chomp)

if files.empty?
  warn 'No project files have been included in this PR...'
  return
end

warn "Found files in this PR to process: '#{files}'"

markdown_body = generate_comment(dir, files, initial_message: true)

warn "Comment to submit: #{markdown_body}"

finish = Time.now
delta = finish - start

warn "Operation took #{delta}s"

exit 0
