FROM ruby:2.7-bullseye

# Labels for GitHub to read the action
LABEL "com.github.actions.name"Lava-auto/up-for-grabs.net"Cleanup archived projects"
LABEL "com.github.actions.description"="Use the GitHub API to identify archived projects and submit PRs to remove from the site."
LABEL "com.github.actions.icon"="refresh-cw"
LABEL "com.github.actions.color"="orange"

COPY Gemfile ./

RUN bundle version

RUN bundle install

COPY . .

ENTRYPOINT ["/run.sh"]
