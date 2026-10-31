"""Closed-schema helpers for paused work and queue revisions."""
from __future__ import annotations

import re
from typing import Any

FEATURE_ID = re.compile(r"^[A-Z][A-Z0-9]*-\d{3}$")
COMMIT = re.compile(r"^[0-9a-f]{40}$")
DIGEST = re.compile(r"^[0-9a-f]{64}$")
PAUSE_STATES = {"prepared", "paused", "resume_prepared", "restored", "archived"}


def pause_record_errors(value: Any) -> list[str]:
    required = {
        "schema", "state_domain", "pause_id", "feature_id", "state", "created_at", "branch",
        "base_head", "current_head", "task_directory", "task_ids",
        "next_action", "session_digest", "stash_commit", "stash_message", "had_worktree_changes", "reason", "paused_ledger_digest",
    }
    schema_two=required|{"local_ledger_digest"}
    if not isinstance(value, dict) or frozenset(value) not in {frozenset(required),frozenset(schema_two)}:
        return ["pause record must contain exactly the supported fields"]
    errors: list[str] = []
    if type(value.get("schema")) is not int or value["schema"] not in {1,2} or (value["schema"]==1 and set(value)!=required) or (value["schema"]==2 and set(value)!=schema_two):
        errors.append("pause record schema is invalid")
    if value.get("state_domain") not in {"application", "harness"}:
        errors.append("pause state domain is invalid")
    if not isinstance(value.get("pause_id"), str) or not re.fullmatch(r"pause-[0-9a-f]{16}", value["pause_id"]):
        errors.append("pause ID is invalid")
    if not isinstance(value.get("feature_id"), str) or not FEATURE_ID.fullmatch(value["feature_id"]):
        errors.append("pause feature ID is invalid")
    if value.get("state") not in PAUSE_STATES:
        errors.append("pause state is invalid")
    if not isinstance(value.get("created_at"), str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z", value["created_at"]):
        errors.append("pause timestamp is invalid")
    if not isinstance(value.get("branch"), str) or not value["branch"] or len(value["branch"]) > 512:
        errors.append("pause branch is invalid")
    for key in ("base_head", "current_head"):
        if not isinstance(value.get(key), str) or not COMMIT.fullmatch(value[key]):
            errors.append(f"pause {key} is invalid")
    if value.get("task_directory") is not None and not isinstance(value.get("task_directory"), str):
        errors.append("pause task directory is invalid")
    tasks = value.get("task_ids")
    if tasks is not None and (not isinstance(tasks, list) or not tasks or len(tasks) != len(set(tasks)) or any(not isinstance(task, str) or not re.fullmatch(r"T\d{3}", task) for task in tasks)):
        errors.append("pause task IDs are invalid")
    if not isinstance(value.get("next_action"), str) or not value["next_action"] or len(value["next_action"]) > 2000:
        errors.append("pause next action is invalid")
    if not isinstance(value.get("session_digest"), str) or not DIGEST.fullmatch(value["session_digest"]):
        errors.append("pause session digest is invalid")
    stash = value.get("stash_commit")
    if stash is not None and (not isinstance(stash, str) or not COMMIT.fullmatch(stash)):
        errors.append("pause stash commit is invalid")
    if not isinstance(value.get("stash_message"), str) or len(value["stash_message"]) > 160:
        errors.append("pause stash message is invalid")
    if type(value.get("had_worktree_changes")) is not bool:
        errors.append("pause worktree-change flag is invalid")
    if not isinstance(value.get("reason"), str) or not value["reason"] or len(value["reason"]) > 500:
        errors.append("pause reason is invalid")
    if value.get("paused_ledger_digest") is not None and (not isinstance(value.get("paused_ledger_digest"), str) or not DIGEST.fullmatch(value["paused_ledger_digest"])):
        errors.append("pause ledger digest is invalid")
    if value.get("schema")==2 and (not isinstance(value.get("local_ledger_digest"),str) or not DIGEST.fullmatch(value["local_ledger_digest"])):
        errors.append("pause local ledger digest is invalid")
    if errors:
        return errors
    if value["state"] == "paused" and value["had_worktree_changes"] and stash is None:
        return ["pause record has uncommitted work without a stash"]
    if value["state"] == "paused" and not value["had_worktree_changes"] and stash is not None:
        return ["pause record has an unexpected stash"]
    return []


def queue_revision_errors(value: Any, known_features: set[str]) -> list[str]:
    keys = {"schema", "revision", "predecessor_digest", "feature_order", "suspended", "rationale", "created_at"}
    if not isinstance(value, dict) or set(value) != keys:
        return ["queue revision has an invalid schema"]
    if type(value.get("schema")) is not int or value["schema"] != 1:
        return ["queue revision schema is invalid"]
    if not isinstance(value.get("revision"), int) or isinstance(value.get("revision"), bool) or value["revision"] < 1:
        return ["queue revision number is invalid"]
    predecessor = value.get("predecessor_digest")
    if predecessor is not None and (not isinstance(predecessor, str) or not DIGEST.fullmatch(predecessor)):
        return ["queue predecessor digest is invalid"]
    order = value.get("feature_order")
    if not isinstance(order, list) or len(order) != len(set(order)) or any(not isinstance(item, str) or item not in known_features for item in order):
        return ["queue feature order is invalid"]
    suspended = value.get("suspended")
    if not isinstance(suspended, list) or len(suspended) != len(set(suspended)) or any(item not in order for item in suspended):
        return ["queue suspended list is invalid"]
    if not isinstance(value.get("rationale"), str) or not value["rationale"] or len(value["rationale"]) > 500:
        return ["queue rationale is invalid"]
    if not isinstance(value.get("created_at"), str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z", value["created_at"]):
        return ["queue timestamp is invalid"]
    return []


def reorder_document(document: dict[str, Any], feature_id: str, priority: int) -> dict[str, Any]:
    """Return a detached ledger with one non-active feature reprioritized."""
    if type(priority) is not int or not 1 <= priority <= 999:
        raise ValueError("priority must be an integer from 1 through 999")
    features = document.get("features")
    target = next((item for item in features if item.get("id") == feature_id), None) if isinstance(features, list) else None
    if target is None:
        raise ValueError("unknown feature")
    if target.get("status") in {"in_progress", "passing", "superseded"}:
        raise ValueError("only queued, paused, or suspended features can be reprioritized")
    result = {**document, "features": [dict(item) for item in features]}
    selected = next(item for item in result["features"] if item["id"] == feature_id)
    selected["priority"] = priority
    return result
