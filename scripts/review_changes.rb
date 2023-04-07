# frozen_string_literal: true

require 'safe_yaml'
require 'uri'
require 'octokit'
require 'pathname'
require 'graphql/client'
require 'graphql/client/http'

require 'open3'

require 'up_for_grabs_tooling'

start = Time.now

base_sha = ENV.fetch('BASE_SHA', nil)
head_sha = ENV.fetch('HEAD_SHA', nil)
dir = ENV.fetch('GITHUB_WORKSPACE', nil)

range = "#{base_sha}...#{head_sha}"

warn "Inspecting projects files that have changed for '#{range}' at '#{dir}'"

result = run "git -C '#{dir}' diff #{range} --name-only -- _data/projects/"
unless result[:exit_code].zero?
  warn "Unable to compute diff range: #{range}..."
  lwarn "stderr: #{result[:stderr]}"
end

raw_files = result[:stdout].split("\n")

files = raw_files.map(&:chomp)

if files.empty?
  logger.info 'No project files have been included in this PR...'
  break
end

logger.info "Found files in this PR to process: '#{files}'"

markdown_body = PullRequestValidator.generate_comment(dir, files, initial_message: true)

logger.info "Comment to submit: #{markdown_body}"

finish = Time.now
delta = finish - start

warn "Operation took #{delta}s"

exit 0
