FROM ruby:2.6-slim-buster

ENV GITHUB_GEM_VERSION 200
ENV JSON_GEM_VERSION 1.8.6

RUN apt update \
  && apt install -y build-essential patch ruby-dev zlib1g-dev liblzma-dev git \
  && gem install bundler:2.1.4 \
  && mkdir -p /app

WORKDIR /app

EXPOSE 4000 80
CMD bundle install && bundle exec jekyll serve -d /_site --watch --force_polling -H 0.0.0.0 -P 4000
