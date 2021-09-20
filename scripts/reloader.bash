#!/bin/bash
#
# Usage: ls tiddlers/*.tid | entr -r scripts/reloader.bash
# If you have livereload start it first and have it watch the file .livereload
#
#     livereload -f .livereload &
#     ls tiddlers/*.tid | entr -r scripts/reloader.bash

livereload_trigger=./.livereload

command_exists() {
  hash "$1" &> /dev/null
}

make server &
sleep 2

if command_exists livereload; then
  touch $livereload_trigger
elif command_exists reload-browser; then
  reload-browser "${1:-Firefox Developer Edition}"
fi

wait
