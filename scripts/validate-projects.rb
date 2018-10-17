require 'safe_yaml'
require 'uri'
require 'octokit'

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

def verify_file (f)
    begin
      contents = File.read(f)
      yaml = YAML.load(contents, :safe => true)
      ownerAndRepo = find_owner_repo_pair(yaml)

      if ownerAndRepo == nil then
        # ignoring entry as we could not find a valid GitHub URL
        # this likely means it's hosted elsewhere
        return [f, nil]
      end

      client = Octokit::Client.new(:access_token => ENV['GITHUB_ACCESS_TOKEN'])

      repo = client.repo ownerAndRepo

      archived = repo.archived

      if archived then
        error = "Repository has been marked as archived through the GitHub API"
        return [f, error]
      end

    rescue Psych::SyntaxError => e
      error = "Unable to parse the contents of file - Line: #{e.line}, Offset: #{e.offset}, Problem: #{e.problem}"
      return [f, error]
    rescue Octokit::NotFound
        error = "The repository no longer exists on the GitHub API"
        return [f, error]
    rescue
      error = "Unknown exception for file: " + $!.to_s
      return [f, error]
    end

    return [f, nil]
  end


root = File.expand_path("..", __dir__) + "/"
projects = root + "_data/projects/*.yml"

results = Dir[projects].map { |f| verify_file(f) }

files_with_errors = results.select { |file, error| error != nil }
error_count = files_with_errors.count

success = results.select { |file, error| error.nil? }.count

if (error_count > 0) then
  puts "#{success} files processed - #{error_count} errors found:"
  files_with_errors.each { |path, error|
    file = path.sub! root, ''
    puts file + " - " + error
  }
  exit -1
else
  puts "#{success} files processed - no errors found!"
end