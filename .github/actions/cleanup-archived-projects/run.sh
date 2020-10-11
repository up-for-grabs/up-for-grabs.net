#!/bin/sh
cd /
bundle version
bundle exec ruby /cleanup_projects.rb
