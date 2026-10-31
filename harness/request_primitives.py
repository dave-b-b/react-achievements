"""Closed request-scope validation and pure continuation decisions.

This module deliberately accepts only typed repository facts.  It does not read
agent guidance, prompts, or feature prose, and it performs no Git or filesystem
effects.  The harness adapter supplies current receipts, reviews, and state.
"""
from __future__ import annotations

import hashlib
import json
import re
from typing import Any


REQUEST_SCHEMA = 1
FACTS_SCHEMA = 1
DECISION_SCHEMA = 1
MAX_FEATURES = 1000
MAX_TASKS = 1000
MAX_EVENTS = 10000
FEATURE_ID = re.compile(r"[A-Z][A-Z0-9]*-\d{3}\Z")
TASK_ID = re.compile(r"T\d{3}\Z")
GIT_ID = re.compile(r"[0-9a-f]{40}\Z")
DIGEST = re.compile(r"[0-9a-f]{64}\Z")
FORBIDDEN_PUBLIC_TEXT = re.compile(r"/Users/|/home/|token|secret|password|Bearer|ssh-|BEGIN .*PRIVATE KEY", re.I)
HIGH_CONFIDENCE_CREDENTIAL = re.compile(r"(?:A(?:KIA|SIA)[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-(?:proj|svcacct|live)-[A-Za-z0-9_-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)")
STATUSES = {"not_started", "in_progress", "blocked", "paused", "suspended", "archived", "passing", "superseded"}
MODES = {"task", "feature", "request", "features"}
DECISIONS = {"BUILD_TASK", "COMMIT_REQUIRED", "ADVANCE_REQUIRED", "RECOVER_REQUIRED", "STOP", "DEFER", "COMPLETE", "BLOCK"}
REASONS = {
    "TASK_REMAINING", "CONTENT_READY", "REQUIRED_SUCCESSOR", "OPTIONAL_SUCCESSOR",
    "TASK_BOUNDARY", "FEATURE_BOUNDARY", "FEATURE_LIMIT", "REQUIRED_COMPLETE",
    "OPTIONAL_DISABLED", "OPTIONAL_LIMIT_REACHED", "OPTIONAL_DEFERRED", "REQUEST_COMPLETE",
    "INVALID_CONTRACT", "STALE_CONTRACT", "UNMET_REQUIRED_DEPENDENCY",
    "OPTIONAL_DEPENDENCY_CONTRADICTION", "PENDING_TRANSITION", "UNSUPPORTED_PARALLEL",
    "ACTIVE_SCOPE_CONTRADICTION", "MISSING_EVIDENCE", "MISSING_REVIEW", "MANUAL_COMMIT",
    "HUMAN_REVIEW", "EXTERNAL_AUTHORITY",
    "CONTENT_COMMITTED", "OPTIONAL_BLOCKED", "OPTIONAL_EXCLUDED",
}
CHECKPOINTS = {
    "STOP_AFTER_TASK", "CONTINUE_FEATURE", "STOP_AFTER_FEATURE", "CONTINUE_REQUEST",
    "STOP_AFTER_REQUEST", "STOP_REQUEST_BLOCKED", "CONTINUE_FEATURES",
    "STOP_AFTER_FEATURE_LIMIT", "STOP_NO_ELIGIBLE_FEATURE",
}


def _canonical(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def _is_int(value: Any) -> bool:
    return isinstance(value, int) and not isinstance(value, bool)


def _safe_text(value: Any, *, limit: int = 300) -> bool:
    return isinstance(value, str) and bool(value.strip()) and len(value) <= limit and not any(ord(char) < 32 or 127 <= ord(char) <= 159 or char in "\u2028\u2029" for char in value) and not bool(FORBIDDEN_PUBLIC_TEXT.search(value) or HIGH_CONFIDENCE_CREDENTIAL.search(value))


def _identifier(value: Any) -> bool:
    return isinstance(value, str) and bool(FEATURE_ID.fullmatch(value))


def _task_identifier(value: Any) -> bool:
    return isinstance(value, str) and bool(TASK_ID.fullmatch(value))


def contract_digest(request: dict[str, Any]) -> str:
    """Digest the immutable request definition, never its appended history."""
    payload = {"schema": request.get("schema"), "id": request.get("id"), "contract": request.get("contract")}
    return hashlib.sha256(_canonical(payload)).hexdigest()


EVENT_KEYS = {"schema", "ordinal", "transition_id", "kind", "phase", "feature", "content_commit", "predecessor", "tree", "contract_digest", "reason"}


def transition_id(event: dict[str, Any]) -> str:
    """Return the stable event identity without a self-referential hash."""
    return hashlib.sha256(_canonical({key: value for key, value in event.items() if key != "transition_id"})).hexdigest()


def event_errors(request: Any) -> list[str]:
    """Validate append-only request history shape and its closed event matrix."""
    if not isinstance(request, dict) or not isinstance(request.get("events"), list) or len(request["events"]) > MAX_EVENTS:
        return ["request events must be a bounded list"]
    contract=request.get("contract")
    if not isinstance(contract, dict) or not isinstance(contract.get("required"), list) or not isinstance(contract.get("optional"), list) or not isinstance(contract.get("excluded"), list):
        return ["request events require a valid contract"]
    required=contract["required"]
    optional=[entry.get("feature") for entry in contract["optional"] if isinstance(entry,dict)]
    excluded=contract["excluded"]
    digest=contract_digest(request)
    for ordinal,event in enumerate(request["events"],1):
        if not isinstance(event,dict) or set(event)!=EVENT_KEYS or not _is_int(event.get("schema")) or event.get("schema")!=1 or not _is_int(event.get("ordinal")) or event.get("ordinal")!=ordinal:
            return ["request event has an invalid closed shape or ordinal"]
        if not isinstance(event.get("transition_id"),str) or not DIGEST.fullmatch(event["transition_id"]) or event["transition_id"]!=transition_id(event):
            return ["request event transition identity is invalid"]
        if not isinstance(event.get("contract_digest"),str) or event["contract_digest"]!=digest or not isinstance(event.get("kind"),str) or not isinstance(event.get("phase"),str) or not isinstance(event.get("reason"),str):
            return ["request event contract binding is invalid"]
        feature=event.get("feature"); content=event.get("content_commit")
        if not isinstance(event.get("predecessor"),str) or not GIT_ID.fullmatch(event["predecessor"]) or not isinstance(event.get("tree"),str) or not GIT_ID.fullmatch(event["tree"]):
            return ["request event Git binding is invalid"]
        if event["kind"]=="content-commit":
            if event["phase"] not in {"required","optional"} or not _identifier(feature) or not isinstance(content,str) or not GIT_ID.fullmatch(content) or event["reason"]!="CONTENT_COMMITTED" or (event["phase"]=="required" and feature not in required) or (event["phase"]=="optional" and feature not in optional):
                return ["request content event violates the event matrix"]
        elif event["kind"]=="core-boundary":
            if event["phase"]!="required" or feature is not None or content is not None or event["reason"]!="REQUIRED_COMPLETE":
                return ["request core-boundary event violates the event matrix"]
        elif event["kind"]=="deferred":
            optional_reason=event["reason"] in {"OPTIONAL_DISABLED","OPTIONAL_LIMIT_REACHED","OPTIONAL_BLOCKED","EXTERNAL_AUTHORITY"}
            excluded_reason=event["reason"]=="OPTIONAL_EXCLUDED"
            if event["phase"]!="optional" or not _identifier(feature) or content is not None or (feature not in optional and feature not in excluded) or (feature in optional and not optional_reason) or (feature in excluded and not excluded_reason):
                return ["request deferred event violates the event matrix"]
        elif event["kind"]=="terminal":
            if event["phase"]!="terminal" or feature is not None or content is not None or event["reason"]!="REQUEST_COMPLETE":
                return ["request terminal event violates the event matrix"]
        else:
            return ["request event kind is invalid"]
    return []


def _facts_index(facts: Any) -> dict[str, dict[str, Any]]:
    if not isinstance(facts, dict) or not isinstance(facts.get("features"), list):
        return {}
    return {entry["id"]: entry for entry in facts["features"] if isinstance(entry, dict) and _identifier(entry.get("id"))}


def facts_errors(facts: Any) -> list[str]:
    if not isinstance(facts, dict) or set(facts) != {"schema", "active_feature", "features", "transition", "parallel_supported", "boundary_task"}:
        return ["facts must contain exactly the closed request-decision fields"]
    if not _is_int(facts.get("schema")) or facts.get("schema") != FACTS_SCHEMA or not isinstance(facts.get("parallel_supported"), bool):
        return ["facts schema or parallel capability is invalid"]
    active = facts.get("active_feature")
    if active is not None and not _identifier(active):
        return ["facts active feature is invalid"]
    entries = facts.get("features")
    if not isinstance(entries, list) or not entries or len(entries) > MAX_FEATURES:
        return ["facts require a bounded nonempty feature ledger"]
    seen: set[str] = set()
    for entry in entries:
        if not isinstance(entry, dict) or set(entry) != {"id", "status", "depends_on", "tasks", "external_gates", "boundary"}:
            return ["feature facts have unknown or missing fields"]
        identifier = entry.get("id")
        if not _identifier(identifier) or identifier in seen or not isinstance(entry.get("status"), str) or entry.get("status") not in STATUSES:
            return ["feature facts have invalid identity or status"]
        seen.add(identifier)
        dependencies = entry.get("depends_on")
        if not isinstance(dependencies, list) or any(not _identifier(value) for value in dependencies) or len(dependencies) != len(set(dependencies)):
            return ["feature facts have invalid dependencies"]
        tasks = entry.get("tasks")
        if not isinstance(tasks, list) or not tasks or len(tasks) > MAX_TASKS:
            return ["feature facts require a bounded nonempty task ledger"]
        task_ids: set[str] = set()
        for task in tasks:
            if not isinstance(task, dict) or set(task) != {"id", "complete"} or not _task_identifier(task.get("id")) or task["id"] in task_ids or not isinstance(task.get("complete"), bool):
                return ["feature facts have invalid ordered tasks"]
            task_ids.add(task["id"])
        gates = entry.get("external_gates")
        if not isinstance(gates, list) or any(not _safe_text(gate, limit=200) for gate in gates) or len(gates) != len(set(gates)):
            return ["feature facts have invalid external gates"]
        boundary = entry.get("boundary")
        if not isinstance(boundary, dict) or set(boundary) != {"evidence_current", "review_current", "content_committed"} or any(not isinstance(boundary.get(key), bool) for key in boundary):
            return ["feature facts have invalid boundary state"]
    if active is not None and active not in seen:
        return ["facts active feature is absent from the ledger"]
    in_progress = [entry["id"] for entry in entries if entry["status"] == "in_progress"]
    if (active is None and in_progress) or (active is not None and in_progress != [active]):
        return ["facts active feature must match the sole in-progress ledger item"]
    transition = facts.get("transition")
    if not isinstance(transition, dict) or set(transition) != {"state", "phase", "feature"} or not isinstance(transition.get("state"), str) or transition.get("state") not in {"none", "pending", "committed"}:
        return ["facts transition is invalid"]
    if not isinstance(transition.get("phase"), (str, type(None))) or transition.get("phase") not in {None, "required", "optional", "terminal"} or (transition.get("feature") is not None and not _identifier(transition.get("feature"))):
        return ["facts transition is invalid"]
    if transition["state"] == "none" and (transition["phase"] is not None or transition["feature"] is not None):
        return ["empty transition must not select a phase or feature"]
    if transition["state"] != "none" and (transition["phase"] is None or (transition["phase"] == "terminal" and transition["feature"] is not None) or (transition["phase"] != "terminal" and transition["feature"] not in seen)):
        return ["pending transition must pin a phase and known feature"]
    boundary_task = facts.get("boundary_task")
    if boundary_task is not None:
        if active is None or not _task_identifier(boundary_task):
            return ["facts boundary task requires an active canonical task"]
        current = next(entry for entry in entries if entry["id"] == active)
        matching = [task for task in current["tasks"] if task["id"] == boundary_task]
        if len(matching) != 1 or not matching[0]["complete"]:
            return ["facts boundary task is not a completed active task"]
    return []


def request_errors(request: Any, facts: Any) -> list[str]:
    if facts_errors(facts):
        return ["request requires valid typed facts"]
    return request_contract_errors(request, facts["features"])


def request_contract_errors(request: Any, features: Any) -> list[str]:
    """Validate request structure against candidate feature facts, without task-file facts."""
    if not isinstance(features,list) or not features:
        return ["request requires candidate feature facts"]
    for entry in features:
        if (not isinstance(entry,dict) or not _identifier(entry.get("id"))
                or entry.get("status") not in STATUSES
                or not isinstance(entry.get("depends_on"),list)
                or any(not _identifier(value) for value in entry["depends_on"])
                or len(entry["depends_on"])!=len(set(entry["depends_on"]))):
            return ["candidate feature facts are invalid"]
    if not isinstance(request, dict) or set(request) != {"schema", "id", "contract", "events"}:
        return ["request must contain exactly schema, id, contract, and events"]
    if not _is_int(request.get("schema")) or request.get("schema") != REQUEST_SCHEMA or not _identifier(request.get("id")):
        return ["request schema or id is invalid"]
    events = request.get("events")
    if not isinstance(events, list) or len(events) > MAX_EVENTS:
        return ["request events must be a bounded list"]
    contract = request.get("contract")
    if not isinstance(contract, dict) or set(contract) != {"required", "optional", "excluded", "execution", "optional_limit"}:
        return ["request contract has unknown or missing fields"]
    required = contract.get("required")
    optional = contract.get("optional")
    excluded = contract.get("excluded")
    if not isinstance(required, list) or not required or len(required) > MAX_FEATURES or any(not _identifier(value) for value in required) or len(required) != len(set(required)):
        return ["request required membership is invalid"]
    if not isinstance(optional, list) or len(optional) > MAX_FEATURES:
        return ["request optional membership is invalid"]
    optional_ids: list[str] = []
    for entry in optional:
        if not isinstance(entry, dict) or set(entry) != {"feature", "rationale", "removal_impact"} or not _identifier(entry.get("feature")) or not _safe_text(entry.get("rationale")) or not _safe_text(entry.get("removal_impact")):
            return ["request optional membership is invalid"]
        optional_ids.append(entry["feature"])
    if len(optional_ids) != len(set(optional_ids)) or not isinstance(excluded, list) or len(excluded) > MAX_FEATURES or any(not _identifier(value) for value in excluded) or len(excluded) != len(set(excluded)):
        return ["request optional or excluded membership is invalid"]
    if set(required) & set(optional_ids) or set(required) & set(excluded) or set(optional_ids) & set(excluded):
        return ["request memberships must be disjoint"]
    execution = contract.get("execution")
    if not isinstance(execution, dict) or set(execution) != {"mode", "feature_limit", "dispatch", "local_commit", "review", "publication"}:
        return ["request execution settings are invalid"]
    mode = execution.get("mode")
    limit = execution.get("feature_limit")
    membership_count = len(required) + len(optional_ids)
    if not isinstance(mode, str) or mode not in MODES or not isinstance(execution.get("dispatch"), str) or execution.get("dispatch") not in {"serial", "parallel"} or not isinstance(execution.get("local_commit"), str) or execution.get("local_commit") not in {"continue", "manual"} or not isinstance(execution.get("review"), str) or execution.get("review") not in {"agent", "human"} or execution.get("publication") != "explicit":
        return ["request execution settings are invalid"]
    if mode == "request" and limit is not None:
        return ["request mode requires a null feature limit"]
    if mode in {"task", "feature"} and (not _is_int(limit) or limit != 1):
        return ["task and feature modes require feature limit one"]
    if mode == "features" and (not _is_int(limit) or limit < 1 or limit > membership_count):
        return ["bounded features mode requires an in-range integer limit"]
    optional_limit = contract.get("optional_limit")
    if not _is_int(optional_limit) or optional_limit < 0 or optional_limit > len(optional_ids):
        return ["request optional limit is invalid"]
    index = _facts_index({"features":features})
    if not index or any(identifier not in index for identifier in [*required, *optional_ids, *excluded]):
        return ["request membership references unknown feature facts"]
    for position, identifier in enumerate(required):
        for dependency in index[identifier]["depends_on"]:
            if dependency in optional_ids:
                return ["required work must not depend on optional work"]
            if dependency in required and required.index(dependency) >= position:
                return ["request required membership violates dependency order"]
            if dependency not in required and index.get(dependency, {}).get("status") != "passing":
                return ["request has an unmet external required dependency"]
    for position, identifier in enumerate(optional_ids):
        for dependency in index[identifier]["depends_on"]:
            if dependency in excluded:
                return ["optional work must not depend on excluded work"]
            if dependency in optional_ids and optional_ids.index(dependency) >= position:
                return ["request optional membership violates dependency order"]
            if dependency not in required and dependency not in optional_ids and dependency not in index:
                return ["request optional work has an unknown external dependency"]
    return event_errors(request)


def _checkpoint(mode: str, *, terminal: bool = False, limit: bool = False) -> str:
    if mode == "task":
        return "STOP_AFTER_TASK"
    if mode == "feature":
        return "STOP_AFTER_FEATURE"
    if mode == "request":
        return "STOP_AFTER_REQUEST" if terminal else "CONTINUE_REQUEST"
    return "STOP_AFTER_FEATURE_LIMIT" if limit else "CONTINUE_FEATURES"


def _decision(request: dict[str, Any], *, phase: str, decision: str, reason: str, feature: str | None = None, task: str | None = None, checkpoint: str | None = None, handoff: bool = False) -> dict[str, Any]:
    if decision not in DECISIONS or reason not in REASONS or phase not in {"required", "optional", "terminal", "blocked"} or (feature is not None and not _identifier(feature)) or (task is not None and not _task_identifier(task)) or (checkpoint is not None and checkpoint not in CHECKPOINTS):
        raise ValueError("invalid internal request decision")
    return {"schema": DECISION_SCHEMA, "request_id": request.get("id"), "contract_digest": contract_digest(request), "phase": phase, "decision": decision, "reason": reason, "feature": feature, "task": task, "checkpoint_decision": checkpoint, "handoff_required": handoff}


def _done(entry: dict[str, Any], active_feature: str | None = None) -> bool:
    """Completion is typed current state, never a status label or narrative."""
    status_allows_completion = entry["status"] == "passing" or (entry["id"] == active_feature and entry["status"] == "in_progress")
    return status_allows_completion and all(task["complete"] for task in entry["tasks"]) and all(entry["boundary"].values()) and not entry["external_gates"]


def _next_member(members: list[str], index: dict[str, dict[str, Any]], active_feature: str | None) -> tuple[str | None, bool]:
    """Select the first unfinished declared member and its typed dependency readiness."""
    for identifier in members:
        if not _done(index[identifier], active_feature):
            ready = all(dependency in index and _done(index[dependency], active_feature) for dependency in index[identifier]["depends_on"])
            return identifier, ready
    return None, True


def _after_feature(request: dict[str, Any], current: dict[str, Any], index: dict[str, dict[str, Any]], execution: dict[str, Any] | None = None) -> dict[str, Any]:
    execution = execution if execution is not None else request["contract"]["execution"]
    mode = execution["mode"]
    phase = "required" if current["id"] in request["contract"]["required"] else "optional"
    if current["external_gates"]:
        return _decision(request, phase=phase, decision="BLOCK" if phase == "required" else "DEFER", reason="EXTERNAL_AUTHORITY", feature=current["id"], checkpoint="STOP_REQUEST_BLOCKED")
    if mode == "task":
        return _decision(request, phase=phase, decision="STOP", reason="TASK_BOUNDARY", feature=current["id"], checkpoint=_checkpoint(mode))
    if mode == "feature":
        return _decision(request, phase=phase, decision="STOP", reason="FEATURE_BOUNDARY", feature=current["id"], checkpoint=_checkpoint(mode))
    members = [*request["contract"]["required"], *(entry["feature"] for entry in request["contract"]["optional"])]
    complete_count = sum(1 for identifier in members if _done(index[identifier], current["id"]))
    if mode == "features" and complete_count >= execution["feature_limit"]:
        return _decision(request, phase=phase, decision="STOP", reason="FEATURE_LIMIT", feature=current["id"], checkpoint=_checkpoint(mode, limit=True))
    required = request["contract"]["required"]
    next_required, required_ready = _next_member(required, index, current["id"])
    if next_required is not None:
        if not required_ready:
            return _decision(request, phase="blocked", decision="BLOCK", reason="UNMET_REQUIRED_DEPENDENCY", feature=next_required)
        if index[next_required]["status"] != "not_started":
            return _decision(request, phase="blocked", decision="BLOCK", reason="ACTIVE_SCOPE_CONTRADICTION", feature=next_required)
        return _decision(request, phase="required", decision="ADVANCE_REQUIRED", reason="REQUIRED_SUCCESSOR", feature=next_required, checkpoint=_checkpoint(mode), handoff=True)
    optional = request["contract"]["optional"]
    optional_limit = request["contract"]["optional_limit"]
    optional_ids = [entry["feature"] for entry in optional]
    candidate, optional_ready = _next_member(optional_ids, index, current["id"])
    if candidate is None:
        return _decision(request, phase="terminal", decision="COMPLETE", reason="REQUEST_COMPLETE", checkpoint=_checkpoint(mode, terminal=True), handoff=True)
    completed_optional = sum(1 for entry in optional if _done(index[entry["feature"]], current["id"]))
    if optional_limit == 0:
        return _decision(request, phase="optional", decision="DEFER", reason="OPTIONAL_DISABLED", feature=candidate, checkpoint=_checkpoint(mode, terminal=True), handoff=True)
    if completed_optional >= optional_limit:
        return _decision(request, phase="optional", decision="DEFER", reason="OPTIONAL_LIMIT_REACHED", feature=candidate, checkpoint=_checkpoint(mode, terminal=True), handoff=True)
    if not optional_ready:
        return _decision(request, phase="optional", decision="DEFER", reason="OPTIONAL_DEFERRED", feature=candidate, checkpoint=_checkpoint(mode, terminal=True), handoff=True)
    if index[candidate]["external_gates"]:
        return _decision(request, phase="optional", decision="DEFER", reason="EXTERNAL_AUTHORITY", feature=candidate, checkpoint=_checkpoint(mode, terminal=True), handoff=True)
    if index[candidate]["status"] != "not_started":
        return _decision(request, phase="optional", decision="DEFER", reason="OPTIONAL_DEFERRED", feature=candidate, checkpoint=_checkpoint(mode, terminal=True), handoff=True)
    return _decision(request, phase="optional", decision="ADVANCE_REQUIRED", reason="OPTIONAL_SUCCESSOR", feature=candidate, checkpoint=_checkpoint(mode), handoff=True)


def next_action(request: dict[str, Any], facts: dict[str, Any], *, expected_contract_digest: str | None = None, execution_override: dict[str, Any] | None = None) -> dict[str, Any]:
    """Return the one typed next action; malformed or stale inputs fail closed."""
    errors = facts_errors(facts)
    if errors:
        return _decision(request if isinstance(request, dict) else {"schema": None, "id": None, "contract": None}, phase="blocked", decision="BLOCK", reason="ACTIVE_SCOPE_CONTRADICTION")
    errors = request_errors(request, facts)
    if errors:
        return _decision(request if isinstance(request, dict) else {"schema": None, "id": None, "contract": None}, phase="blocked", decision="BLOCK", reason="INVALID_CONTRACT")
    current_digest = contract_digest(request)
    if expected_contract_digest is not None and (not isinstance(expected_contract_digest, str) or not DIGEST.fullmatch(expected_contract_digest) or expected_contract_digest != current_digest):
        return _decision(request, phase="blocked", decision="BLOCK", reason="STALE_CONTRACT")
    index = _facts_index(facts)
    transition = facts["transition"]
    if transition["state"] != "none":
        members = { *request["contract"]["required"], *(entry["feature"] for entry in request["contract"]["optional"]) }
        if transition["phase"] == "terminal":
            return _decision(request, phase="blocked", decision="RECOVER_REQUIRED", reason="PENDING_TRANSITION", handoff=True)
        if transition["feature"] not in members or (transition["feature"] in request["contract"]["required"] and transition["phase"] != "required") or (transition["feature"] in {entry["feature"] for entry in request["contract"]["optional"]} and transition["phase"] != "optional"):
            return _decision(request, phase="blocked", decision="BLOCK", reason="ACTIVE_SCOPE_CONTRADICTION")
        return _decision(request, phase="blocked", decision="RECOVER_REQUIRED", reason="PENDING_TRANSITION", feature=transition["feature"], handoff=True)
    execution = execution_override if execution_override is not None else request["contract"]["execution"]
    if execution["dispatch"] == "parallel" and not facts["parallel_supported"]:
        return _decision(request, phase="blocked", decision="BLOCK", reason="UNSUPPORTED_PARALLEL")
    active_id = facts["active_feature"]
    required = request["contract"]["required"]
    optional_ids = [entry["feature"] for entry in request["contract"]["optional"]]
    if active_id is None:
        candidate, required_ready = _next_member(required, index, None)
        if candidate is not None:
            if not required_ready:
                return _decision(request, phase="blocked", decision="BLOCK", reason="UNMET_REQUIRED_DEPENDENCY", feature=candidate)
            if index[candidate]["status"] != "not_started":
                return _decision(request, phase="blocked", decision="BLOCK", reason="ACTIVE_SCOPE_CONTRADICTION", feature=candidate)
            return _decision(request, phase="required", decision="ADVANCE_REQUIRED", reason="REQUIRED_SUCCESSOR", feature=candidate, checkpoint=_checkpoint(execution["mode"]), handoff=True)
        return _after_feature(request, index[required[-1]], index, execution)
    if active_id not in [*required, *optional_ids]:
        return _decision(request, phase="blocked", decision="BLOCK", reason="ACTIVE_SCOPE_CONTRADICTION")
    current = index[active_id]
    if active_id in required:
        first_required = next((identifier for identifier in required if not _done(index[identifier], active_id)), None)
        if first_required is not None and required.index(first_required) < required.index(active_id):
            return _decision(request, phase="blocked", decision="BLOCK", reason="ACTIVE_SCOPE_CONTRADICTION", feature=active_id)
    elif any(not _done(index[identifier], active_id) for identifier in required):
        return _decision(request, phase="blocked", decision="BLOCK", reason="ACTIVE_SCOPE_CONTRADICTION", feature=active_id)
    else:
        optional_ids = [entry["feature"] for entry in request["contract"]["optional"]]
        first_optional = next((identifier for identifier in optional_ids if not _done(index[identifier], active_id)), None)
        if first_optional is not None and optional_ids.index(first_optional) < optional_ids.index(active_id):
            return _decision(request, phase="blocked", decision="BLOCK", reason="ACTIVE_SCOPE_CONTRADICTION", feature=active_id)
    boundary_task = facts["boundary_task"]
    incomplete = next((task["id"] for task in current["tasks"] if not task["complete"]), None)
    current_phase = "required" if active_id in required else "optional"
    if current_phase == "optional" and not current["boundary"]["content_committed"]:
        optional = request["contract"]["optional"]
        completed_optional = sum(1 for entry in optional if _done(index[entry["feature"]], active_id))
        if request["contract"]["optional_limit"] == 0:
            return _decision(request, phase="optional", decision="DEFER", reason="OPTIONAL_DISABLED", feature=active_id, checkpoint=_checkpoint(execution["mode"], terminal=True), handoff=True)
        if completed_optional >= request["contract"]["optional_limit"]:
            return _decision(request, phase="optional", decision="DEFER", reason="OPTIONAL_LIMIT_REACHED", feature=active_id, checkpoint=_checkpoint(execution["mode"], terminal=True), handoff=True)
        if not all(dependency in index and _done(index[dependency], active_id) for dependency in current["depends_on"]):
            return _decision(request, phase="optional", decision="DEFER", reason="OPTIONAL_DEFERRED", feature=active_id, checkpoint=_checkpoint(execution["mode"], terminal=True), handoff=True)
    if boundary_task is not None and not current["boundary"]["content_committed"]:
        if execution["review"] == "human":
            return _decision(request, phase=current_phase, decision="STOP", reason="HUMAN_REVIEW", feature=active_id, task=boundary_task, checkpoint=_checkpoint(execution["mode"]))
        if execution["local_commit"] == "manual":
            return _decision(request, phase=current_phase, decision="STOP", reason="MANUAL_COMMIT", feature=active_id, task=boundary_task, checkpoint=_checkpoint(execution["mode"]))
        if not current["boundary"]["evidence_current"]:
            return _decision(request, phase="blocked", decision="BLOCK", reason="MISSING_EVIDENCE", feature=active_id, task=boundary_task)
        if not current["boundary"]["review_current"]:
            return _decision(request, phase="blocked", decision="BLOCK", reason="MISSING_REVIEW", feature=active_id, task=boundary_task)
        return _decision(request, phase=current_phase, decision="COMMIT_REQUIRED", reason="CONTENT_READY", feature=active_id, task=boundary_task, checkpoint=_checkpoint(execution["mode"]), handoff=True)
    if current["boundary"]["content_committed"]:
        if execution["review"] == "human":
            return _decision(request, phase=current_phase, decision="STOP", reason="HUMAN_REVIEW", feature=active_id, task=boundary_task, checkpoint=_checkpoint(execution["mode"]))
        if not current["boundary"]["evidence_current"]:
            return _decision(request, phase="blocked", decision="BLOCK", reason="MISSING_EVIDENCE", feature=active_id, task=boundary_task)
        if not current["boundary"]["review_current"]:
            return _decision(request, phase="blocked", decision="BLOCK", reason="MISSING_REVIEW", feature=active_id, task=boundary_task)
        if current["external_gates"]:
            return _decision(request, phase=current_phase, decision="BLOCK" if current_phase == "required" else "DEFER", reason="EXTERNAL_AUTHORITY", feature=active_id, task=boundary_task)
    if boundary_task is not None and current["boundary"]["content_committed"] and execution["mode"] == "task":
        return _decision(request, phase=current_phase, decision="STOP", reason="TASK_BOUNDARY", feature=active_id, task=boundary_task, checkpoint=_checkpoint(execution["mode"]))
    if incomplete is not None:
        return _decision(request, phase=current_phase, decision="BUILD_TASK", reason="TASK_REMAINING", feature=active_id, task=incomplete, checkpoint=_checkpoint(execution["mode"]))
    if not current["boundary"]["content_committed"]:
        return _decision(request, phase=current_phase, decision="BLOCK", reason="MISSING_EVIDENCE", feature=active_id)
    return _after_feature(request, current, index, execution)
