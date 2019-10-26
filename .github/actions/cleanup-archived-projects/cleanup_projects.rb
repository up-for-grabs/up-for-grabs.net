# frozen_string_literal: true

require 'safe_yaml'
require 'uri'
require 'octokit'
require 'pathname'

require 'up_for_grabs_tooling'

def get_pull_request_body(reason)
  if reason == 'archived'
    'This project has been marked as deprecated as the owner has archived the repository, meaning it will not accept new contributions.'
  elsif reason == 'missing'
    'This project has been marked as deprecated as it is not reachable via the GitHub API.'
  else
    'This project has been marked as deprecated and can be removed from the list.'
  end
end

def create_pull_request_removing_file(repo, path, reason)
  puts "Creating new pull request for path '#{path}'"
  file_name = File.basename(path, '.yml')
  branch_name = "projects/deprecated/#{file_name}"

  sha = ENV['GITHUB_SHA']

  short_ref = "heads/#{branch_name}"

  begin
    check_rate_limit
    found_ref = $client.ref(repo, short_ref)
  rescue StandardError
    found_ref = nil
  end

  begin
    check_rate_limit
    if found_ref.nil?
      puts "Creating ref for '#{short_ref}' to point to '#{sha}'"
      $client.create_ref(repo, short_ref, sha)
    else
      puts "Updating ref for '#{short_ref}' from #{found_ref.object.sha} to '#{sha}'"
      $client.update_ref(repo, short_ref, sha, true)
    end

    check_rate_limit
    content = $client.contents(repo, path: path, ref: 'gh-pages')

    check_rate_limit
    $client.delete_contents(repo, path, 'Removing deprecated project from list', content.sha, branch: branch_name)

    check_rate_limit
    $client.create_pull_request(repo, 'gh-pages', branch_name, "Deprecated project: #{file_name}.yml", get_pull_request_body(reason))
  rescue StandardError
    puts "Unable to create pull request to remove project #{path} - '#{$ERROR_INFO}''"
    nil
  end
end

def find_pull_request_removing_file(repo, path)
  check_rate_limit
  prs = $client.pulls(repo)

  found_pr = nil

  prs.each do |pr|
    check_rate_limit
    files = $client.pull_request_files(repo, pr.number)
    found = files.select { |f| f.filename == path && f.status == 'removed' }

    unless found.empty?
      found_pr = pr
      break
    end
  end

  found_pr
end

def check_rate_limit
  rate_limit = $client.rate_limit

  remaining = rate_limit.remaining
  resets_in = rate_limit.resets_in
  limit = rate_limit.limit

  remaining_percent = (remaining * 100) / limit

  puts "Rate limit: #{remaining}/#{limit} - #{resets_in}s before reset" if (remaining % 10).zero? && remaining_percent < 20

  return unless remaining.zero?

  puts 'This script is currently rate-limited by the GitHub API'
  puts 'Marking as inconclusive to indicate that no further work will be done here'
  exit 78
end

def verify_project(project)
  path = project.relative_path

  unless project.github_project?
    # ignoring entry as we could not find a valid GitHub URL
    return { path: path, error: nil }
  end

  owner_and_repo = project.github_owner_name_pair

  check_rate_limit
  repo = $client.repo owner_and_repo

  if repo.archived
    # Repository has been marked as archived through the GitHub API
    return { path: path, deprecated: true, reason: 'archived' }
  end

  return { path: path, deprecated: false, error: "Repository #{owner_and_repo} now lives at #{repo.full_name} and should be updated" } unless owner_and_repo.casecmp(repo.full_name).zero?

  { path: path, deprecated: false, error: nil }
rescue Psych::SyntaxError => e
  error = "Unable to parse the contents of file - Line: #{e.line}, Offset: #{e.offset}, Problem: #{e.problem}"
  { path: path, deprecated: false, error: error }
rescue Octokit::NotFound
  # The repository no longer exists in the GitHub API
  { path: path, deprecated: true, reason: 'missing' }
rescue StandardError => e
  { path: path, deprecated: false, error: "Unknown exception for file: #{e}" }
end

repo = ENV['GITHUB_REPOSITORY']

puts "Inspecting projects files for '#{repo}'"

start = Time.now

$client = Octokit::Client.new(access_token: ENV['GITHUB_TOKEN'])

$root_directory = ENV['GITHUB_WORKSPACE']
verbose = ENV['VERBOSE_OUTPUT']
apply_changes = ENV['APPLY_CHANGES']

projects = Dir["#{$root_directory}/_data/projects/*.yml"].map do |f|
  relative_path = Pathname.new(f).relative_path_from($root_directory).to_s
  Project.new(relative_path, f)
end

results = projects.map { |p| verify_project(p) }

errors = 0
success = 0

results.each do |result|
  file_path = result[:path]

  if result[:deprecated]
    puts "Project is considered deprecated: '#{file_path}' - reason '#{result[:reason]}'"

    pr = find_pull_request_removing_file(repo, file_path)

    if !pr.nil?
      puts "Project #{file_path} has existing PR ##{pr.number} to remove file..."
    elsif apply_changes
      pr = create_pull_request_removing_file(repo, file_path, result[:reason])
      puts "Opened PR ##{pr.number} to remove project '#{file_path}'..." unless pr.nil?
    else
      puts "Because APPLY_CHANGES not set, PR to remove project '#{file_path}' not started..."
    end
    errors += 1
  elsif !result[:error].nil?
    puts "Encountered error while trying to validate '#{file_path}' - #{result[:error]}"
    errors += 1
  else
    puts "Active project found: '#{file_path}'" unless verbose.nil?
    success += 1
  end
end

finish = Time.now
delta = finish - start

puts "Operation took #{delta}s"
puts ''
puts "#{success} files processed - #{errors} errors found"

exit 0
