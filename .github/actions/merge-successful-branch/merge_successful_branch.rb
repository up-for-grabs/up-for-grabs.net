# frozen_string_literal: true

require 'safe_yaml'
require 'uri'
require 'octokit'
require 'pathname'

require 'up_for_grabs_tooling'

repo = ENV['GITHUB_REPOSITORY']
event_file_path = ENV['GITHUB_EVENT_PATH']

start = Time.now

puts "Inspecting projects files for '#{repo}'"

file = File.open(event_file_path)
text = file.read

json = text.to_json

puts "Event payload: '#{json}'"

if json['state'] == 'success'

  branches = json['branches']

  branches_matching_pattern = branches.select { |b| b.name ~= /(updated-stats|deprecated-projects)-[0-9]{8}/i }

  branches_matching_pattern.each do |branch|
  end

end

finish = Time.now
delta = finish - start

puts "Operation took #{delta}s"
puts

exit 0
