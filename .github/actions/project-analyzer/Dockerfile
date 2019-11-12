FROM ruby:2.6-stretch

# Labels for GitHub to read the action
LABEL "com.github.actions.name"="Validate pull request"
LABEL "com.github.actions.description"="Check the new or modified project files and provide guidance if there are issues"
LABEL "com.github.actions.icon"="refresh-cw"
LABEL "com.github.actions.color"="red"

COPY Gemfile ./

RUN bundle version

RUN bundle install

COPY . .

ENTRYPOINT ["/run.sh"]
