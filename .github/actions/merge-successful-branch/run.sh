#!/bin/sh
cd /
bundle version
bundle exec ruby /merge_successful_branch.rb
