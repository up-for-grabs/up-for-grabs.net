FROM ruby:2.6-stretch

# Labels for GitHub to read the action
LABEL "com.github.actions.name"="Cleanup archived projects"
LABEL "com.github.actions.description"="Use the GitHub API to identify archived projects and submit PRs to remove from the site."
LABEL "com.github.actions.icon"="refresh-cw"
LABEL "com.github.actions.color"="orange"

COPY Gemfile ./

RUN bundle version

RUN bundle install

COPY . .

ENTRYPOINT ["/run.sh"]
