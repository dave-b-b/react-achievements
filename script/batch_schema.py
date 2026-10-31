"""Pure closed-record helpers for the queued HARNESS-011 batch protocol.

This module deliberately performs no filesystem, Git, process, controller, or
authority operation. Runtime callers must independently establish that the facts
supplied as trusted context are current and authoritative. Execution-policy
validation requires the caller's trusted public-text predicate; later consumers
must bind the established harness privacy predicate and feature data cannot
select, disable, or replace it.
"""
from __future__ import annotations

import datetime as dt
import hashlib
import json
import math
import re
import unicodedata
from typing import Any


MAX_RECORD_BYTES = 1_000_000
MAX_MEMBERS = 64
IDENTIFIER = re.compile(r"[a-z][a-z0-9-]{0,63}")
FEATURE_ID = re.compile(r"[A-Z][A-Z0-9]*-[0-9]{3}")
DIGEST = re.compile(r"[0-9a-f]{64}")
COMMIT = re.compile(r"[0-9a-f]{40}")
TIMESTAMP = re.compile(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z")
CLASSIFICATION_KEYS = {"work_kind", "risk", "security_sensitive"}
REQUEST_KEYS = {
    "schema", "request_id", "membership", "strategy", "max_workers",
    "base_commit", "requirements", "dependencies", "classifications", "created_at", "state",
}
REQUEST_STATES = {"active", "terminal_pending", "blocked", "exhausted"}
STRATEGIES = {"parallel", "serial", "single"}
BATCH_KEYS = {
    "schema", "batch_id", "request_id", "request_digest", "policy_digest",
    "controller_digest", "base_commit", "base_branch", "integration", "workers",
    "operation", "sequence",
}
BATCH_CONTEXT_KEYS = {
    "request_id", "request_digest", "policy_digest", "controller_digest",
    "base_commit", "base_branch", "work_members",
}
INTEGRATION_KEYS = {"branch", "worktree_token", "head", "state", "prefix_evidence_ref", "evidence_ref"}
WORKER_KEYS = {
    "feature_id", "worker_id", "branch", "worktree_token", "task_scope_digest",
    "start_commit", "initial_requirement_digest", "classification", "state", "dependency_prefix_head",
    "dependency_prefix_digest", "controller_run_id", "candidate_commit", "builder_binding_ref", "builder_model_digest", "review_runs",
    "blocked_reason",
}
OPERATION_KEYS = {
    "operation_id", "kind", "sequence", "state", "expected_before",
    "expected_after", "started_at", "completed_at",
}
OPERATION_IDENTITY_KEYS = {"head", "state_digest", "owned_refs", "worktree_tokens"}
OWNED_REF_KEYS = {"branch", "commit"}
REQUEST_BINDING_KEYS = {"request_id", "request_digest"}
BATCH_BINDING_KEYS = {"batch_id", "request_digest", "worktree_token", "role", "feature_id"}
SESSION_LEGACY_KEYS = {
    "schema", "mode", "started_at", "base_head", "base_branch", "work_item",
    "profiles", "baseline", "receipt_key",
}
SESSION_V2_KEYS = SESSION_LEGACY_KEYS | {"receipt_namespace"}
SESSION_V3_KEYS = SESSION_V2_KEYS | {"execution_mode", "feature_limit", "completed_features"}
SESSION_V4_KEYS = SESSION_V3_KEYS | {"follow_on"}
SESSION_V5_KEYS = SESSION_V4_KEYS | {"task_directory", "task_ids"}
SESSION_V6_KEYS = SESSION_V5_KEYS | {"request_binding", "batch_binding"}
FEATURE_DOCUMENT_V1_KEYS = {"schema", "project", "last_updated", "rules", "status_legend", "features"}
FEATURE_DOCUMENT_V2_KEYS = FEATURE_DOCUMENT_V1_KEYS | {"batch_lineage"}
LINEAGE_KEYS = {"schema", "batch_id", "request_id", "request_digest", "base_commit", "role", "feature_id"}
LINEAGE_CONTEXT_KEYS = {"expected_lineage", "feature_facts"}
FEATURE_FACT_KEYS = {"id", "status"}
PROJECT_BASE_KEYS = {
    "schema", "name", "slug", "source", "commands", "classification",
    "profiles", "external_gates", "timeout_seconds", "identity_terms",
    "run_meta_tests",
}
CONTROLLER_KEYS = {"adapter", "enabled", "command", "protocol", "max_workers"}
WORKER_STATES = {
    "pending", "running", "awaiting_review", "ready_for_integration", "integrated",
    "blocked", "quarantined", "abandoned",
}
INTEGRATION_STATES = {
    "pending", "created", "integrating", "conflicted", "verification_failed",
    "verified_prefix", "verified_final", "terminal_pending", "certified", "blocked",
}
OPERATION_STATES = {"prepared", "applied", "reconciled", "blocked"}
OPERATION_KINDS = {
    "create", "initialize_worker", "launch", "candidate", "review", "integrate",
    "unlock", "resolve_gate", "mark_passing", "reopen", "certify", "quarantine",
    "abandon",
}
BLOCKED_REASONS = {
    "dependency_unmet", "capability_unavailable", "scope_changed", "identity_mismatch",
    "unknown_ownership", "cancelled", "check_failed", "review_failed", "merge_conflict",
    "invalid_context", "terminal_failed",
}
FEATURE_STATUSES = {"not_started", "in_progress", "blocked", "passing", "superseded"}
CANDIDATE_KEYS = {
    "schema", "request_digest", "feature_id", "worker_id", "start_commit",
    "candidate_commit", "initial_requirement_digest", "effective_requirement_digest",
    "task_scope_digest", "profile_digest", "check_refs", "review_refs",
}
CANDIDATE_CONTEXT_KEYS = {
    "request_digest", "feature_id", "worker_id", "start_commit", "candidate_commit",
    "initial_requirement_digest", "effective_requirement_digest", "task_scope_digest",
    "profile_digest", "expected_profile_receipts", "expected_review_refs",
}
PROFILE_RECEIPT_KEYS = {"profile", "receipt_digest"}
REVIEW_RUN_KEYS = {
    "schema", "request_digest", "subject", "covered_members", "feature_id",
    "source_commit", "initial_requirement_digest", "effective_requirement_digest",
    "requirements_digest", "commands_digest", "policy_digest", "controller_digest",
    "coordinator_digest", "authority_context_digest", "stage", "model_role",
    "reviewer_identity_digest", "lease_operation_id", "previous_stage_digest",
    "result_digest", "started_at", "finished_at", "auth_origin", "outcome",
    "resolved_model_digest", "verifier_digest",
}
REVIEW_CONTEXT_KEYS = {
    "request_digest", "subject", "covered_members", "feature_id", "source_commit",
    "initial_requirement_digest", "effective_requirement_digest", "requirements_digest",
    "commands_digest", "policy_digest", "controller_digest", "coordinator_digest",
    "authority_context_digest", "verifier_digest", "builder_model_digests", "expected_pipeline",
}
REVIEW_PIPELINE_KEYS = {
    "model_role", "reviewer_identity_digest", "lease_operation_id", "started_at",
    "finished_at", "outcome", "resolved_model_digest",
}
REVIEW_SUBJECTS = {"candidate", "prerequisite", "integration", "terminal"}
REVIEW_OUTCOMES = {"pass", "fail"}
REVIEW_ROLE = re.compile(r"[a-z][a-z0-9_]{0,63}")
GATE_TRANSITION_KEYS = {
    "schema", "feature_id", "previous_requirement_digest", "next_requirement_digest",
    "removed_gate", "authority_reference_digest", "recorded_at", "transition_digest",
    "request_digest", "initial_requirement_digest", "source_commit", "resulting_commit",
    "previous_transition_digest",
}
GATE_CONTEXT_KEYS = {
    "request_digest", "feature_id", "initial_requirement_digest",
    "effective_requirement_digest", "initial_source_commit", "initial_gates",
    "effective_gates", "expected_transitions",
}
GATE_EXPECTED_KEYS = {
    "removed_gate", "authority_reference_digest", "next_requirement_digest",
    "recorded_at", "resulting_commit",
}
INTEGRITY_WRAPPER_KEYS = {"schema", "record_type", "payload", "signature"}
INTEGRITY_WRAPPER_CONTEXT_KEYS = {"record_type", "payload_context"}
IMPLEMENTED_RECORD_TYPES = {"candidate", "review", "gate_transition", "integration", "terminal"}
MAX_REFERENCES = 1024


def _reject_constant(_: str) -> Any:
    raise ValueError("non-finite JSON value")


def _unique_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("duplicate JSON object key")
        result[key] = value
    return result


def parse_json_bytes(data: bytes, *, maximum_bytes: int = MAX_RECORD_BYTES) -> Any:
    """Parse bounded UTF-8 JSON while refusing duplicate keys and non-finites."""
    if isinstance(maximum_bytes, bool) or not isinstance(maximum_bytes, int) or not 1 <= maximum_bytes <= MAX_RECORD_BYTES:
        raise ValueError("JSON maximum size is invalid")
    if not isinstance(data, bytes) or not data or len(data) > maximum_bytes:
        raise ValueError("JSON input is missing or oversized")
    try:
        result = json.loads(
            data.decode("utf-8"), object_pairs_hook=_unique_object,
            parse_constant=_reject_constant,
        )
        _json_value(result)
        return result
    except (UnicodeDecodeError, json.JSONDecodeError, RecursionError, ValueError) as exc:
        raise ValueError("invalid JSON input") from exc


def _json_value(value: Any) -> None:
    if value is None or isinstance(value, bool) or isinstance(value, str):
        return
    if isinstance(value, int):
        return
    if isinstance(value, float):
        if math.isfinite(value):
            return
        raise ValueError("non-finite JSON value")
    if isinstance(value, list):
        for item in value:
            _json_value(item)
        return
    if isinstance(value, dict):
        if any(not isinstance(key, str) for key in value):
            raise ValueError("JSON object keys must be strings")
        for item in value.values():
            _json_value(item)
        return
    raise ValueError("value is not canonical JSON data")


def canonical_json_bytes(value: Any) -> bytes:
    """Return the exact closed-record JSON representation used for digests."""
    try:
        _json_value(value)
        return json.dumps(
            value, sort_keys=True, separators=(",", ":"), ensure_ascii=True,
            allow_nan=False,
        ).encode("utf-8")
    except (TypeError, ValueError, RecursionError) as exc:
        raise ValueError("value is not canonical JSON data") from exc


def canonical_digest(value: Any) -> str:
    return hashlib.sha256(canonical_json_bytes(value)).hexdigest()


def _integer(value: Any, *, minimum: int, maximum: int) -> bool:
    return not isinstance(value, bool) and isinstance(value, int) and minimum <= value <= maximum


def _nonnegative_integer(value: Any) -> bool:
    return not isinstance(value, bool) and isinstance(value, int) and value >= 0


def _enum(value: Any, allowed: set[str]) -> bool:
    """Reject malformed enum values before set membership can raise TypeError."""
    return isinstance(value, str) and value in allowed


def _nullable_enum(value: Any, allowed: set[str]) -> bool:
    return value is None or _enum(value, allowed)


def _structurally_safe_text(value: Any, *, maximum: int) -> bool:
    return (
        isinstance(value, str) and bool(value.strip()) and len(value) <= maximum
        and all(unicodedata.category(character) != "Cc" and character not in {"\u2028", "\u2029"} for character in value)
    )


def _id(value: Any) -> bool:
    return isinstance(value, str) and bool(IDENTIFIER.fullmatch(value))


def _feature_id(value: Any) -> bool:
    return isinstance(value, str) and bool(FEATURE_ID.fullmatch(value))


def _digest(value: Any) -> bool:
    return isinstance(value, str) and bool(DIGEST.fullmatch(value))


def _commit(value: Any) -> bool:
    return isinstance(value, str) and bool(COMMIT.fullmatch(value))


def _timestamp(value: Any) -> bool:
    if not isinstance(value, str) or not TIMESTAMP.fullmatch(value):
        return False
    try:
        dt.datetime.strptime(value, "%Y-%m-%dT%H:%M:%S.%fZ")
    except ValueError:
        return False
    return True


def _run_id(value: Any) -> bool:
    """Accept opaque controller identifiers, including digit-leading UUIDs."""
    return isinstance(value, str) and re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._:-]{0,127}", value) is not None


def _nullable(value: Any, predicate: Any) -> bool:
    return value is None or predicate(value)


def _base_branch(value: Any) -> bool:
    """Validate only the documented structural local-ref boundary.

    Git ref grammar, existence, protection, and identity belong to a later
    runtime caller with an independently established trusted context.
    """
    if not isinstance(value, str) or not value.startswith("refs/heads/") or len(value) == len("refs/heads/"):
        return False
    try:
        if len(value.encode("utf-8")) > 1024:
            return False
    except UnicodeEncodeError:
        return False
    return all(
        unicodedata.category(character) != "Cc" and character not in {"\u2028", "\u2029"}
        for character in value
    )


def _feature_map(value: Any, *, digests: bool) -> bool:
    if not isinstance(value, dict) or not value:
        return False
    if not all(_feature_id(key) for key in value):
        return False
    if digests:
        return all(_digest(item) for item in value.values())
    for item in value.values():
        if not isinstance(item, list) or not all(_feature_id(dependency) for dependency in item):
            return False
        if len(item) != len(set(item)):
            return False
    return True


def _classification(value: Any) -> bool:
    return (
        isinstance(value, dict)
        and set(value) == CLASSIFICATION_KEYS
        and _enum(value.get("work_kind"), {"code", "content"})
        and _enum(value.get("risk"), {"low", "standard", "high"})
        and type(value.get("security_sensitive")) is bool
        and (not value["security_sensitive"] or value["work_kind"] == "code")
    )


def _classification_map(value: Any) -> bool:
    return isinstance(value, dict) and bool(value) and all(_feature_id(feature) and _classification(classification) for feature, classification in value.items())


def _request_shape_errors(value: Any) -> list[str]:
    errors: list[str] = []
    if not isinstance(value, dict) or set(value) != REQUEST_KEYS:
        return ["request must contain exactly the schema-2 fields"]
    if not _integer(value.get("schema"), minimum=2, maximum=2):
        errors.append("request schema must be integer 2")
    if not _id(value.get("request_id")):
        errors.append("request_id is invalid")
    membership = value.get("membership")
    if not isinstance(membership, list) or not 1 <= len(membership) <= MAX_MEMBERS or not all(_feature_id(item) for item in membership) or len(membership) != len(set(membership)):
        errors.append("request membership is invalid")
        membership = []
    strategy = value.get("strategy")
    if not _enum(strategy, STRATEGIES):
        errors.append("request strategy is invalid")
    elif len(membership) == 1 and strategy != "single":
        errors.append("single-member request requires single strategy")
    elif len(membership) > 1 and strategy == "single":
        errors.append("multi-member request cannot use single strategy")
    if not _integer(value.get("max_workers"), minimum=1, maximum=MAX_MEMBERS):
        errors.append("request max_workers is invalid")
    if not _commit(value.get("base_commit")):
        errors.append("request base_commit is invalid")
    requirements = value.get("requirements")
    dependencies = value.get("dependencies")
    classifications = value.get("classifications")
    if not _feature_map(requirements, digests=True) or set(requirements) != set(membership):
        errors.append("request requirements must exactly match membership")
    if not _feature_map(dependencies, digests=False) or set(dependencies) != set(membership):
        errors.append("request dependencies must exactly match membership")
    if not _classification_map(classifications) or set(classifications) != set(membership):
        errors.append("request classifications must exactly match membership")
    if not _timestamp(value.get("created_at")):
        errors.append("request created_at is invalid")
    if not _enum(value.get("state"), REQUEST_STATES):
        errors.append("request state is invalid")
    return errors


def _trusted_context_errors(value: Any) -> list[str]:
    keys = {"requirements", "dependencies", "classifications", "passing_features", "max_features", "max_workers"}
    if not isinstance(value, dict) or set(value) != keys:
        return ["trusted request context must contain exactly known facts"]
    if not _feature_map(value.get("requirements"), digests=True):
        return ["trusted request context requirements are invalid"]
    if not _feature_map(value.get("dependencies"), digests=False) or set(value["dependencies"]) != set(value["requirements"]):
        return ["trusted request context dependencies are invalid"]
    if any(dependency not in value["requirements"] for items in value["dependencies"].values() for dependency in items):
        return ["trusted request context dependencies are invalid"]
    if not _classification_map(value.get("classifications")) or not set(value["classifications"]) <= set(value["requirements"]):
        return ["trusted request context classifications are invalid"]
    passing = value.get("passing_features")
    if not isinstance(passing, (set, frozenset)) or not all(_feature_id(item) for item in passing) or not set(passing) <= set(value["requirements"]):
        return ["trusted request context passing feature facts are invalid"]
    if not _integer(value.get("max_features"), minimum=1, maximum=MAX_MEMBERS) or not _integer(value.get("max_workers"), minimum=1, maximum=MAX_MEMBERS):
        return ["trusted request context limits are invalid"]
    return []


def _has_cycle(membership: list[str], dependencies: dict[str, list[str]]) -> bool:
    """Check the reachable dependency graph without consuming Python recursion."""
    state: dict[str, int] = {}
    for start in membership:
        if state.get(start, 0) == 2:
            continue
        state[start] = 1
        stack = [(start, iter(dependencies[start]))]
        while stack:
            feature, children = stack[-1]
            try:
                dependency = next(children)
            except StopIteration:
                state[feature] = 2
                stack.pop()
                continue
            if dependency not in dependencies:
                continue
            dependency_state = state.get(dependency, 0)
            if dependency_state == 1:
                return True
            if dependency_state == 0:
                state[dependency] = 1
                stack.append((dependency, iter(dependencies[dependency])))
    return False


def request_errors(value: Any, *, trusted_context: Any) -> list[str]:
    """Validate a request shape against facts already verified by a caller.

    Passing this function cannot establish that the context facts, a review, or
    completion evidence are authoritative; later runtime code owns those checks.
    """
    errors = _request_shape_errors(value)
    context_errors = _trusted_context_errors(trusted_context)
    if context_errors:
        return errors + context_errors
    if errors:
        return errors
    assert isinstance(value, dict) and isinstance(trusted_context, dict)
    membership = value["membership"]
    requirements = trusted_context["requirements"]
    dependencies = trusted_context["dependencies"]
    if not set(membership) <= set(requirements):
        errors.append("request membership contains an unknown feature")
    if len(membership) > trusted_context["max_features"]:
        errors.append("request membership exceeds trusted policy limit")
    if value["max_workers"] > trusted_context["max_workers"]:
        errors.append("request max_workers exceeds trusted policy limit")
    for feature in membership:
        if feature not in requirements:
            continue
        if value["requirements"][feature] != requirements[feature]:
            errors.append("request requirement digest differs from trusted facts")
        if value["dependencies"][feature] != dependencies[feature]:
            errors.append("request dependencies differ from trusted facts")
        if value["classifications"][feature] != trusted_context["classifications"].get(feature):
            errors.append("request classification differs from trusted facts")
        for dependency in dependencies[feature]:
            if dependency not in requirements:
                errors.append("trusted dependency references an unknown feature")
            elif dependency not in membership and dependency not in trusted_context["passing_features"]:
                errors.append("request has an unmet unrequested dependency")
    if not errors and _has_cycle(membership, dependencies):
        errors.append("request dependencies contain a cycle")
    return sorted(set(errors))


def request_digest(value: Any) -> str:
    errors = _request_shape_errors(value)
    if errors:
        raise ValueError("; ".join(errors))
    assert isinstance(value, dict)
    return canonical_digest({key: item for key, item in value.items() if key != "state"})


def _public_text_is_safe(predicate: Any, value: Any) -> bool:
    if not callable(predicate) or not _structurally_safe_text(value, maximum=500):
        return False
    try:
        return predicate(value, limit=500) is True
    except Exception:
        return False


def execution_policy_v2_errors(value: Any, *, public_text_predicate: Any = None) -> list[str]:
    keys = {"schema", "default_mode", "default_strategy", "default_max_workers", "modes", "rules"}
    if not isinstance(value, dict) or set(value) != keys:
        return ["execution policy schema 2 must contain exactly the allowed keys"]
    errors: list[str] = []
    if not _integer(value.get("schema"), minimum=2, maximum=2):
        errors.append("execution policy schema must be integer 2")
    if value.get("default_mode") != "request" or value.get("default_strategy") != "parallel" or not _integer(value.get("default_max_workers"), minimum=4, maximum=4):
        errors.append("execution policy defaults are invalid")
    if not callable(public_text_predicate):
        errors.append("execution policy public text predicate is unavailable")
    expected_modes = {"task", "feature", "request", "features"}
    modes = value.get("modes")
    if not isinstance(modes, dict) or set(modes) != expected_modes:
        errors.append("execution policy modes are invalid")
    else:
        for name, mode in modes.items():
            if not isinstance(mode, dict) or set(mode) != {"stop_at", "max_features", "requires_limit", "description"}:
                errors.append(f"execution policy mode {name} is invalid")
                continue
            expected_maximum = 1 if name in {"task", "feature"} else None
            expected_limit = name == "features"
            maximum = mode.get("max_features")
            valid_maximum = maximum is None if expected_maximum is None else _integer(maximum, minimum=expected_maximum, maximum=expected_maximum)
            if mode.get("stop_at") != name or not valid_maximum or mode.get("requires_limit") is not expected_limit or not _public_text_is_safe(public_text_predicate, mode.get("description")):
                errors.append(f"execution policy mode {name} is invalid")
    required_rules = {
        "checkpoint_is_read_only", "require_finite_feature_limit",
        "preserve_commit_bound_evidence", "never_create_duplicate_active_feature",
        "explicit_single_scope_overrides_default",
        "explicit_continuation_requires_no_confirmation",
        "parallel_features_require_isolated_worktrees",
        "integration_requires_fresh_verification",
        "main_merge_requires_explicit_authority", "exact_request_membership",
        "idle_without_backlog_activation",
    }
    if not isinstance(value.get("rules"), dict) or set(value["rules"]) != required_rules or any(item is not True for item in value["rules"].values()):
        errors.append("execution policy schema-2 rules are invalid")
    return sorted(set(errors))


def batch_policy_v2_errors(value: Any) -> list[str]:
    keys = {"schema", "integration_branch_prefix", "feature_branch_pattern", "merge_strategy", "max_features", "rules"}
    if not isinstance(value, dict) or set(value) != keys:
        return ["batch policy schema 2 must contain exactly the allowed keys"]
    errors: list[str] = []
    if not _integer(value.get("schema"), minimum=2, maximum=2):
        errors.append("batch policy schema must be integer 2")
    if value.get("integration_branch_prefix") != "codex/batch/" or value.get("feature_branch_pattern") != "codex/batch/{batch}--{feature}" or value.get("merge_strategy") != "no-ff":
        errors.append("batch policy branch settings are invalid")
    if not _integer(value.get("max_features"), minimum=2, maximum=MAX_MEMBERS):
        errors.append("batch policy max_features is invalid")
    required_rules = {
        "base_branch_is_protected", "feature_worktrees_are_isolated",
        "integration_requires_fresh_verification", "main_merge_requires_explicit_authority",
        "pinned_reviewed_candidates", "fail_closed_context", "atomic_completion",
        "terminal_certification_required",
    }
    if not isinstance(value.get("rules"), dict) or set(value["rules"]) != required_rules or any(item is not True for item in value["rules"].values()):
        errors.append("batch policy schema-2 rules are invalid")
    return sorted(set(errors))


def _batch_context_errors(value: Any) -> list[str]:
    if not isinstance(value, dict) or set(value) != BATCH_CONTEXT_KEYS:
        return ["trusted batch context must contain exactly known facts"]
    if not _id(value.get("request_id")) or not all(_digest(value.get(key)) for key in ("request_digest", "policy_digest", "controller_digest")) or not _commit(value.get("base_commit")) or not _base_branch(value.get("base_branch")):
        return ["trusted batch context bindings are invalid"]
    members = value.get("work_members")
    if not isinstance(members, list) or not 1 <= len(members) <= MAX_MEMBERS or not all(_feature_id(member) for member in members) or len(members) != len(set(members)):
        return ["trusted batch context members are invalid"]
    return []


def _integration_errors(value: Any, *, expected_branch: str) -> list[str]:
    if not isinstance(value, dict) or set(value) != INTEGRATION_KEYS:
        return ["batch integration identity is invalid"]
    if value.get("branch") != expected_branch or not _id(value.get("worktree_token")) or not _nullable(value.get("head"), _commit) or not _enum(value.get("state"), INTEGRATION_STATES) or not _nullable(value.get("prefix_evidence_ref"), _digest) or not _nullable(value.get("evidence_ref"), _digest):
        return ["batch integration identity is invalid"]
    state=value["state"]
    if state=="verified_prefix" and (not _digest(value.get("prefix_evidence_ref")) or value.get("evidence_ref") is not None):
        return ["batch integration prefix evidence is invalid"]
    if state in {"verified_final","certified"} and (not _digest(value.get("prefix_evidence_ref")) or not _digest(value.get("evidence_ref"))):
        return ["batch integration final evidence is invalid"]
    return []


def _worker_errors(value: Any, *, batch_id: str, feature_id: str) -> list[str]:
    if not isinstance(value, dict) or set(value) != WORKER_KEYS:
        return ["batch worker record is invalid"]
    if value.get("feature_id") != feature_id or not _id(value.get("worker_id")) or value.get("branch") != f"codex/batch/{batch_id}--{feature_id}" or not _id(value.get("worktree_token")):
        return ["batch worker identity is invalid"]
    if not _digest(value.get("task_scope_digest")) or not _digest(value.get("initial_requirement_digest")) or not _classification(value.get("classification")) or not _nullable(value.get("start_commit"), _commit) or not _enum(value.get("state"), WORKER_STATES) or not _nullable(value.get("controller_run_id"), _run_id) or not _nullable(value.get("candidate_commit"), _commit) or not _nullable(value.get("builder_binding_ref"), _digest) or not _nullable(value.get("builder_model_digest"), _digest):
        return ["batch worker fields are invalid"]
    if value.get("state") in {"ready_for_integration","integrated"} and (not _digest(value.get("builder_binding_ref")) or not _digest(value.get("builder_model_digest"))):
        return ["batch worker builder identity is invalid"]
    prefix_head = value.get("dependency_prefix_head")
    prefix_digest = value.get("dependency_prefix_digest")
    if (prefix_head is None) != (prefix_digest is None) or (prefix_head is not None and (not _commit(prefix_head) or not _digest(prefix_digest))):
        return ["batch worker dependency prefix is invalid"]
    reviews = value.get("review_runs")
    if not isinstance(reviews, list) or not all(_digest(review) for review in reviews) or len(reviews) != len(set(reviews)):
        return ["batch worker review references are invalid"]
    reason = value.get("blocked_reason")
    if not _nullable_enum(reason, BLOCKED_REASONS):
        return ["batch worker blocked reason is invalid"]
    return []


def _operation_identity_errors(value: Any, *, branches: set[str], worktree_tokens: set[str]) -> list[str]:
    if not isinstance(value, dict) or set(value) != OPERATION_IDENTITY_KEYS:
        return ["batch operation identity is invalid"]
    if not _nullable(value.get("head"), _commit) or not _nullable(value.get("state_digest"), _digest):
        return ["batch operation identity is invalid"]
    refs = value.get("owned_refs")
    if not isinstance(refs, list):
        return ["batch operation identity is invalid"]
    seen_branches: set[str] = set()
    for reference in refs:
        if not isinstance(reference, dict) or set(reference) != OWNED_REF_KEYS:
            return ["batch operation identity is invalid"]
        branch = reference.get("branch")
        if not isinstance(branch, str) or branch not in branches or branch in seen_branches or not _nullable(reference.get("commit"), _commit):
            return ["batch operation identity is invalid"]
        seen_branches.add(branch)
    tokens = value.get("worktree_tokens")
    if not isinstance(tokens, list) or not all(isinstance(token, str) and token in worktree_tokens for token in tokens) or len(tokens) != len(set(tokens)):
        return ["batch operation identity is invalid"]
    return []


def _operation_errors(value: Any, *, branches: set[str], worktree_tokens: set[str]) -> list[str]:
    if not isinstance(value, dict) or set(value) != OPERATION_KEYS:
        return ["batch operation is invalid"]
    if not _id(value.get("operation_id")) or not _enum(value.get("kind"), OPERATION_KINDS) or not _nonnegative_integer(value.get("sequence")) or not _enum(value.get("state"), OPERATION_STATES):
        return ["batch operation is invalid"]
    if _operation_identity_errors(value.get("expected_before"), branches=branches, worktree_tokens=worktree_tokens) or _operation_identity_errors(value.get("expected_after"), branches=branches, worktree_tokens=worktree_tokens):
        return ["batch operation identity is invalid"]
    if not _timestamp(value.get("started_at")) or not _nullable(value.get("completed_at"), _timestamp):
        return ["batch operation timestamps are invalid"]
    if value["completed_at"] is not None and value["completed_at"] < value["started_at"]:
        return ["batch operation timestamps are invalid"]
    return []


def batch_manifest_v2_errors(value: Any, *, trusted_context: Any) -> list[str]:
    """Validate static schema-2 batch structure against caller-owned facts.

    This pure helper neither proves the facts authoritative nor establishes
    lifecycle legality, selected-review-pipeline cardinality, sequence
    monotonicity, ownership, Git ref validity, or readiness. Bounded private
    readers enforce record byte limits before parsing; later consumers enforce
    those runtime conditions before any mutation.
    """
    context_errors = _batch_context_errors(trusted_context)
    if not isinstance(value, dict) or set(value) != BATCH_KEYS:
        return ["batch manifest must contain exactly the schema-2 fields"] + context_errors
    errors: list[str] = []
    if not _integer(value.get("schema"), minimum=2, maximum=2) or not _id(value.get("batch_id")):
        errors.append("batch manifest identity is invalid")
    if not _nonnegative_integer(value.get("sequence")):
        errors.append("batch manifest sequence is invalid")
    if context_errors:
        return sorted(set(errors + context_errors))
    assert isinstance(trusted_context, dict)
    for field in ("request_id", "request_digest", "policy_digest", "controller_digest", "base_commit", "base_branch"):
        if value.get(field) != trusted_context[field]:
            errors.append("batch manifest differs from trusted context")
            break
    batch_id = value.get("batch_id")
    if not isinstance(batch_id, str):
        return sorted(set(errors + ["batch manifest identity is invalid"]))
    integration = value.get("integration")
    integration_branch = f"codex/batch/{batch_id}"
    errors.extend(_integration_errors(integration, expected_branch=integration_branch))
    workers = value.get("workers")
    members = trusted_context["work_members"]
    if not isinstance(workers, list) or len(workers) != len(members):
        errors.append("batch workers must exactly match trusted members")
        workers = []
    worker_branches = {f"codex/batch/{batch_id}--{member}" for member in members}
    branches = {integration_branch, *worker_branches}
    worker_ids: set[str] = set()
    worker_tokens: set[str] = set()
    for index, worker in enumerate(workers):
        feature = members[index]
        errors.extend(_worker_errors(worker, batch_id=batch_id, feature_id=feature))
        if not isinstance(worker, dict):
            continue
        worker_id = worker.get("worker_id")
        token = worker.get("worktree_token")
        branch = worker.get("branch")
        if not isinstance(worker_id, str) or worker_id in worker_ids:
            errors.append("batch worker identifiers must be unique")
        else:
            worker_ids.add(worker_id)
        if not isinstance(token, str) or token in worker_tokens:
            errors.append("batch worker tokens must be unique")
        else:
            worker_tokens.add(token)
        if not isinstance(branch, str) or branch not in worker_branches:
            errors.append("batch worker branches are invalid")
    if isinstance(integration, dict):
        integration_token = integration.get("worktree_token")
        if not isinstance(integration_token, str) or integration_token in worker_tokens:
            errors.append("batch worktree tokens must be distinct")
        else:
            worker_tokens.add(integration_token)
    operation = value.get("operation")
    if operation is not None:
        errors.extend(_operation_errors(operation, branches=branches, worktree_tokens=worker_tokens))
    return sorted(set(errors))


def session_request_binding_errors(value: Any) -> list[str]:
    """Validate the nullable structural request binding, not request authority."""
    if value is None:
        return []
    if not isinstance(value, dict) or set(value) != REQUEST_BINDING_KEYS or not _id(value.get("request_id")) or not _digest(value.get("request_digest")):
        return ["session request binding is invalid"]
    return []


def session_batch_binding_errors(value: Any, *, request_binding: Any) -> list[str]:
    """Validate a nullable binding link without asserting live batch ownership."""
    request_errors = session_request_binding_errors(request_binding)
    if value is None:
        return []
    if request_errors or request_binding is None:
        return ["session batch binding requires a valid request binding"]
    if not isinstance(value, dict) or set(value) != BATCH_BINDING_KEYS:
        return ["session batch binding is invalid"]
    if not _id(value.get("batch_id")) or not _digest(value.get("request_digest")) or not _id(value.get("worktree_token")):
        return ["session batch binding is invalid"]
    role = value.get("role")
    feature = value.get("feature_id")
    if role == "worker":
        valid_role = _feature_id(feature)
    elif role == "integration":
        valid_role = feature is None
    else:
        valid_role = False
    if not valid_role or value["request_digest"] != request_binding["request_digest"]:
        return ["session batch binding is invalid"]
    return []


def normalize_session_v6_envelope(value: Any) -> dict[str, Any]:
    """Read-only-normalize only accepted legacy session envelopes to schema 6.

    This does not validate existing scalar, baseline, receipt, queue, or task
    values, and cannot establish request or batch authority. The canonical
    caller composes those unchanged checks before a consumer may use the result.
    """
    if not isinstance(value, dict):
        raise ValueError("session envelope is invalid")
    keys = set(value)
    schema = value.get("schema")
    if _integer(schema, minimum=1, maximum=1) and keys == SESSION_LEGACY_KEYS:
        normalized = dict(value, receipt_namespace="receipts", execution_mode="feature", feature_limit=1, completed_features=0, follow_on=[], task_directory=None, task_ids=None)
    elif _integer(schema, minimum=2, maximum=2) and keys == SESSION_V2_KEYS:
        normalized = dict(value, execution_mode="feature", feature_limit=1, completed_features=0, follow_on=[], task_directory=None, task_ids=None)
    elif _integer(schema, minimum=3, maximum=3) and keys == SESSION_V3_KEYS:
        normalized = dict(value, follow_on=[], task_directory=None, task_ids=None)
    elif _integer(schema, minimum=4, maximum=4) and keys == SESSION_V4_KEYS:
        normalized = dict(value, task_directory=None, task_ids=None)
    elif _integer(schema, minimum=5, maximum=5) and keys == SESSION_V3_KEYS:
        normalized = dict(value, follow_on=[], task_directory=None, task_ids=None)
    elif _integer(schema, minimum=5, maximum=5) and keys == SESSION_V5_KEYS:
        normalized = dict(value)
    elif _integer(schema, minimum=6, maximum=6) and keys == SESSION_V6_KEYS:
        return dict(value)
    else:
        raise ValueError("session envelope is invalid")
    normalized["schema"] = 6
    normalized["request_binding"] = None
    normalized["batch_binding"] = None
    return normalized


def session_v6_envelope_errors(
    value: Any, *, expected_request_binding: Any, expected_batch_binding: Any,
) -> list[str]:
    """Validate only schema-6 binding equality and documented work-item relation.

    Expected bindings are caller-owned facts already resolved from private scope
    and ownership state. Equality here is structural, not proof of authority or
    a substitute for the canonical session validation and runtime checks.
    """
    try:
        normalized = normalize_session_v6_envelope(value)
    except ValueError:
        return ["session envelope is invalid"]
    errors = session_request_binding_errors(expected_request_binding)
    errors.extend(session_batch_binding_errors(expected_batch_binding, request_binding=expected_request_binding))
    if errors:
        return ["expected session bindings are invalid"]
    request_binding = normalized["request_binding"]
    batch_binding = normalized["batch_binding"]
    errors = session_request_binding_errors(request_binding)
    errors.extend(session_batch_binding_errors(batch_binding, request_binding=request_binding))
    if errors:
        return ["session bindings are invalid"]
    if request_binding != expected_request_binding or batch_binding != expected_batch_binding:
        return ["session bindings differ from trusted context"]
    if isinstance(batch_binding, dict):
        if batch_binding["role"] == "integration" and normalized["work_item"] is not None:
            return ["session integration work item is invalid"]
        if batch_binding["role"] == "worker" and normalized["work_item"] != batch_binding["feature_id"]:
            return ["session worker work item is invalid"]
    return []


def _lineage_errors(value: Any) -> list[str]:
    if value is None:
        return []
    if not isinstance(value, dict) or set(value) != LINEAGE_KEYS:
        return ["batch lineage is invalid"]
    if not _integer(value.get("schema"), minimum=1, maximum=1) or not _id(value.get("batch_id")) or not _id(value.get("request_id")) or not _digest(value.get("request_digest")) or not _commit(value.get("base_commit")):
        return ["batch lineage is invalid"]
    role = value.get("role")
    feature = value.get("feature_id")
    if not _enum(role, {"worker", "integration"}) or (role == "worker" and not _feature_id(feature)) or (role == "integration" and feature is not None):
        return ["batch lineage is invalid"]
    return []


def _lineage_context_errors(value: Any) -> tuple[list[str], list[dict[str, str]], Any]:
    if not isinstance(value, dict) or set(value) != LINEAGE_CONTEXT_KEYS:
        return ["lineage context is invalid"], [], None
    expected = value.get("expected_lineage")
    errors = _lineage_errors(expected)
    if errors:
        return errors, [], expected
    facts = value.get("feature_facts")
    if not isinstance(facts, list):
        return ["lineage context facts are invalid"], [], expected
    normalized_facts: list[dict[str, str]] = []
    seen: set[str] = set()
    for fact in facts:
        if not isinstance(fact, dict) or set(fact) != FEATURE_FACT_KEYS or not _feature_id(fact.get("id")) or not _enum(fact.get("status"), FEATURE_STATUSES):
            return ["lineage context facts are invalid"], [], expected
        feature_id = fact["id"]
        if feature_id in seen:
            return ["lineage context facts are invalid"], [], expected
        seen.add(feature_id)
        normalized_facts.append({"id": feature_id, "status": fact["status"]})
    if isinstance(expected, dict) and expected["role"] == "worker" and expected["feature_id"] not in seen:
        errors.append("lineage expected feature is unknown")
    return sorted(set(errors)), normalized_facts, expected


def feature_envelope_lineage_errors(value: Any, *, lineage_context: Any) -> list[str]:
    """Validate only versioned feature-envelope lineage against caller facts.

    Feature facts are already bounded and validated by the canonical caller.
    This helper deliberately does not inspect feature objects, evidence, or
    readiness and therefore cannot certify schema-2 passing evidence.
    """
    context_errors, facts, expected = _lineage_context_errors(lineage_context)
    if not isinstance(value, dict):
        return ["feature envelope is invalid"] + context_errors
    schema = value.get("schema")
    keys = set(value)
    if _integer(schema, minimum=1, maximum=1) and keys == FEATURE_DOCUMENT_V1_KEYS:
        document_lineage = None
    elif _integer(schema, minimum=2, maximum=2) and keys == FEATURE_DOCUMENT_V2_KEYS:
        document_lineage = value.get("batch_lineage")
    else:
        return ["feature envelope is invalid"] + context_errors
    document_lineage_errors = _lineage_errors(document_lineage)
    if context_errors or document_lineage_errors:
        return sorted(set(context_errors + document_lineage_errors))
    if document_lineage != expected:
        return ["feature lineage differs from trusted context"]
    active = [fact["id"] for fact in facts if fact["status"] == "in_progress"]
    if expected is None:
        return [] if len(active) <= 1 else ["feature lineage has too many active features"]
    assert isinstance(expected, dict)
    if expected["role"] == "integration":
        return [] if not active else ["integration lineage cannot have an active feature"]
    owned_feature = expected["feature_id"]
    if len(active) > 1 or any(feature != owned_feature for feature in active):
        return ["worker lineage active feature is invalid"]
    return []


def _controller_argv(value: Any) -> tuple[str, ...] | None:
    if not isinstance(value, list) or not 1 <= len(value) <= MAX_MEMBERS:
        return None
    argv: list[str] = []
    for part in value:
        if not isinstance(part, str) or not part.strip():
            return None
        try:
            byte_length = len(part.encode("utf-8"))
        except UnicodeEncodeError:
            return None
        if not 1 <= byte_length <= 1024 or any(unicodedata.category(character) == "Cc" or character in {"\u2028", "\u2029"} for character in part):
            return None
        argv.append(part)
    return tuple(argv)


def _controller_snapshot(value: Any) -> tuple[str, bool, tuple[str, ...], str, int]:
    if not isinstance(value, dict) or set(value) != CONTROLLER_KEYS:
        raise ValueError("controller declaration is invalid")
    adapter = value.get("adapter")
    enabled = value.get("enabled")
    command = value.get("command")
    protocol = value.get("protocol")
    max_workers = value.get("max_workers")
    if adapter == "none" and enabled is False and command == [] and protocol == "none" and _integer(max_workers, minimum=0, maximum=0):
        return ("none", False, (), "none", 0)
    argv = _controller_argv(command)
    if adapter != "codex" or enabled is not True or argv is None or protocol != "codex-exec-json-v1" or not _integer(max_workers, minimum=1, maximum=MAX_MEMBERS):
        raise ValueError("controller declaration is invalid")
    return ("codex", True, argv, "codex-exec-json-v1", max_workers)


def _controller_canonical_value(snapshot: tuple[str, bool, tuple[str, ...], str, int]) -> dict[str, Any]:
    adapter, enabled, argv, protocol, max_workers = snapshot
    return {
        "adapter": adapter,
        "enabled": enabled,
        "command": list(argv),
        "protocol": protocol,
        "max_workers": max_workers,
    }


def project_controller_snapshot(
    value: Any, *, command_predicate: Any = None,
) -> tuple[dict[str, Any], tuple[str, bool, tuple[str, ...], str, int] | None, str]:
    """Capture the optional controller once for structural validation and digesting.

    The returned base projection is a fresh schema-1 eleven-key dictionary for a
    later canonical legacy validator. This helper validates neither those legacy
    values nor executable safety, parser behavior, isolation, or live authority.
    """
    if not isinstance(value, dict):
        raise ValueError("project envelope is invalid")
    try:
        source_bytes = canonical_json_bytes(value)
        snapshot_value = json.loads(source_bytes.decode("utf-8"))
    except (UnicodeError, json.JSONDecodeError, ValueError, TypeError):
        raise ValueError("project envelope is invalid") from None
    if not isinstance(snapshot_value, dict):
        raise ValueError("project envelope is invalid")
    root_keys = set(snapshot_value)
    schema = snapshot_value.get("schema")
    has_controller = "controller" in snapshot_value
    envelope_keys = PROJECT_BASE_KEYS | {"release_authority"}
    if _integer(schema, minimum=1, maximum=1):
        if not any(root_keys == allowed for allowed in (PROJECT_BASE_KEYS, envelope_keys)):
            raise ValueError("project envelope is invalid")
        base = {key: snapshot_value[key] for key in PROJECT_BASE_KEYS}
        base["schema"] = 1
        return base, None, canonical_digest(None)
    allowed_roots=(PROJECT_BASE_KEYS, PROJECT_BASE_KEYS | {"controller"}, envelope_keys, envelope_keys | {"controller"})
    if not _integer(schema, minimum=2, maximum=2) or not any(root_keys == allowed for allowed in allowed_roots):
        raise ValueError("project envelope is invalid")
    base = {key: snapshot_value[key] for key in PROJECT_BASE_KEYS}
    base["schema"] = 1
    if not has_controller:
        return base, None, canonical_digest(None)
    try:
        snapshot = _controller_snapshot(snapshot_value["controller"])
    except (KeyError, ValueError, TypeError):
        raise ValueError("controller declaration is invalid") from None
    if snapshot[1]:
        if not callable(command_predicate):
            raise ValueError("controller declaration is invalid")
        try:
            predicate_result = command_predicate(snapshot[0], snapshot[3], snapshot[2])
        except Exception:
            raise ValueError("controller declaration is invalid") from None
        if predicate_result is not True:
            raise ValueError("controller declaration is invalid")
        try:
            if canonical_json_bytes(value) != source_bytes:
                raise ValueError("controller declaration is invalid")
        except (ValueError, TypeError):
            raise ValueError("controller declaration is invalid") from None
    return base, snapshot, canonical_digest(_controller_canonical_value(snapshot))


def _digest_list(value: Any, *, maximum: int = MAX_REFERENCES) -> bool:
    return (
        isinstance(value, list) and len(value) <= maximum and all(_digest(item) for item in value)
        and len(value) == len(set(value))
    )


def _members(value: Any, *, minimum: int = 0) -> bool:
    return (
        isinstance(value, list) and minimum <= len(value) <= MAX_MEMBERS
        and all(_feature_id(member) for member in value) and len(value) == len(set(value))
    )


def _bounded_evidence_value(value: Any) -> bool:
    """Bound only the new closed E-record values, never legacy projections."""
    try:
        return len(canonical_json_bytes(value)) <= MAX_RECORD_BYTES
    except ValueError:
        return False


def _candidate_context_errors(value: Any) -> list[str]:
    if not isinstance(value, dict) or set(value) != CANDIDATE_CONTEXT_KEYS:
        return ["candidate context is invalid"]
    if (
        not _digest(value.get("request_digest")) or not _feature_id(value.get("feature_id"))
        or not _id(value.get("worker_id")) or not _commit(value.get("start_commit"))
        or not _commit(value.get("candidate_commit"))
        or not all(_digest(value.get(key)) for key in (
            "initial_requirement_digest", "effective_requirement_digest", "task_scope_digest",
            "profile_digest",
        ))
    ):
        return ["candidate context is invalid"]
    receipts = value.get("expected_profile_receipts")
    if not isinstance(receipts, list) or len(receipts) > MAX_REFERENCES:
        return ["candidate context is invalid"]
    profiles: set[str] = set()
    receipt_digests: set[str] = set()
    for receipt in receipts:
        if not isinstance(receipt, dict) or set(receipt) != PROFILE_RECEIPT_KEYS:
            return ["candidate context is invalid"]
        profile = receipt.get("profile")
        digest = receipt.get("receipt_digest")
        if not _id(profile) or not _digest(digest) or profile in profiles or digest in receipt_digests:
            return ["candidate context is invalid"]
        profiles.add(profile)
        receipt_digests.add(digest)
    if not _digest_list(value.get("expected_review_refs")):
        return ["candidate context is invalid"]
    return []


def candidate_record_errors(value: Any, *, trusted_context: Any) -> list[str]:
    """Validate a candidate's closed payload against caller-established facts.

    This does not establish current checks, review authenticity, Git ancestry,
    worktree ownership, or readiness. The caller must establish those facts
    before supplying the independent context.
    """
    context_errors = _candidate_context_errors(trusted_context)
    if context_errors:
        return context_errors
    if not _bounded_evidence_value(value):
        return ["candidate record is invalid"]
    if not isinstance(value, dict) or set(value) != CANDIDATE_KEYS:
        return ["candidate record is invalid"]
    if not _integer(value.get("schema"), minimum=2, maximum=2):
        return ["candidate record is invalid"]
    scalar_keys = (
        "request_digest", "feature_id", "worker_id", "start_commit", "candidate_commit",
        "initial_requirement_digest", "effective_requirement_digest", "task_scope_digest",
        "profile_digest",
    )
    if any(value.get(key) != trusted_context[key] for key in scalar_keys):
        return ["candidate record differs from trusted context"]
    if not _digest_list(value.get("check_refs")) or not _digest_list(value.get("review_refs")):
        return ["candidate record references are invalid"]
    expected_checks = [row["receipt_digest"] for row in trusted_context["expected_profile_receipts"]]
    if value["check_refs"] != expected_checks or value["review_refs"] != trusted_context["expected_review_refs"]:
        return ["candidate record references differ from trusted context"]
    return []


def _review_context_errors(value: Any) -> list[str]:
    if not isinstance(value, dict) or set(value) != REVIEW_CONTEXT_KEYS:
        return ["review context is invalid"]
    subject = value.get("subject")
    members = value.get("covered_members")
    if not _digest(value.get("request_digest")) or not _enum(subject, REVIEW_SUBJECTS) or not _members(members):
        return ["review context is invalid"]
    feature = value.get("feature_id")
    initial = value.get("initial_requirement_digest")
    effective = value.get("effective_requirement_digest")
    if subject == "candidate":
        if len(members) != 1 or not _feature_id(feature) or members != [feature] or not _digest(initial) or not _digest(effective):
            return ["review context is invalid"]
    elif feature is not None or initial is not None or effective is not None:
        return ["review context is invalid"]
    if not _commit(value.get("source_commit")) or not all(_digest(value.get(key)) for key in (
        "requirements_digest", "commands_digest", "policy_digest", "controller_digest",
        "coordinator_digest", "authority_context_digest", "verifier_digest",
    )):
        return ["review context is invalid"]
    builders = value.get("builder_model_digests")
    if not _digest_list(builders, maximum=MAX_MEMBERS):
        return ["review context is invalid"]
    pipeline = value.get("expected_pipeline")
    if not isinstance(pipeline, list) or len(pipeline) > MAX_MEMBERS:
        return ["review context is invalid"]
    models: set[str] = set()
    leases: set[str] = set()
    previous_finished: str | None = None
    for row in pipeline:
        if not isinstance(row, dict) or set(row) != REVIEW_PIPELINE_KEYS:
            return ["review context is invalid"]
        role = row.get("model_role")
        model = row.get("resolved_model_digest")
        lease = row.get("lease_operation_id")
        started = row.get("started_at")
        finished = row.get("finished_at")
        if (
            not isinstance(role, str) or not REVIEW_ROLE.fullmatch(role) or not _digest(row.get("reviewer_identity_digest"))
            or not _id(lease) or not _timestamp(started) or not _timestamp(finished)
            or started > finished or not _enum(row.get("outcome"), REVIEW_OUTCOMES)
            or not _digest(model) or model in models or model in builders or lease in leases
            or (previous_finished is not None and previous_finished > started)
        ):
            return ["review context is invalid"]
        models.add(model)
        leases.add(lease)
        previous_finished = finished
    return []


def review_run_reference_errors(value: Any, *, trusted_context: Any) -> list[str]:
    """Validate one closed review reference, not a reviewed run's authority."""
    context_errors = _review_context_errors(trusted_context)
    if context_errors:
        return context_errors
    if not _bounded_evidence_value(value):
        return ["review reference is invalid"]
    if not isinstance(value, dict) or set(value) != REVIEW_RUN_KEYS:
        return ["review reference is invalid"]
    if not _integer(value.get("schema"), minimum=2, maximum=2):
        return ["review reference is invalid"]
    context_keys = (
        "request_digest", "subject", "covered_members", "feature_id", "source_commit",
        "initial_requirement_digest", "effective_requirement_digest", "requirements_digest",
        "commands_digest", "policy_digest", "controller_digest", "coordinator_digest",
        "authority_context_digest", "verifier_digest",
    )
    if any(value.get(key) != trusted_context[key] for key in context_keys):
        return ["review reference differs from trusted context"]
    stage = value.get("stage")
    if not _integer(stage, minimum=0, maximum=len(trusted_context["expected_pipeline"]) - 1):
        return ["review reference stage is invalid"]
    row = trusted_context["expected_pipeline"][stage]
    row_keys = (
        "model_role", "reviewer_identity_digest", "lease_operation_id", "started_at",
        "finished_at", "outcome", "resolved_model_digest",
    )
    if any(value.get(key) != row[key] for key in row_keys):
        return ["review reference differs from selected pipeline"]
    previous = value.get("previous_stage_digest")
    if (stage == 0 and previous is not None) or (stage > 0 and not _digest(previous)):
        return ["review reference previous stage is invalid"]
    if value.get("auth_origin") != "trusted_launcher_observed":
        return ["review reference origin is invalid"]
    if value.get("result_digest") != canonical_digest({"outcome": value["outcome"]}):
        return ["review reference result is invalid"]
    return []


def review_run_chain_errors(value: Any, *, trusted_context: Any) -> list[str]:
    """Validate ordered review payload chaining against a selected pipeline."""
    context_errors = _review_context_errors(trusted_context)
    if context_errors:
        return context_errors
    if not _bounded_evidence_value(value):
        return ["review chain is invalid"]
    if not isinstance(value, list) or len(value) != len(trusted_context["expected_pipeline"]):
        return ["review chain is invalid"]
    for index, record in enumerate(value):
        if review_run_reference_errors(record, trusted_context=trusted_context):
            return ["review chain is invalid"]
        if record.get("stage") != index:
            return ["review chain is invalid"]
        expected_previous = None if index == 0 else canonical_digest(value[index - 1])
        if record.get("previous_stage_digest") != expected_previous:
            return ["review chain is invalid"]
    return []


def _gate_context_errors(value: Any) -> list[str]:
    if not isinstance(value, dict) or set(value) != GATE_CONTEXT_KEYS:
        return ["gate context is invalid"]
    if not _digest(value.get("request_digest")) or not _feature_id(value.get("feature_id")) or not _digest(value.get("initial_requirement_digest")) or not _digest(value.get("effective_requirement_digest")) or not _commit(value.get("initial_source_commit")):
        return ["gate context is invalid"]
    initial = value.get("initial_gates")
    effective = value.get("effective_gates")
    if not isinstance(initial, list) or not isinstance(effective, list) or len(initial) > MAX_REFERENCES or len(effective) > MAX_REFERENCES or not all(_id(item) for item in initial) or not all(_id(item) for item in effective) or len(initial) != len(set(initial)) or len(effective) != len(set(effective)):
        return ["gate context is invalid"]
    transitions = value.get("expected_transitions")
    if not isinstance(transitions, list) or len(transitions) > MAX_REFERENCES:
        return ["gate context is invalid"]
    gates = list(initial)
    previous_timestamp: str | None = None
    for row in transitions:
        if not isinstance(row, dict) or set(row) != GATE_EXPECTED_KEYS:
            return ["gate context is invalid"]
        removed = row.get("removed_gate")
        timestamp = row.get("recorded_at")
        if (
            not _id(removed) or removed not in gates or not _digest(row.get("authority_reference_digest"))
            or not _digest(row.get("next_requirement_digest")) or not _timestamp(timestamp)
            or not _commit(row.get("resulting_commit"))
            or (previous_timestamp is not None and previous_timestamp >= timestamp)
        ):
            return ["gate context is invalid"]
        gates.remove(removed)
        previous_timestamp = timestamp
    if gates != effective:
        return ["gate context is invalid"]
    if transitions:
        if transitions[-1]["next_requirement_digest"] != value["effective_requirement_digest"]:
            return ["gate context is invalid"]
    elif value["initial_requirement_digest"] != value["effective_requirement_digest"]:
        return ["gate context is invalid"]
    return []


def _gate_transition_shape_errors(value: Any) -> list[str]:
    if not isinstance(value, dict) or set(value) != GATE_TRANSITION_KEYS:
        return ["gate transition is invalid"]
    if not _integer(value.get("schema"), minimum=2, maximum=2) or not _feature_id(value.get("feature_id")):
        return ["gate transition is invalid"]
    if not all(_digest(value.get(key)) for key in (
        "previous_requirement_digest", "next_requirement_digest", "authority_reference_digest",
        "transition_digest", "request_digest", "initial_requirement_digest",
    )) or not _id(value.get("removed_gate")) or not _timestamp(value.get("recorded_at")) or not _commit(value.get("source_commit")) or not _commit(value.get("resulting_commit")) or not _nullable(value.get("previous_transition_digest"), _digest):
        return ["gate transition is invalid"]
    expected_digest = canonical_digest({key: item for key, item in value.items() if key != "transition_digest"})
    if value["transition_digest"] != expected_digest:
        return ["gate transition digest is invalid"]
    return []


def gate_transition_errors(value: Any, *, trusted_context: Any, index: Any) -> list[str]:
    """Validate one indexed transition against independently supplied gate facts."""
    context_errors = _gate_context_errors(trusted_context)
    if context_errors:
        return context_errors
    if not _bounded_evidence_value(value):
        return ["gate transition is invalid"]
    if not _integer(index, minimum=0, maximum=len(trusted_context["expected_transitions"]) - 1):
        return ["gate transition index is invalid"]
    shape_errors = _gate_transition_shape_errors(value)
    if shape_errors:
        return shape_errors
    expected = trusted_context["expected_transitions"][index]
    prior = trusted_context["expected_transitions"][index - 1] if index else None
    required = {
        "feature_id": trusted_context["feature_id"],
        "previous_requirement_digest": trusted_context["initial_requirement_digest"] if prior is None else prior["next_requirement_digest"],
        "next_requirement_digest": expected["next_requirement_digest"],
        "removed_gate": expected["removed_gate"],
        "authority_reference_digest": expected["authority_reference_digest"],
        "recorded_at": expected["recorded_at"],
        "request_digest": trusted_context["request_digest"],
        "initial_requirement_digest": trusted_context["initial_requirement_digest"],
        "source_commit": trusted_context["initial_source_commit"] if prior is None else prior["resulting_commit"],
        "resulting_commit": expected["resulting_commit"],
    }
    if any(value.get(key) != expected_value for key, expected_value in required.items()):
        return ["gate transition differs from trusted context"]
    previous = value.get("previous_transition_digest")
    if (index == 0 and previous is not None) or (index > 0 and not _digest(previous)):
        return ["gate transition previous link is invalid"]
    return []


def gate_transition_chain_errors(value: Any, *, trusted_context: Any) -> list[str]:
    """Validate the complete ordered append-only gate transition chain."""
    context_errors = _gate_context_errors(trusted_context)
    if context_errors:
        return context_errors
    if not _bounded_evidence_value(value):
        return ["gate transition chain is invalid"]
    if not isinstance(value, list) or len(value) != len(trusted_context["expected_transitions"]):
        return ["gate transition chain is invalid"]
    for index, record in enumerate(value):
        if gate_transition_errors(record, trusted_context=trusted_context, index=index):
            return ["gate transition chain is invalid"]
        expected_previous = None if index == 0 else value[index - 1].get("transition_digest")
        if record.get("previous_transition_digest") != expected_previous:
            return ["gate transition chain is invalid"]
    return []


def _integrity_wrapper_context_errors(value: Any) -> list[str]:
    if not isinstance(value, dict) or set(value) != INTEGRITY_WRAPPER_CONTEXT_KEYS or not _enum(value.get("record_type"), IMPLEMENTED_RECORD_TYPES):
        return ["integrity wrapper context is invalid"]
    record_type = value["record_type"]
    payload_context = value.get("payload_context")
    if record_type == "candidate":
        return _candidate_context_errors(payload_context)
    if record_type == "review":
        return _review_context_errors(payload_context)
    if record_type == "gate_transition":
        return _gate_context_errors(payload_context)
    if record_type == "integration":
        return _integration_record_context_errors(payload_context)
    return _terminal_context_errors(payload_context)


def integrity_wrapper_errors(value: Any, *, trusted_context: Any) -> list[str]:
    """Validate an implemented typed wrapper without signing or authentication."""
    context_errors = _integrity_wrapper_context_errors(trusted_context)
    if context_errors:
        return ["integrity wrapper context is invalid"]
    if not _bounded_evidence_value(value):
        return ["integrity wrapper is invalid"]
    if not isinstance(value, dict) or set(value) != INTEGRITY_WRAPPER_KEYS:
        return ["integrity wrapper is invalid"]
    if not _integer(value.get("schema"), minimum=1, maximum=1) or value.get("record_type") != trusted_context["record_type"] or not _digest(value.get("signature")):
        return ["integrity wrapper is invalid"]
    record_type = value["record_type"]
    payload_context = trusted_context["payload_context"]
    if record_type == "candidate":
        errors = candidate_record_errors(value.get("payload"), trusted_context=payload_context)
    elif record_type == "review":
        errors = review_run_reference_errors(value.get("payload"), trusted_context=payload_context)
    elif record_type == "gate_transition":
        matches = [
            index for index in range(len(payload_context["expected_transitions"]))
            if not gate_transition_errors(value.get("payload"), trusted_context=payload_context, index=index)
        ]
        errors = [] if len(matches) == 1 else ["gate transition payload is invalid"]
    elif record_type == "integration":
        errors = integration_record_errors(value.get("payload"), trusted_context=payload_context)
    else:
        errors = terminal_certification_errors(value.get("payload"), trusted_context=payload_context)
    return [] if not errors else ["integrity wrapper payload is invalid"]


def integrity_wrapper_signing_bytes(value: Any, *, trusted_context: Any) -> bytes:
    """Return validated canonical signing bytes without signing or authenticating."""
    if integrity_wrapper_errors(value, trusted_context=trusted_context):
        raise ValueError("integrity wrapper is invalid")
    return canonical_json_bytes({key: value[key] for key in ("schema", "record_type", "payload")})


def integrity_wrapper_digest(value: Any, *, trusted_context: Any) -> str:
    """Return validated wrapper identity; it does not authenticate the wrapper."""
    if integrity_wrapper_errors(value, trusted_context=trusted_context):
        raise ValueError("integrity wrapper is invalid")
    return canonical_digest(value)


INTEGRATION_RECORD_KEYS = {
    "schema", "request_digest", "scope", "covered_members", "dependency_closure",
    "unlock_targets", "ordered_candidate_shas", "before_head", "after_head",
    "requirements_digest", "commands_digest", "policy_digest", "review_runs",
    "checks_digest", "verified_at", "certification_digest",
}
TERMINAL_KEYS = {
    "schema", "request_digest", "implementation_head", "terminal_head", "terminal_delta_digest",
    "batch_digest", "requirements_digest", "commands_digest", "policy_digest", "checks_digest",
    "review_refs", "verified_at", "operation_id",
}
SOURCE_CERTIFICATION_KEYS = {
    "schema", "kind", "terminal_head", "implementation_head", "request_digest", "batch_digest",
    "policy_digest", "certification_ref", "state",
}


def _integration_record_context_errors(value: Any) -> list[str]:
    expected = INTEGRATION_RECORD_KEYS - {"schema", "certification_digest"} | {"request_members", "work_members"}
    if not isinstance(value, dict) or set(value) != expected:
        return ["integration context is invalid"]
    members = value.get("request_members"); work = value.get("work_members"); covered = value.get("covered_members")
    if not _digest(value.get("request_digest")) or value.get("scope") not in {"prerequisite", "final"} or not _members(members, minimum=1) or not _members(work, minimum=1) or not set(work) <= set(members) or not _members(covered, minimum=1) or not set(covered) <= set(members):
        return ["integration context is invalid"]
    if value["scope"] == "final":
        if covered != members or value.get("unlock_targets") != []:
            return ["integration context is invalid"]
    elif not _members(value.get("unlock_targets")) or not set(value["unlock_targets"]) <= set(work) - set(covered):
        return ["integration context is invalid"]
    if value.get("dependency_closure") != covered or not isinstance(value.get("ordered_candidate_shas"), list) or len(value["ordered_candidate_shas"]) != len([member for member in covered if member in work]) or not all(_commit(item) for item in value["ordered_candidate_shas"]) or len(value["ordered_candidate_shas"]) != len(set(value["ordered_candidate_shas"])):
        return ["integration context is invalid"]
    if not _commit(value.get("before_head")) or not _commit(value.get("after_head")) or not all(_digest(value.get(key)) for key in ("requirements_digest", "commands_digest", "policy_digest", "checks_digest")) or not _digest_list(value.get("review_runs")) or not _timestamp(value.get("verified_at")):
        return ["integration context is invalid"]
    return []


def integration_record_errors(value: Any, *, trusted_context: Any) -> list[str]:
    errors = _integration_record_context_errors(trusted_context)
    if errors:
        return errors
    if not _bounded_evidence_value(value) or not isinstance(value, dict) or set(value) != INTEGRATION_RECORD_KEYS or not _integer(value.get("schema"), minimum=2, maximum=2):
        return ["integration record is invalid"]
    for key in INTEGRATION_RECORD_KEYS - {"schema", "certification_digest"}:
        if value.get(key) != trusted_context[key]:
            return ["integration record differs from trusted context"]
    if not _digest(value.get("certification_digest")) or value["certification_digest"] != canonical_digest({key: item for key, item in value.items() if key != "certification_digest"}):
        return ["integration record digest is invalid"]
    return []


def _terminal_context_errors(value: Any) -> list[str]:
    expected = TERMINAL_KEYS - {"schema"}
    if not isinstance(value, dict) or set(value) != expected:
        return ["terminal context is invalid"]
    if not _digest(value.get("request_digest")) or not _commit(value.get("implementation_head")) or not _commit(value.get("terminal_head")) or value["implementation_head"] == value["terminal_head"] or not all(_digest(value.get(key)) for key in ("terminal_delta_digest", "batch_digest", "requirements_digest", "commands_digest", "policy_digest", "checks_digest")) or not _digest_list(value.get("review_refs")) or not _timestamp(value.get("verified_at")) or not _id(value.get("operation_id")):
        return ["terminal context is invalid"]
    return []


def terminal_certification_errors(value: Any, *, trusted_context: Any) -> list[str]:
    if _terminal_context_errors(trusted_context):
        return ["terminal context is invalid"]
    if not _bounded_evidence_value(value) or not isinstance(value, dict) or set(value) != TERMINAL_KEYS or not _integer(value.get("schema"), minimum=2, maximum=2):
        return ["terminal certification is invalid"]
    return [] if all(value.get(key) == trusted_context[key] for key in TERMINAL_KEYS - {"schema"}) else ["terminal certification differs from trusted context"]


def source_certification_context_errors(value: Any, *, trusted_context: Any) -> list[str]:
    expected = SOURCE_CERTIFICATION_KEYS - {"schema", "kind"}
    if not isinstance(trusted_context, dict) or set(trusted_context) != expected:
        return ["source certification context is invalid"]
    state = trusted_context.get("state"); reference = trusted_context.get("certification_ref")
    if not _commit(trusted_context.get("terminal_head")) or not _commit(trusted_context.get("implementation_head")) or not _digest(trusted_context.get("request_digest")) or not _digest(trusted_context.get("batch_digest")) or not _digest(trusted_context.get("policy_digest")) or not _enum(state, {"pending", "blocked", "certified"}) or ((state == "certified" and not _digest(reference)) or (state != "certified" and reference is not None)):
        return ["source certification context is invalid"]
    if not _bounded_evidence_value(value) or not isinstance(value, dict) or set(value) != SOURCE_CERTIFICATION_KEYS or not _integer(value.get("schema"), minimum=1, maximum=1) or value.get("kind") != "source_certification":
        return ["source certification is invalid"]
    return [] if all(value.get(key) == trusted_context[key] for key in expected) else ["source certification differs from trusted context"]


PUBLIC_RUN_KEYS = {"schema", "execution_id", "profile", "layer", "command_digest", "started_at", "duration_ms", "exit_status", "source_commit", "checks"}
PUBLIC_CHECK_KEYS = {"check_id", "command_digest", "duration_ms", "exit_status"}
PROFILE_FACT_KEYS = {"profile", "layer", "command_digest", "check_command_digests"}


def _profile_fact_errors(value: Any) -> list[str]:
    if not isinstance(value, dict) or set(value) != PROFILE_FACT_KEYS or not _id(value.get("profile")) or not _enum(value.get("layer"), {"static", "behavioral", "system"}) or not _digest(value.get("command_digest")):
        return ["profile fact is invalid"]
    checks = value.get("check_command_digests")
    return [] if isinstance(checks, list) and 1 <= len(checks) <= MAX_REFERENCES and all(_digest(item) for item in checks) else ["profile fact is invalid"]


def public_run_errors(value: Any, *, trusted_context: Any) -> list[str]:
    if not isinstance(trusted_context, dict) or set(trusted_context) != {"source_commit", "profile_fact"} or not _commit(trusted_context.get("source_commit")) or _profile_fact_errors(trusted_context.get("profile_fact")):
        return ["public run context is invalid"]
    if not _bounded_evidence_value(value) or not isinstance(value, dict) or set(value) != PUBLIC_RUN_KEYS or not _integer(value.get("schema"), minimum=2, maximum=2):
        return ["public run is invalid"]
    fact = trusted_context["profile_fact"]
    if not isinstance(value.get("execution_id"), str) or not re.fullmatch(r"run-[0-9a-f]{32}", value["execution_id"]) or any(value.get(key) != fact[key] for key in ("profile", "layer", "command_digest")) or value.get("source_commit") != trusted_context["source_commit"] or not _timestamp(value.get("started_at")) or not _integer(value.get("duration_ms"), minimum=0, maximum=86_400_000) or not _integer(value.get("exit_status"), minimum=0, maximum=0):
        return ["public run is invalid"]
    checks = value.get("checks"); expected = fact["check_command_digests"]
    if not isinstance(checks, list) or len(checks) != len(expected):
        return ["public run checks are invalid"]
    total = 0
    for index, (check, digest) in enumerate(zip(checks, expected), 1):
        if not isinstance(check, dict) or set(check) != PUBLIC_CHECK_KEYS or check.get("check_id") != f"{fact['profile']}:{index}" or check.get("command_digest") != digest or not _integer(check.get("duration_ms"), minimum=0, maximum=86_400_000) or not _integer(check.get("exit_status"), minimum=0, maximum=0):
            return ["public run checks are invalid"]
        total += check["duration_ms"]
    return [] if total == value["duration_ms"] else ["public run duration is invalid"]


def public_review_history_errors(value: Any, *, trusted_context: Any) -> list[str]:
    """Validate portable review history without accepting private observations."""
    expected = {"request_digest", "subject", "covered_members", "feature_id", "source_commit", "initial_requirement_digest", "effective_requirement_digest", "requirements_digest", "commands_digest", "policy_digest", "controller_digest", "pipeline_roles"}
    if not isinstance(trusted_context, dict) or set(trusted_context) != expected or not _digest(trusted_context.get("request_digest")) or not _enum(trusted_context.get("subject"), REVIEW_SUBJECTS) or not _members(trusted_context.get("covered_members")) or not _commit(trusted_context.get("source_commit")) or not all(_digest(trusted_context.get(key)) for key in ("requirements_digest", "commands_digest", "policy_digest", "controller_digest")) or not isinstance(trusted_context.get("pipeline_roles"), list) or len(trusted_context["pipeline_roles"]) > MAX_MEMBERS or not all(isinstance(role, str) and REVIEW_ROLE.fullmatch(role) for role in trusted_context["pipeline_roles"]) or len(trusted_context["pipeline_roles"]) != len(set(trusted_context["pipeline_roles"])):
        return ["public review history context is invalid"]
    subject = trusted_context["subject"]
    if subject == "candidate":
        if len(trusted_context["covered_members"]) != 1 or not _feature_id(trusted_context.get("feature_id")) or trusted_context["covered_members"] != [trusted_context["feature_id"]] or not _digest(trusted_context.get("initial_requirement_digest")) or not _digest(trusted_context.get("effective_requirement_digest")):
            return ["public review history context is invalid"]
    elif any(trusted_context.get(key) is not None for key in ("feature_id", "initial_requirement_digest", "effective_requirement_digest")):
        return ["public review history context is invalid"]
    if not _bounded_evidence_value(value) or not isinstance(value, list) or len(value) != len(trusted_context["pipeline_roles"]):
        return ["public review history is invalid"]
    seen_models: set[str] = set(); seen_leases: set[str] = set(); prior_finish: str | None = None
    previous: str | None = None
    for index, record in enumerate(value):
        if not isinstance(record, dict) or set(record) != REVIEW_RUN_KEYS or not _integer(record.get("schema"), minimum=2, maximum=2):
            return ["public review history is invalid"]
        for key in ("request_digest", "subject", "covered_members", "feature_id", "source_commit", "initial_requirement_digest", "effective_requirement_digest", "requirements_digest", "commands_digest", "policy_digest", "controller_digest"):
            if record.get(key) != trusted_context[key]:
                return ["public review history differs from context"]
        if record.get("stage") != index or record.get("model_role") != trusted_context["pipeline_roles"][index] or record.get("outcome") != "pass" or record.get("result_digest") != canonical_digest({"outcome": "pass"}) or record.get("previous_stage_digest") != previous or record.get("auth_origin") != "trusted_launcher_observed" or not all(_digest(record.get(key)) for key in ("reviewer_identity_digest", "coordinator_digest", "authority_context_digest", "resolved_model_digest", "verifier_digest")) or not _id(record.get("lease_operation_id")) or not _timestamp(record.get("started_at")) or not _timestamp(record.get("finished_at")) or record["started_at"] > record["finished_at"] or (prior_finish is not None and prior_finish > record["started_at"]) or record["resolved_model_digest"] in seen_models or record["lease_operation_id"] in seen_leases:
            return ["public review history is invalid"]
        seen_models.add(record["resolved_model_digest"]); seen_leases.add(record["lease_operation_id"]); prior_finish = record["finished_at"]; previous = canonical_digest(record)
    return []


def public_gate_history_errors(value: Any, *, trusted_context: Any) -> list[str]:
    expected = {"request_digest", "feature_id", "initial_requirement_digest", "effective_requirement_digest", "initial_source_commit", "initial_gates", "effective_gates"}
    if not isinstance(trusted_context, dict) or set(trusted_context) != expected or not _digest(trusted_context.get("request_digest")) or not _feature_id(trusted_context.get("feature_id")) or not _digest(trusted_context.get("initial_requirement_digest")) or not _digest(trusted_context.get("effective_requirement_digest")) or not _commit(trusted_context.get("initial_source_commit")):
        return ["public gate history context is invalid"]
    gates = trusted_context.get("initial_gates"); effective = trusted_context.get("effective_gates")
    if not isinstance(gates, list) or not isinstance(effective, list) or len(gates) > MAX_REFERENCES or len(effective) > MAX_REFERENCES or not all(_id(item) for item in gates + effective) or len(gates) != len(set(gates)) or len(effective) != len(set(effective)) or not _bounded_evidence_value(value) or not isinstance(value, list) or len(value) > MAX_REFERENCES:
        return ["public gate history is invalid"]
    previous_requirement = trusted_context["initial_requirement_digest"]; previous_commit = trusted_context["initial_source_commit"]; previous_digest = None; previous_time = None
    for record in value:
        if _gate_transition_shape_errors(record):
            return ["public gate history is invalid"]
        if record.get("feature_id") != trusted_context["feature_id"] or record.get("request_digest") != trusted_context["request_digest"] or record.get("initial_requirement_digest") != trusted_context["initial_requirement_digest"] or record.get("previous_requirement_digest") != previous_requirement or record.get("source_commit") != previous_commit or record.get("previous_transition_digest") != previous_digest or record["removed_gate"] not in gates or (previous_time is not None and previous_time >= record["recorded_at"]):
            return ["public gate history is invalid"]
        gates.remove(record["removed_gate"]); previous_requirement = record["next_requirement_digest"]; previous_commit = record["resulting_commit"]; previous_digest = record["transition_digest"]; previous_time = record["recorded_at"]
    if gates != effective or previous_requirement != trusted_context["effective_requirement_digest"]:
        return ["public gate history is invalid"]
    return []


PUBLIC_BATCH_KEYS = {"schema", "source_commit", "request_digest", "request_members", "members", "initial_requirement_digests", "effective_requirement_digests", "gate_transitions", "ordered_candidate_shas", "receipts", "review_runs"}


def _snapshot(value: Any) -> tuple[bytes, Any] | None:
    try:
        encoded = canonical_json_bytes(value)
        return encoded, json.loads(encoded.decode("utf-8"))
    except (ValueError, UnicodeError, json.JSONDecodeError):
        return None


def public_batch_errors(value: Any, *, trusted_context: Any, public_text_predicate: Any = None) -> list[str]:
    """Validate public history composition, not private observation or publication."""
    input_snapshot = _snapshot(value); context_snapshot = _snapshot(trusted_context)
    if input_snapshot is None or context_snapshot is None or not _bounded_evidence_value(value) or not callable(public_text_predicate):
        return ["public batch is invalid"]
    data = input_snapshot[1]; context = context_snapshot[1]
    required_context = {"source_commit", "request_digest", "request_members", "work_members", "initial_requirement_digests", "effective_requirement_digests", "gate_history_contexts", "ordered_candidate_shas", "review_history_context", "member_profiles", "expected_binding_facts", "profile_facts"}
    if not isinstance(context, dict) or set(context) != required_context or not isinstance(data, dict) or set(data) != PUBLIC_BATCH_KEYS or not _integer(data.get("schema"), minimum=2, maximum=2):
        return ["public batch is invalid"]
    for key in ("source_commit", "request_digest", "request_members", "ordered_candidate_shas"):
        if data.get(key) != context.get(key): return ["public batch differs from context"]
    members = context.get("work_members")
    if not _members(context.get("request_members"), minimum=1) or not _members(members, minimum=1) or not set(members) <= set(context["request_members"]) or data.get("members") != members or not _feature_map(context.get("initial_requirement_digests"), digests=True) or not _feature_map(context.get("effective_requirement_digests"), digests=True) or data.get("initial_requirement_digests") != context["initial_requirement_digests"] or data.get("effective_requirement_digests") != context["effective_requirement_digests"] or not isinstance(data.get("ordered_candidate_shas"), list) or len(data["ordered_candidate_shas"]) != len(members) or not all(_commit(item) for item in data["ordered_candidate_shas"]) or len(data["ordered_candidate_shas"]) != len(set(data["ordered_candidate_shas"])):
        return ["public batch is invalid"]
    histories = context.get("gate_history_contexts")
    if not isinstance(histories, list) or len(histories) != len(context["request_members"]) or [item.get("feature_id") if isinstance(item, dict) else None for item in histories] != context["request_members"] or not isinstance(data.get("gate_transitions"), list):
        return ["public batch history is invalid"]
    gate_chains: list[list[Any]] = []
    cursor = 0
    for history in histories:
        chain: list[Any] = []
        while cursor < len(data["gate_transitions"]) and isinstance(data["gate_transitions"][cursor], dict) and data["gate_transitions"][cursor].get("feature_id") == history["feature_id"]:
            chain.append(data["gate_transitions"][cursor]); cursor += 1
        gate_chains.append(chain)
    if cursor != len(data["gate_transitions"]) or any(public_gate_history_errors(chain, trusted_context=history) for chain, history in zip(gate_chains, histories)) or public_review_history_errors(data.get("review_runs"), trusted_context=context.get("review_history_context")):
        return ["public batch history is invalid"]
    receipts = data.get("receipts")
    if not isinstance(receipts, dict) or set(receipts) != {"runs", "bindings"} or not isinstance(receipts["runs"], list) or not isinstance(receipts["bindings"], list): return ["public batch receipts are invalid"]
    facts = context.get("profile_facts")
    if not isinstance(facts, list) or any(_profile_fact_errors(item) for item in facts): return ["public batch context is invalid"]
    fact_by_profile = {item["profile"]: item for item in facts}
    runs: dict[str, Any] = {}
    previous_digest = None
    for run in receipts["runs"]:
        if not isinstance(run, dict) or run.get("profile") not in fact_by_profile or public_run_errors(run, trusted_context={"source_commit": context["source_commit"], "profile_fact": fact_by_profile[run["profile"]]}): return ["public batch receipts are invalid"]
        digest = canonical_digest(run)
        if digest in runs or (previous_digest is not None and previous_digest >= digest): return ["public batch receipts are invalid"]
        runs[digest] = run; previous_digest = digest
    expected_bindings = context.get("expected_binding_facts")
    if not isinstance(expected_bindings, list) or len(receipts["bindings"]) != len(expected_bindings): return ["public batch bindings are invalid"]
    for binding, expected_binding in zip(receipts["bindings"], expected_bindings):
        if not isinstance(binding, dict) or set(binding) != {"feature_id", "profile", "run_digest", "surface_digest", "profile_digest", "requirement_digest"} or not isinstance(expected_binding, dict) or set(expected_binding) != {"feature_id", "profile", "surface_digest", "profile_digest", "requirement_digest"} or any(binding.get(key) != expected_binding[key] for key in expected_binding) or binding.get("run_digest") not in runs or runs[binding["run_digest"]]["profile"] != binding["profile"]: return ["public batch bindings are invalid"]
    if set(runs) != {binding["run_digest"] for binding in receipts["bindings"]}:
        return ["public batch bindings are invalid"]
    try:
        if public_text_predicate(input_snapshot[0], limit=MAX_RECORD_BYTES) is not True or canonical_json_bytes(value) != input_snapshot[0] or canonical_json_bytes(trusted_context) != context_snapshot[0]:
            return ["public batch is invalid"]
    except Exception:
        return ["public batch is invalid"]
    return []


EVIDENCE_V2_KEYS = {
    "schema", "profile", "command_digest", "surface_digest", "profile_digest",
    "requirement_digest", "receipt_digest", "verified_at", "source_commit", "batch_digest",
}


def per_feature_evidence_v2_errors(value: Any, *, trusted_context: Any, public_text_predicate: Any = None) -> list[str]:
    """Compose an exact work-member public evidence projection without readiness."""
    outer_snapshot = _snapshot(value); context_snapshot = _snapshot(trusted_context)
    if outer_snapshot is None or context_snapshot is None or not isinstance(context_snapshot[1], dict) or set(context_snapshot[1]) != {"feature_id", "batch_attestation", "batch_context"} or not _feature_id(context_snapshot[1].get("feature_id")):
        return ["per-feature evidence is invalid"]
    context = context_snapshot[1]
    if public_batch_errors(context["batch_attestation"], trusted_context=context["batch_context"], public_text_predicate=public_text_predicate):
        return ["per-feature evidence is invalid"]
    batch = context["batch_attestation"]; feature = context["feature_id"]
    if feature not in batch["members"] or not isinstance(value, list):
        return ["per-feature evidence is invalid"]
    runs = {canonical_digest(run): run for run in batch["receipts"]["runs"]}
    expected: list[dict[str, Any]] = []
    for binding in batch["receipts"]["bindings"]:
        if binding["feature_id"] != feature:
            continue
        run = runs[binding["run_digest"]]
        expected.append({
            "schema": 2, "profile": binding["profile"], "command_digest": run["command_digest"],
            "surface_digest": binding["surface_digest"], "profile_digest": binding["profile_digest"],
            "requirement_digest": binding["requirement_digest"], "receipt_digest": binding["run_digest"],
            "verified_at": run["started_at"], "source_commit": batch["source_commit"],
            "batch_digest": canonical_digest(batch),
        })
    if value != expected or any(not isinstance(item, dict) or set(item) != EVIDENCE_V2_KEYS for item in value):
        return ["per-feature evidence is invalid"]
    try:
        if canonical_json_bytes(value) != outer_snapshot[0] or canonical_json_bytes(trusted_context) != context_snapshot[0]:
            return ["per-feature evidence is invalid"]
    except ValueError:
        return ["per-feature evidence is invalid"]
    return []
