FROM ruby:2-alpine

ENV GITHUB_GEM_VERSION 200
ENV JSON_GEM_VERSION 1.8.6

RUN apk --update add --virtual build_deps \
    build-base ruby-dev libc-dev linux-headers \
  && gem install --verbose --no-document \
    json:${JSON_GEM_VERSION} \
    github-pages:${GITHUB_GEM_VERSION} \
    jekyll-github-metadata \
    minitest \
  && apk del build_deps \
  && apk add git libc-dev gcc g++ make \
  && mkdir -p /usr/src/app \
  && rm -rf /usr/lib/ruby/gems/*/cache/*.gem

WORKDIR /usr/src/app

EXPOSE 4000 80
CMD bundle install && bundle exec jekyll serve -d /_site --watch --force_polling -H 0.0.0.0 -P 4000
