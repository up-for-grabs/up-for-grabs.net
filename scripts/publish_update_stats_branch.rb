# frozen_string_literal: true

require 'safe_yaml'
require 'uri'
require 'octokit'
require 'pathname'
require 'graphql/client'
require 'graphql/client/http'

require 'up_for_grabs_tooling'

current_repo = ENV.fetch('GITHUB_REPOSITORY', nil)

start = Time.now

root_directory = ENV.fetch('GITHUB_WORKSPACE', nil)
apply_changes = ENV.fetch('APPLY_CHANGES', false)
token = ENV.fetch('GITHUB_TOKEN', nil)

client = Octokit::Client.new(access_token: token)
prs = client.pulls current_repo

found_pr = prs.find { |pr| pr.title == 'Updated project stats' && pr.user.login == 'shiftbot' }

if found_pr
  warn "There is a current PR open to update stats ##{found_pr.number} - review and merge that before we go again"
  exit 0
end

unless apply_changes
  warn 'APPLY_CHANGES environment variable unset, exiting instead of making a new PR'
  exit 0
end

clean = true

branch_name = Time.now.strftime('updated-stats-%Y%m%d')

Dir.chdir(root_directory) do
  warn 'before setting git config changes'
  system('git config --global user.name "shiftbot"')
  system('git config --global user.email "12331315+shiftbot@users.noreply.github.com"')

  warn 'after setting git config changes'

  system("git remote set-url origin 'https://x-access-token:#{token}@github.com/#{current_repo}.git'")
  # Git now warns when the remote URL is changed, and we need to opt-in for continuing to work with this repository
  system("git config --global --add safe.directory #{Dir.pwd}")

  warn 'after changing git remote url'

  clean = system('git diff --quiet > /dev/null')

  warn 'after git diff'

  unless clean
    system("git checkout -b #{branch_name}")
    warn 'after git checkout'
    system('git add _data/projects/')
    warn 'after git add'
    system("git commit -m 'regenerated project stats'")
    warn 'after git commit'
    system("git push origin #{branch_name}")
    warn 'after git push'
  end
end

unless clean
  body = 'This PR regenerates the stats for all repositories that use a single label in a single GitHub repository'

  client.create_pull_request(current_repo, 'gh-pages', branch_name, 'Updated project stats', body) if found_pr.nil?
end

finish = Time.now
delta = finish - start

warn "Operation took #{delta}s"

exit 0
