#!/bin/bash
# Runs an ExtendScript file in Adobe Illustrator 2026 (the regular version, not Beta).
# Usage: run_jsx.sh <script.jsx> [arg1 arg2 ...]   -> args are available as arguments[0..] in the jsx
set -euo pipefail
if [ $# -lt 1 ]; then echo "usage: run_jsx.sh <script.jsx> [args...]" >&2; exit 1; fi
JSX="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"; shift
APP="${ILLUSTRATOR_APP:-/Applications/Adobe Illustrator 2026/Adobe Illustrator.app}"
# The app path must be literal in the AppleScript so "do javascript" resolves at compile time;
# the jsx path and its arguments travel as argv so no quoting is needed.
osascript - "$JSX" "$@" <<EOF | tr '\r' '\n'
on run argv
  set jsxFile to (POSIX file (item 1 of argv)) as alias
  if (count of argv) > 1 then
    set jsxArgs to items 2 thru -1 of argv
  else
    set jsxArgs to {}
  end if
  tell application "$APP"
    return do javascript jsxFile with arguments jsxArgs
  end tell
end run
EOF
