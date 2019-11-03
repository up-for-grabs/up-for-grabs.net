FROM ruby:2.6-stretch

# Labels for GitHub to read the action
LABEL "com.github.actions.name"="Merge successful branch"
LABEL "com.github.actions.description"="When a commit status returns success, merge the related branch if it belongs to one of our scheduled actions."
LABEL "com.github.actions.icon"="git-merge"
LABEL "com.github.actions.color"="purple"

COPY Gemfile ./

RUN bundle version

RUN bundle install

COPY . .

ENTRYPOINT ["/run.sh"]
