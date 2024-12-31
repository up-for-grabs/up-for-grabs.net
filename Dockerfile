FROM ruby:3.4-slim-bullseye

RUN apt update \
  && apt install -y build-essential patch ruby-dev zlib1g-dev liblzma-dev git \
  && gem install bundler:2.6.2 \
  && mkdir -p /app

WORKDIR /app

# https://github.com/jekyll/jekyll/issues/4268#issuecomment-167406574

# Install program to configure locales
RUN apt-get install -y locales
RUN dpkg-reconfigure locales && \
  locale-gen C.UTF-8 && \
  /usr/sbin/update-locale LANG=C.UTF-8

# Install needed default locale for Makefly
RUN echo 'en_US.UTF-8 UTF-8' >> /etc/locale.gen && \
  locale-gen

# Set default locale for the environment
ENV LC_ALL C.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8

RUN echo "Testing program is on PATH"
RUN bash --version

EXPOSE 4000
CMD bundle install && bundle exec jekyll serve -d /_site --watch --force_polling -H 0.0.0.0 -P 4000
