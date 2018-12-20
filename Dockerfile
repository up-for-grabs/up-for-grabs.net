FROM starefossen/github-pages:onbuild

RUN apk update && apk add libc-dev gcc g++ make

RUN bundle install
