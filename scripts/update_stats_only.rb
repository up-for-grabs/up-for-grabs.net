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
    warn 'This script is currently rate-limited by the GitHub API'
    warn 'Marking as inconclusive to indicate that no further work will be done here'
    exit 0
  end

  if result[:reason] == 'repository-missing'
    warn "The GitHub repository '#{project.github_owner_name_pair}' cannot be found. Please confirm the location of the project."
    return
  end

  if result[:reason] == 'issues-disabled'
    warn "The GitHub repository '#{project.github_owner_name_pair}' has issues disabled, and should be cleaned up with the next deprecation run."
    return
  end

  if result[:reason] == 'error'
    warn "An error occurred: #{result[:error]}"
    return
  end

  obj = project.read_yaml
  label = obj['upforgrabs']['name']

  if result[:reason] == 'missing'
    warn "The label '#{label}' for GitHub repository '#{project.github_owner_name_pair}' could not be found. Please ensure this points to a valid label used in the project."
    return
  end

  link = obj['upforgrabs']['link']

  url = result[:url]

  link_needs_rewriting = link != url && link.include?('/labels/')

  unless apply_changes
    warn "The label link for '#{label}' in project '#{project.relative_path}' is out of sync with what is found in the 'upforgrabs' element. Ensure this is updated to '#{url}'" if link_needs_rewriting
    return
  end

  obj.store('upforgrabs', 'name' => label, 'link' => url) if link_needs_rewriting

  if result[:last_updated].nil?
    obj.store('stats',
              'issue-count' => result[:count],
              'fork-count' => result[:fork_count])
  else
    obj.store('stats',
              'issue-count' => result[:count],
              'last-updated' => result[:last_updated],
              'fork-count' => result[:fork_count])
  end

  project.write_yaml(obj)
end

current_repo = ENV.fetch('GITHUB_REPOSITORY', nil)
root_directory = ENV.fetch('GITHUB_WORKSPACE', nil)
apply_changes = ENV.fetch('APPLY_CHANGES', false)

warn "Inspecting projects files for '#{current_repo}'"

start = Time.now

projects = Project.find_in_directory(root_directory)

warn 'Iterating on project updates'

projects.each { |p| update(p, apply_changes:) }

warn 'Completed iterating on project updates'

finish = Time.now
delta = finish - start

warn "Operation took #{delta}s"

exit 0
