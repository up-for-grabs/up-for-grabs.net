#!/bin/sh
cd /
bundle version
bundle exec ruby /update_stats.rb
