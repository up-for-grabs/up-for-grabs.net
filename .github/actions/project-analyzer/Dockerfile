FROM ruby:2.6-stretch

# Labels for GitHub to read the action
LABEL "com.github.actions.name"="Update project stats"
LABEL "com.github.actions.description"="Use the GitHub API to refresh the stats for the current list of projects."
LABEL "com.github.actions.icon"="refresh-cw"
LABEL "com.github.actions.color"="blue"

COPY Gemfile ./

RUN bundle version

RUN bundle install

COPY . .

ENTRYPOINT ["/run.sh"]
