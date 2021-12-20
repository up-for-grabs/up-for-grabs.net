# frozen_string_literal: true

require 'safe_yaml'
require 'uri'
require 'octokit'
require 'pathname'
require 'graphql/client'
require 'graphql/client/http'

require 'up_for_grabs_tooling'

def update(project, apply_changes: false)
  return unless project.github_project?

  result = GitHubRepositoryLabelActiveCheck.run(project)

  if result[:rate_limited]
    puts 'This script is currently rate-limited by the GitHub API'
    puts 'Marking as inconclusive to indicate that no further work will be done here'
    exit 0
  end

  if result[:reason] == 'repository-missing'
    puts "The GitHub repository '#{project.github_owner_name_pair}' cannot be found. Please confirm the location of the project."
    return
  end

  obj = project.read_yaml
  label = obj['upforgrabs']['name']

  if result[:reason] == 'missing'
    puts "The label '#{label}' for GitHub repository '#{project.github_owner_name_pair}' could not be found. Please ensure this points to a valid label used in the project."
    return
  end

  link = obj['upforgrabs']['link']

  url = result[:url]

  link_needs_rewriting = link != url && link.include?('/labels/')

  unless apply_changes
    if link_needs_rewriting
      puts "The label link for '#{label}' in project '#{project.relative_path}' is out of sync with what is found in the 'upforgrabs' element. Ensure this is updated to '#{url}'"
    end
    return
  end

  obj.store('upforgrabs', 'name' => label, 'link' => url) if link_needs_rewriting

  if result[:last_updated].nil?
    obj.store('stats', 'issue-count' => result[:count])
  else
    obj.store('stats', 'issue-count' => result[:count], 'last-updated' => result[:last_updated])
  end

  project.write_yaml(obj)
end

repo = ENV['GITHUB_REPOSITORY']

puts "Inspecting projects files for '#{repo}'"

start = Time.now

root_directory = ENV['GITHUB_WORKSPACE']
apply_changes = ENV['APPLY_CHANGES']

current_repo = ENV['GITHUB_REPOSITORY']

client = Octokit::Client.new(access_token: ENV['GITHUB_TOKEN'])
prs = client.pulls current_repo

found_pr = prs.find { |pr| pr.title == 'Updated project stats' && pr.user.login == 'github-actions[bot]' }

if found_pr
  puts "There is a current PR open to update stats ##{found_pr.number} - review and merge that before we go again"
  exit 0
end

projects = Project.find_in_directory(root_directory)

projects.each { |p| update(p, apply_changes: apply_changes) }

unless apply_changes
  puts 'APPLY_CHANGES environment variable unset, exiting instead of making a new PR'
  exit 0
end

clean = true

branch_name = Time.now.strftime('updated-stats-%Y%m%d')

Dir.chdir(root_directory) do
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
