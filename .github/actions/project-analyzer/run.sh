#!/bin/sh

bundle version

# get the list of files between $GITHUB_SHA and default branch in $GITHUB_WORKSPACE
FILES=$(git -C $GITHUB_WORKSPACE diff $DEFAULT_BRANCH..$GITHUB_SHA --name-only -- _data/projects)

bundle exec ruby /project_analyzer.rb $FILES
