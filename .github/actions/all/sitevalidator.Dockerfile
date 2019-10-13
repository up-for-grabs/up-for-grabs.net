FROM ruby:2.6-stretch

RUN pwd

RUN ruby -v

RUN ruby validate_site.rb
