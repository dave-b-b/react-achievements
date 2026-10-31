#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"
if [[ -x "$ROOT/bin/agent-local-init" ]] && "$ROOT/bin/python" -c 'import json,sys; sys.exit(0 if json.load(open(sys.argv[1], encoding="utf-8")).get("installation") == {"schema":1,"distribution":"shared"} else 1)' "$ROOT/harness/project.json"; then
  "$ROOT/bin/agent-local-init"
fi
exec "$ROOT/bin/python" script/harness.py init
