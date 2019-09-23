require 'safe_yaml'
require 'uri'
require 'octokit'
require 'pathname'

def valid_url? (url)
    begin
     uri = URI.parse(url)
     uri.kind_of?(URI::HTTP) || uri.kind_of?(URI::HTTPS)
   rescue URI::InvalidURIError
     false
   end
end

def try_read_owner_repo (url)
    # path semgent in Ruby looks like /{owner}/repo so we drop the
    # first array value (which should be an empty string) and then
    # combine the next two elements

    pathSegments = url.path.split('/')

    if pathSegments.length < 3 then
        # this likely means the URL points to a filtered search URL
        return nil
    else
        values = pathSegments.drop(1).take(2)

        if  values[0].casecmp("orgs") == 0 then
            # points to a project board for the organization
            return nil
        end

        return values.join('/')
    end
end

def find_github_url (url)
    if !valid_url?(url) then
      return nil
    end

    uri = URI.parse(url)

    if uri.host.casecmp("github.com") != 0 then
        return nil
    else
        return try_read_owner_repo(uri)
    end
end

def find_owner_repo_pair (yaml)
    site = yaml["site"]
    owner_and_repo = find_github_url(site)

    if owner_and_repo then
        return owner_and_repo
    end

    upforgrabs = yaml["upforgrabs"]["link"]
    owner_and_repo = find_github_url(upforgrabs)
    if owner_and_repo then
        return owner_and_repo
    end

    return nil
end

def getPullRequestBody (reason)
  if (reason == 'archived') then
    return "This project has been marked as deprecated as the owner has archived the repository, meaning it will not accept new contributions."
  elsif (reason == 'missing')
    return "This project has been marked as deprecated as it is not reachable via the GitHub API."
  else
    return "This project has been marked as deprecated and can be removed from the list."
  end
end

def create_pull_request_removing_file (repo, path, reason)
  puts "Creating new pull request for path '#{path}'"
  file_name = File.basename(path, '.yml')
  branch_name = "projects/deprecated/#{file_name}"

  sha = ENV['GITHUB_SHA']

  short_ref = "heads/#{branch_name}"

  begin
    check_rate_limit
    foundRef = $client.ref(repo, short_ref)
  rescue
    foundRef = nil
  end

  begin
    check_rate_limit
    if (foundRef == nil) then
      puts "Creating ref for '#{short_ref}' to point to '#{sha}'"
      $client.create_ref(repo, short_ref, sha)
    else
      puts "Updating ref for '#{short_ref}' from #{foundRef.object.sha} to '#{sha}'"
      $client.update_ref(repo, short_ref, sha, true)
    end

    check_rate_limit
    content = $client.contents(repo, :path => path, :ref => 'gh-pages')

    check_rate_limit
    $client.delete_contents(repo, path, "Removing deprecated project from list", content.sha, :branch => branch_name)

    check_rate_limit
    $client.create_pull_request(repo, "gh-pages", branch_name, "Deprecated project: #{file_name}.yml", getPullRequestBody(reason))
  rescue
    puts  "Unable to create pull request to remove project #{path} - '#{$!.to_s}''"
    nil
  end
end

def find_pull_request_removing_file (repo, path)
  check_rate_limit
  prs = $client.pulls(repo)

  found_pr = nil

  prs.each { |pr|
    check_rate_limit
    files = $client.pull_request_files(repo, pr.number)
    found = files.select { |f| f.filename == path && f.status == 'removed' }

    if (found.length > 0) then
      found_pr = pr
      break
    end
  }

  found_pr
end

def check_rate_limit
  rate_limit = $client.rate_limit

  remaining = rate_limit.remaining
  resets_in = rate_limit.resets_in
  limit = rate_limit.limit

  remaining_percent = (remaining * 100) / limit

  if (remaining % 10 == 0 && remaining_percent < 20) then
    puts "Rate limit: #{remaining}/#{limit} - #{resets_in}s before reset"
  end

  if (remaining == 0) then
    puts "This script is currently rate-limited by the GitHub API"
    puts "Marking as inconclusive to indicate that no further work will be done here"
    exit 78
  end
end

def relativePath (full_path)
  root = Pathname.new($root_directory)
  Pathname.new(full_path).relative_path_from(root).to_s
end

def verify_file (full_path)
    begin
      path = relativePath(full_path)
      contents = File.read(full_path)
      yaml = YAML.load(contents, :safe => true)

      ownerAndRepo = find_owner_repo_pair(yaml)

      if ownerAndRepo == nil then
        # ignoring entry as we could not find a valid GitHub URL
        # this likely means it's hosted elsewhere
        return { :path => path, :error => nil}
      end

      check_rate_limit
      repo = $client.repo ownerAndRepo

      if repo.archived then
        # Repository has been marked as archived through the GitHub API
        return { :path => path, :deprecated => true, :reason => 'archived' }
      end

      if ownerAndRepo.casecmp(repo.full_name) != 0
        return { :path => path, :deprecated => false, :error => "Repository #{ownerAndRepo} now lives at #{repo.full_name} and should be updated" }
      else
        return  { :path => path, :deprecated => false, :error => nil }
      end

    rescue Psych::SyntaxError => e
      error = "Unable to parse the contents of file - Line: #{e.line}, Offset: #{e.offset}, Problem: #{e.problem}"
      return { :path => path, :deprecated => false, :error => error }
    rescue Octokit::NotFound
      # The repository no longer exists in the GitHub API
      return  { :path => path, :deprecated => true, :reason => 'missing' }
    rescue
      error = "Unknown exception for file: " + $!.to_s
      return  { :path => path, :deprecated => false, :error => error  }
    end
end

repo = ENV['GITHUB_REPOSITORY']

puts "Inspecting projects files for '#{repo}'"

start = Time.now

$client = Octokit::Client.new(:access_token => ENV['GITHUB_TOKEN'])

$root_directory = ENV['GITHUB_WORKSPACE']
verbose = ENV['VERBOSE_OUTPUT']
projects = File.join($root_directory, '_data', 'projects', '*.yml')

results = Dir.glob(projects).map { |path| verify_file(path) }

errors = 0
success = 0

results.each { |result|
  file_path = result[:path]

  if (result[:deprecated]) then
    puts "Project is considered deprecated: '#{file_path}' - reason '#{result[:reason]}'"

    pr = find_pull_request_removing_file(repo, file_path)

    if pr != nil then
      puts "Project #{file_path} has existing PR ##{pr.number} to remove file..."
    else
      pr = create_pull_request_removing_file(repo, file_path, result[:reason])
      if (pr != nil) then
        puts "Opened PR ##{pr.number} to remove project '#{file_path}'..."
      end
    end
    errors += 1
  elsif (result[:error] != nil)
    puts "Encountered error while trying to validate '#{file_path}' - #{result[:error]}"
    errors += 1
  else
    if (verbose != nil) then
      puts "Active project found: '#{file_path}'"
    end
    success += 1
  end
}

finish = Time.now
delta = finish - start

puts "Operation took #{delta}s"
puts ''
puts "#{success} files processed - #{errors} errors found"

exit 0
