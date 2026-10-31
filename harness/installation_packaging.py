"""Closed validation for template-only batch development artifacts."""
from __future__ import annotations

import json
import hashlib
import math
import os
from pathlib import Path
import stat
import re
import subprocess
import datetime as dt

BATCH_ARTIFACTS=("bin/agent-batch","script/batch.py","harness/batch-policy.json")
MAX_BATCH_POLICY_BYTES=64*1024
MAX_BATCH_STATE_BYTES=1_000_000
MAX_BATCH_MEMBERS=16
MAX_BATCH_WORKERS=4
BATCH_ID_PATTERN=re.compile(r"[a-z][a-z0-9-]{0,31}")
FEATURE_ID_PATTERN=re.compile(r"[A-Z][A-Z0-9]*-[0-9]{3}")
COMMIT_PATTERN=re.compile(r"[0-9a-f]{40}")
DIGEST_PATTERN=re.compile(r"[0-9a-f]{64}")
FORBIDDEN_PUBLIC_TEXT=re.compile(r"/Users/|/home/|token|secret|password|Bearer|ssh-|BEGIN .*PRIVATE KEY",re.I)
HIGH_CONFIDENCE_CREDENTIAL=re.compile(r"(?:A(?:KIA|SIA)[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-(?:proj|svcacct|live)-[A-Za-z0-9_-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)")
REQUEST_KEYS={"schema","request_id","membership","strategy","max_workers","base_commit","requirements","dependencies","classifications","created_at","state"}
MANIFEST_KEYS={"schema","batch_id","request_id","request_digest","policy_digest","controller_digest","base_commit","base_branch","integration","workers","operation","sequence"}
INTEGRATION_KEYS={"branch","worktree_token","head","state","prefix_evidence_ref","evidence_ref"}
WORKER_KEYS={"feature_id","worker_id","branch","worktree_token","task_scope_digest","initial_requirement_digest","classification","start_commit","state","dependency_prefix_head","dependency_prefix_digest","controller_run_id","candidate_commit","builder_binding_ref","builder_model_digest","review_runs","blocked_reason"}
FEATURE_CLASSIFICATION_KEYS={"work_kind","risk","security_sensitive"}
REVIEW_RECORD_KEYS={"schema","review_digest","feature_id","candidate_commit","outcome","stage","reviewer_role","reviewer_id","reviewer_selection","reasoning_effort","read_only","builder_binding_ref","builder_selection","reviewer_binding_ref","builder_model_digest","resolved_model_digest","requirement_digest","scope_digest","review_policy_digest","quality_assessment"}
BATCH_AUTHORITY_PATHS=("harness/batch-policy.json","harness/project.json","harness/model-routing.json","harness/review-policy.json","feature_list.json")
QUALITY_PRINCIPLES=("DRY","SRP","OCP","LSP","ISP","DIP","YAGNI")

def _enum(value: object, choices: object) -> bool:
    return isinstance(value,str) and value in choices

def _read_strict_batch_policy(root: Path) -> object|None:
    """Read the policy once through a no-follow, bounded regular descriptor."""
    directory=descriptor=None
    try:
        directory=os.open(root,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0))
        for part in ("harness",):
            child=os.open(part,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0),dir_fd=directory)
            metadata=os.fstat(child)
            if not stat.S_ISDIR(metadata.st_mode): return None
            os.close(directory); directory=child
        descriptor=os.open("batch-policy.json",os.O_RDONLY|getattr(os,"O_NOFOLLOW",0)|getattr(os,"O_NONBLOCK",0),dir_fd=directory)
        before=os.fstat(descriptor)
        if not stat.S_ISREG(before.st_mode) or before.st_size>MAX_BATCH_POLICY_BYTES: return None
        payload=bytearray()
        while True:
            block=os.read(descriptor,65536)
            if not block: break
            payload.extend(block)
            if len(payload)>MAX_BATCH_POLICY_BYTES: return None
        after=os.fstat(descriptor)
        identity=lambda metadata:(metadata.st_dev,metadata.st_ino,metadata.st_mode,metadata.st_size,metadata.st_mtime_ns)
        if identity(before)!=identity(after): return None
        return _strict_json(bytes(payload))
    except (OSError,UnicodeError,ValueError):
        return None
    finally:
        if descriptor is not None: os.close(descriptor)
        if directory is not None: os.close(directory)

def strict_batch_policy_errors(value: object) -> list[str]:
    if type(value) is not dict or set(value)!={"schema","integration_branch_prefix","feature_branch_pattern","merge_strategy","max_features","rules"}:
        return ["template packaging requires the current strict batch policy"]
    if type(value["schema"]) is not int or value["schema"] not in {1,2}: return ["template packaging requires the current strict batch policy"]
    if (type(value["integration_branch_prefix"]) is not str or value["integration_branch_prefix"]!="codex/batch/" or
        type(value["feature_branch_pattern"]) is not str or value["feature_branch_pattern"]!="codex/batch/{batch}--{feature}" or
        type(value["merge_strategy"]) is not str or value["merge_strategy"]!="no-ff"): return ["template packaging requires the current strict batch policy"]
    if type(value["max_features"]) is not int or value["max_features"]!=16: return ["template packaging requires the current strict batch policy"]
    rules=value["rules"]
    expected={"base_branch_is_protected","feature_worktrees_are_isolated","integration_requires_fresh_verification","main_merge_requires_explicit_authority"}
    if value["schema"]==2:
        expected |= {"pinned_reviewed_candidates","fail_closed_context","atomic_completion","terminal_certification_required"}
    if type(rules) is not dict or set(rules)!=expected or any(rules[key] is not True for key in expected): return ["template packaging requires the current strict batch policy"]
    return []

def batch_packaging_errors(root: Path,run_meta_tests: object, *, policy_value: object=None) -> list[str]:
    if type(run_meta_tests) is not bool: return ["installation packaging run_meta_tests must be boolean"]
    present=[]
    for relative in BATCH_ARTIFACTS:
        path=root/relative
        if os.path.lexists(path):
            metadata=os.lstat(path)
            if stat.S_ISLNK(metadata.st_mode) or not stat.S_ISREG(metadata.st_mode): return [f"installation packaging has an unsafe batch artifact: {relative}"]
            present.append(relative)
    if not run_meta_tests: return [] if not present else ["installed packaging must omit every template-only batch artifact"]
    if set(present)!=set(BATCH_ARTIFACTS): return ["template packaging requires the complete batch artifact triplet"]
    policy=_read_strict_batch_policy(root) if policy_value is None else policy_value
    if policy is None: return ["template packaging requires the current strict batch policy"]
    return strict_batch_policy_errors(policy)

def _safe_record_text(value: object, maximum: int=2000) -> bool:
    return safe_public_text(value,maximum=maximum)

def safe_public_text(value: object, *, allow_empty: bool=False, maximum: int=2000) -> bool:
    """Apply one strict durable-text privacy policy in runtime and packaging."""
    if not isinstance(value,str) or len(value)>maximum or any(ord(char)<32 or 127<=ord(char)<=159 or char in "\u2028\u2029" for char in value): return False
    if not allow_empty and not value.strip(): return False
    return not bool(FORBIDDEN_PUBLIC_TEXT.search(value) or HIGH_CONFIDENCE_CREDENTIAL.search(value))

def repository_classification_errors(value: object) -> list[str]:
    expected={"unclassified":[],"code":["code","content"],"content":["content"],"mixed":["code","content"]}
    if type(value) is not dict or set(value)!={"repository_kind","allowed_work_kinds"}: return ["classification must contain exactly repository_kind and allowed_work_kinds"]
    kind=value.get("repository_kind")
    return [] if _enum(kind,expected) and value.get("allowed_work_kinds")==expected[kind] else ["classification repository_kind and allowed_work_kinds are inconsistent"]


def feature_classification_errors(value: object) -> list[str]:
    """Validate the immutable per-feature work classification snapshot."""
    if type(value) is not dict or set(value)!=FEATURE_CLASSIFICATION_KEYS:
        return ["feature classification must contain exactly work_kind, risk, and security_sensitive"]
    if not _enum(value.get("work_kind"),{"code","content"}) or not _enum(value.get("risk"),{"low","standard","high"}) or type(value.get("security_sensitive")) is not bool:
        return ["feature classification is invalid"]
    if value["security_sensitive"] and value["work_kind"]!="code":
        return ["security_sensitive requires code work"]
    return []


def required_review_pipeline(classification: object, routing_policy: object, project: object, *, historical: bool=False) -> list[str] | None:
    """Resolve the ordered model-owned review pipeline for one typed feature.

    Runtime and installation packaging use this same helper so a terminal batch
    cannot be accepted under a different interpretation of its review stages.
    """
    policy_errors=historical_routing_policy_errors(routing_policy) if historical else routing_policy_errors(routing_policy)
    if feature_classification_errors(classification) or policy_errors or project_contract_errors(project):
        return None
    assert isinstance(classification,dict) and isinstance(routing_policy,dict) and isinstance(project,dict)
    if classification["work_kind"] not in project["classification"]["allowed_work_kinds"]:
        return None
    configured=routing_policy["work_profiles"][classification["work_kind"]]["pipelines"].get(classification["risk"])
    if not isinstance(configured,list):
        return None
    stages=list(configured)
    if classification["security_sensitive"]:
        if "security_reviewer" not in routing_policy["selection_policy"]["roles"]:
            return None
        if "security_reviewer" not in stages:
            if "final_authority" in stages:
                stages.insert(stages.index("final_authority"),"security_reviewer")
            else:
                stages.append("security_reviewer")
    if project["release_authority"]["required_for_release_readiness"] and "final_authority" not in stages:
        stages.append("final_authority")
    if any(stage not in routing_policy["selection_policy"]["roles"] for stage in stages):
        return None
    return stages


def review_policy_errors(value: object) -> list[str]:
    """Validate the review authority shared by serial and batch execution."""
    if type(value) is not dict or set(value)!={"schema","default_mode","modes","selection","quality_review","release_authority","rules"}:
        return ["review policy has invalid top-level keys"]
    if value.get("schema")!=1 or value.get("default_mode")!="agent": return ["review policy schema or default mode is invalid"]
    modes=value.get("modes"); mode_keys={"reviewer_kind","required_capability","read_only","distinct_reviewer","description"}
    if type(modes) is not dict or set(modes)!={"agent","human"}: return ["review policy modes are invalid"]
    for name,mode in modes.items():
        if type(mode) is not dict or set(mode)!=mode_keys or not safe_public_text(mode.get("reviewer_kind"),maximum=100) or type(mode.get("read_only")) is not bool or type(mode.get("distinct_reviewer")) is not bool or not safe_public_text(mode.get("description"),maximum=500):
            return [f"review policy mode {name} is invalid"]
        if mode.get("required_capability") is not None and not safe_public_text(mode["required_capability"],maximum=100): return [f"review policy mode {name} is invalid"]
    selection=value.get("selection")
    if (type(selection) is not dict or set(selection)!={"preferred_capability","required_reasoning_effort","fallback_allowed","fallback_assurance","fallback_requires_distinct_reviewer","strongest_model_wins"} or
        selection.get("preferred_capability")!="high-reasoning" or selection.get("required_reasoning_effort")!="high" or selection.get("fallback_allowed") is not False or selection.get("fallback_assurance") is not None or selection.get("fallback_requires_distinct_reviewer") is not True or selection.get("strongest_model_wins") is not True):
        return ["review policy selection rules are invalid"]
    quality=value.get("quality_review")
    if (type(quality) is not dict or set(quality)!={"required_for_code","principles","finding_severities","outcomes","material_finding_blocks","non_applicability_requires_reason","exception_requires_reason","finding_evidence_required"} or
        quality.get("required_for_code") is not True or quality.get("principles")!=["DRY","SOLID","YAGNI"] or quality.get("finding_severities")!=["material","advisory"] or quality.get("outcomes")!=["pass","pass_with_advisories","blocked"] or
        any(quality.get(key) is not True for key in ("material_finding_blocks","non_applicability_requires_reason","exception_requires_reason","finding_evidence_required"))):
        return ["review policy quality rules are invalid"]
    release=value.get("release_authority")
    if (type(release) is not dict or set(release)!={"mode","role","requires_exact_commit","requires_current_evidence","requires_current_inventory","publication_remains_explicit"} or release.get("mode")!="model" or release.get("role")!="final_authority" or any(release.get(key) is not True for key in ("requires_exact_commit","requires_current_evidence","requires_current_inventory","publication_remains_explicit"))):
        return ["review policy release authority is invalid"]
    rules=value.get("rules"); expected={"agent_is_default","agent_requires_high_reasoning","agent_must_be_distinct","human_selection_is_explicit_stop","review_is_read_only","policy_changes_invalidate_review"}
    if type(rules) is not dict or set(rules)!=expected or any(rules.get(key) is not True for key in expected): return ["review policy safety rules are invalid"]
    if modes["agent"].get("required_capability")!="high-reasoning" or modes["agent"].get("distinct_reviewer") is not True or modes["agent"].get("read_only") is not True or modes["human"].get("read_only") is not True:
        return ["review policy boundary is invalid"]
    return []


def review_quality_errors(assessment: object) -> list[str]:
    """Require explicit code-quality reasoning, including adverse findings."""
    if type(assessment) is not dict or set(assessment)!={"schema","outcome","principles","findings"} or assessment.get("schema")!=1:
        return ["batch quality assessment is invalid"]
    if assessment.get("outcome") not in {"pass","pass_with_advisories","blocked"}: return ["batch quality outcome is invalid"]
    principles=assessment.get("principles")
    if type(principles) is not list or len(principles)!=len(QUALITY_PRINCIPLES): return ["batch quality principles are incomplete"]
    seen=set()
    for entry in principles:
        if type(entry) is not dict or set(entry)!={"principle","status","reason"} or entry.get("principle") not in QUALITY_PRINCIPLES or entry["principle"] in seen or entry.get("status") not in {"applicable","not_applicable","exception"}: return ["batch quality principle is invalid"]
        seen.add(entry["principle"])
        reason=entry.get("reason")
        if entry["status"] in {"not_applicable","exception"} and not safe_public_text(reason,maximum=1000): return ["batch quality principle reason is required"]
        if entry["status"]=="applicable" and reason is not None and not safe_public_text(reason,maximum=1000): return ["batch quality principle reason is invalid"]
    findings=assessment.get("findings")
    if type(findings) is not list: return ["batch quality findings are invalid"]
    for finding in findings:
        if (type(finding) is not dict or set(finding)!={"principle","severity","status","summary","evidence"} or finding.get("principle") not in QUALITY_PRINCIPLES or finding.get("severity") not in {"material","advisory"} or finding.get("status") not in {"open","resolved"} or not safe_public_text(finding.get("summary"),maximum=2000) or not safe_public_text(finding.get("evidence"),maximum=2000)):
            return ["batch quality finding is invalid"]
    expected="blocked" if any(item["severity"]=="material" and item["status"]=="open" for item in findings) else "pass_with_advisories" if any(item["severity"]=="advisory" and item["status"]=="open" for item in findings) else "pass"
    return [] if assessment["outcome"]==expected else ["batch quality outcome does not match findings"]


def _profile_unavailable_errors(profiles: object) -> list[str]:
    """Reject non-public remediation text in every project-profile shape."""
    if type(profiles) is not dict:
        return []
    errors=[]
    for name,definition in profiles.items():
        if not isinstance(name,str) or type(definition) is not dict:
            continue
        if "unavailable" in definition and not safe_public_text(definition["unavailable"],maximum=500):
            errors.append(f"profile {name} unavailable remediation must be safe public text")
    return errors


def project_contract_errors(configuration: object, *, require_release_authority: bool=True) -> list[str]:
    """Validate the single project contract used by serial, batch, and adoption."""
    if type(configuration) is not dict:
        return ["harness/project.json must be an object"]
    cfg=configuration; errors=[]
    expected={"schema","name","slug","source","commands","classification","profiles","external_gates","release_authority","timeout_seconds","identity_terms","run_meta_tests"}
    allowed=expected if require_release_authority else expected-{"release_authority"}
    if "installation" in cfg: allowed=allowed|{"installation"}
    if set(cfg)!=allowed: errors.append("harness/project.json must contain exactly the allowed project keys")
    if "installation" in cfg and (cfg["installation"] not in ({"schema":1,"distribution":"shared"},{"schema":1,"distribution":"personal"}) or cfg.get("run_meta_tests") is not False):
        errors.append("installed project marker is invalid")
    if cfg.get("schema")!=1: errors.append("harness/project.json schema must be 1")
    source=cfg.get("source")
    if (type(source) is not dict or set(source)!={"name","url","commit"} or
        not safe_public_text(source.get("name"),maximum=300) or
        not isinstance(source.get("url"),str) or not source["url"].startswith("https://") or
        not isinstance(source.get("commit"),str) or not COMMIT_PATTERN.fullmatch(source["commit"])):
        errors.append("project source fields are invalid")
    if type(cfg.get("timeout_seconds")) is not int or not 1<=cfg.get("timeout_seconds",0)<=3600: errors.append("timeout_seconds must be an integer from 1 through 3600")
    if not safe_public_text(cfg.get("name"),maximum=200) or not safe_public_text(cfg.get("slug"),maximum=200): errors.append("project name is not safe for public output")
    if type(cfg.get("identity_terms")) is not list or not cfg["identity_terms"] or any(not safe_public_text(value,maximum=200) for value in cfg["identity_terms"]): errors.append("identity_terms must contain safe nonempty repository identity strings")
    if type(cfg.get("run_meta_tests")) is not bool: errors.append("run_meta_tests must be boolean")
    errors.extend(repository_classification_errors(cfg.get("classification")))
    commands=cfg.get("commands")
    if type(commands) is not dict or set(commands)!={"install","start"} or any(type(commands.get(name)) is not list or not all(isinstance(part,str) and part for part in commands[name]) for name in ("install","start")): errors.append("commands must contain exactly install and start argv")
    profiles=cfg.get("profiles")
    if type(profiles) is not dict or not profiles: errors.append("profiles must be a nonempty object"); profiles={}
    for name,definition in profiles.items():
        if not isinstance(name,str) or not re.fullmatch(r"[a-z][a-z0-9-]*",name) or type(definition) is not dict or set(definition) not in ({"layer","commands"},{"layer","commands","unavailable"}): errors.append(f"profile {name} has unknown or missing keys"); continue
        if not _enum(definition.get("layer"),{"static","behavioral","system"}): errors.append(f"profile {name} has unknown layer")
        values=definition.get("commands")
        if type(values) is not list or any(type(command) is not list or not command or not all(isinstance(part,str) and part for part in command) for command in values): errors.append(f"profile {name} commands must contain nonempty argv arrays")
        if "unavailable" in definition and not safe_public_text(definition["unavailable"],maximum=500): errors.append(f"profile {name} unavailable remediation must be safe public text")
        if not values and "unavailable" not in definition: errors.append(f"profile {name} with no commands requires unavailable remediation")
    if any(definition.get("layer")=="system" and definition.get("commands") for definition in profiles.values() if isinstance(definition,dict)) and (not isinstance(commands,dict) or not commands.get("start")):
        errors.append("configured system profiles require a nonempty commands.start argv")
    gates=cfg.get("external_gates")
    if (type(gates) is not list or any(not isinstance(gate,str) or not re.fullmatch(r"[a-z][a-z0-9-]{0,63}",gate) for gate in gates) or
        len(gates)!=len(set(gates))):
        errors.append("external_gates must be unique canonical identifiers")
    authority=cfg.get("release_authority")
    if require_release_authority and (type(authority) is not dict or set(authority)!={"mode","role","required_for_release_readiness","publication"} or authority.get("mode")!="model" or authority.get("role")!="final_authority" or authority.get("required_for_release_readiness") is not True or authority.get("publication")!="explicit"): errors.append("release_authority must require model final_authority with explicit publication")
    return errors


def _routing_policy_schema_errors(value: object, schema: int) -> list[str]:
    """Validate one immutable routing-policy generation."""
    label=f"schema-{schema}"
    keys={"schema","objective","inventory_contract","selection_policy","work_profiles","authority_rules","core_rule"}
    if schema==5: keys.add("controller_preferences")
    if type(value) is not dict or set(value)!=keys or value.get("schema")!=schema:
        return [f"{label} routing policy is invalid"]
    if not all(safe_public_text(value.get(key),maximum=2000) for key in ("objective","core_rule")):
        return [f"{label} routing policy is invalid"]
    inventory_contract=value.get("inventory_contract")
    if type(inventory_contract) is not dict or set(inventory_contract)!={"schema","source","trust_boundary"} or type(inventory_contract.get("schema")) is not int or inventory_contract["schema"]!=1 or any(not safe_public_text(inventory_contract.get(key),maximum=2000) for key in ("source","trust_boundary")):
        return [f"{label} routing policy is invalid"]
    if schema==5:
        preferences=value.get("controller_preferences")
        if (type(preferences) is not dict or set(preferences)!={"schema","controller_labels","purposes","provider","model"}
            or preferences.get("schema")!=1
            or preferences.get("controller_labels")!=["codex-collaboration","local-codex"]
            or preferences.get("purposes")!=["planning","code_reviewer"]
            or preferences.get("provider")!="openai" or preferences.get("model")!="gpt-6.1-sol"):
            return ["schema-5 controller preference policy is invalid"]
    selection=value.get("selection_policy")
    roles=selection.get("roles") if type(selection) is dict else None
    if type(selection) is not dict or set(selection)!={"roles","rule"} or type(roles) is not dict or not roles or not safe_public_text(selection.get("rule"),maximum=2000):
        return [f"{label} routing policy is invalid"]
    for name,definition in roles.items():
        capabilities=definition.get("required_capabilities") if type(definition) is dict else None
        if (not safe_public_text(name,maximum=300) or type(definition) is not dict or set(definition)!={"required_capabilities","read_only","authority"} or
            type(capabilities) is not list or not capabilities or any(not safe_public_text(capability,maximum=300) for capability in capabilities) or
            type(definition.get("read_only")) is not bool or type(definition.get("authority")) is not bool):
            return [f"{label} routing policy is invalid"]
        if definition["read_only"] and "high-reasoning" not in capabilities:
            return [f"{label} review roles must require high-reasoning capability"]
    final=roles.get("final_authority")
    if type(final) is not dict or final.get("authority") is not True or final.get("read_only") is not True or not {"final-acceptance","high-reasoning"} <= set(final.get("required_capabilities",[])):
        return [f"{label} final authority policy is invalid"]
    mandatory={"code_reviewer":"code-review","editorial_reviewer":"editorial-review","security_reviewer":"security","final_authority":"final-acceptance"}
    for role,capability in mandatory.items():
        definition=roles.get(role)
        if (type(definition) is not dict or definition.get("read_only") is not True or
            definition.get("authority") is not (role=="final_authority") or
            not {capability,"high-reasoning"} <= set(definition["required_capabilities"])):
            return [f"{label} mandatory review roles are invalid"]
    profiles=value.get("work_profiles")
    if type(profiles) is not dict or set(profiles)!={"code","content"}:
        return [f"{label} routing policy is invalid"]
    for work_kind,profile in profiles.items():
        if type(profile) is not dict or set(profile)!={"builder_role","builder_capabilities","pipelines"} or not _enum(profile.get("builder_role"),roles) or profile["builder_role"]!=f"{work_kind}_builder" or type(profile.get("builder_capabilities")) is not list or any(not safe_public_text(capability,maximum=300) for capability in profile["builder_capabilities"]) or type(profile.get("pipelines")) is not dict or set(profile["pipelines"])!={"low","standard","high"}:
            return [f"{label} routing policy is invalid"]
        for risk,stages in profile["pipelines"].items():
            if type(stages) is not list or not stages or any(not _enum(stage,roles) or roles[stage]["read_only"] is not True for stage in stages) or len(stages)!=len(set(stages)):
                return [f"{label} routing policy is invalid"]
            if (stages[-1]!="final_authority" or
                (work_kind=="code" and stages[0]!="code_reviewer") or
                (work_kind=="content" and ("security_reviewer" in stages or "code_reviewer" in stages or (risk!="low" and stages[0]!="editorial_reviewer")))):
                return [f"{label} mandatory review pipeline is invalid"]
    authority=value.get("authority_rules")
    required_authority={"block_when_unavailable","reviews_are_read_only","distinct_models","cross_provider_review_preferred","security_is_code_only"}
    if type(authority) is not dict or set(authority)!=required_authority or any(authority.get(key) is not True for key in required_authority):
        return [f"{label} routing policy is invalid"]
    return []


def routing_policy_errors(value: object) -> list[str]:
    """Validate the current schema-5 policy for live execution."""
    return _routing_policy_schema_errors(value,5)


def historical_routing_policy_errors(value: object) -> list[str]:
    """Validate an immutable policy used by retained review evidence."""
    if isinstance(value,dict) and value.get("schema") in {4,5}:
        return _routing_policy_schema_errors(value,value["schema"])
    return ["historical routing policy schema is invalid"]


def controller_model_restriction(routing_policy: object, inventory: object, purpose: object) -> tuple[tuple[str,str] | None,list[str]]:
    """Resolve a policy-owned mandatory provider/model for one controller purpose."""
    if routing_policy_errors(routing_policy): return None,["routing controller preference policy is invalid"]
    if model_inventory_errors(inventory): return None,["routing inventory is invalid"]
    if not safe_public_text(purpose,maximum=300): return None,["routing purpose is invalid"]
    preferences=routing_policy["controller_preferences"]
    if inventory["controller"] not in preferences["controller_labels"] or purpose not in preferences["purposes"]:
        return None,[]
    return (preferences["provider"],preferences["model"]),[]


def routing_role_requirements(policy: object, role: object) -> tuple[tuple[str,...],bool] | None:
    """Return policy-owned capabilities and cross-provider preference for a role."""
    if routing_policy_errors(policy) or not isinstance(role,str):
        return None
    definition=policy["selection_policy"]["roles"].get(role)
    if type(definition) is not dict:
        return None
    return tuple(definition["required_capabilities"]), policy["authority_rules"]["cross_provider_review_preferred"]

def model_inventory_errors(value: object) -> list[str]:
    if type(value) is not dict or set(value)!={"schema","controller","models"} or value.get("schema")!=1 or not safe_public_text(value.get("controller"),maximum=300): return ["model inventory has an invalid schema or controller"]
    models=value.get("models")
    if type(models) is not list or not models: return ["model inventory requires at least one model"]
    keys={"id","provider","model","cost_rank","strength_rank","reasoning_efforts","capabilities","roles"}; seen=set(); errors=[]
    for item in models:
        if type(item) is not dict or set(item)!=keys: errors.append("inventory model has unknown or missing keys"); continue
        identifier=item.get("id")
        if not safe_public_text(identifier,maximum=300) or identifier in seen:
            errors.append("inventory model id must be unique and safe")
        elif isinstance(identifier,str):
            seen.add(identifier)
        if any(not safe_public_text(item.get(key),maximum=300) for key in ("provider","model")): errors.append("inventory model has invalid provider or model")
        if type(item.get("cost_rank")) is not int or item["cost_rank"]<1: errors.append("inventory model has invalid cost rank")
        if type(item.get("strength_rank")) is not int or item["strength_rank"]<1: errors.append("inventory model has invalid strength rank")
        if type(item.get("reasoning_efforts")) is not list or not item["reasoning_efforts"] or any(not isinstance(effort,str) or effort not in {"low","standard","high","max","ultra"} for effort in item["reasoning_efforts"]): errors.append("inventory model has invalid reasoning efforts")
        for key in ("capabilities","roles"):
            if type(item.get(key)) is not list or not item[key] or any(not safe_public_text(entry,maximum=300) for entry in item[key]): errors.append(f"inventory model has invalid {key}")
    return sorted(set(errors))

def model_binding_errors(value: object, *, role: str|None=None) -> list[str]:
    keys={"schema","auth_origin","run_id","agent_id","role","resolved_model_digest"}
    if type(value) is not dict or set(value)!=keys or value.get("schema")!=1 or value.get("auth_origin")!="trusted_launcher_observed": return ["model binding is invalid"]
    if role is not None and value.get("role")!=role: return ["model binding role is invalid"]
    if (any(not safe_public_text(value.get(key),maximum=300) for key in ("run_id","agent_id","role")) or
        not isinstance(value.get("resolved_model_digest"),str) or not DIGEST_PATTERN.fullmatch(value["resolved_model_digest"])):
        return ["model binding identity is invalid"]
    return []


def controller_inventory_binding_errors(value: object) -> list[str]:
    """Validate the immutable controller-owned inventory binding shape.

    A review may retain a copy of an inventory for auditability, but only this
    record can establish what the controller actually observed. Both the
    serial and batch controllers use the same content-addressed contract.
    """
    keys={"schema","auth_origin","run_id","inventory","inventory_digest"}
    if type(value) is not dict or set(value)!=keys or value.get("schema")!=1 or value.get("auth_origin")!="trusted_launcher_observed":
        return ["controller inventory binding is invalid"]
    if not safe_public_text(value.get("run_id"),maximum=300) or model_inventory_errors(value.get("inventory")):
        return ["controller inventory binding is invalid"]
    if not isinstance(value.get("inventory_digest"),str) or value["inventory_digest"]!=_canonical_digest(value["inventory"]):
        return ["controller inventory binding is invalid"]
    return []


def _valid_digest_collection(value: object) -> bool:
    return isinstance(value,(set,frozenset,list,tuple)) and all(isinstance(item,str) and DIGEST_PATTERN.fullmatch(item) for item in value)


def _valid_provider_model_collection(value: object) -> bool:
    """Validate provider/model aliases before routing can inspect them."""
    return isinstance(value,(set,frozenset,list,tuple)) and all(
        isinstance(item,tuple) and len(item)==2 and
        safe_public_text(item[0],maximum=300) and safe_public_text(item[1],maximum=300)
        for item in value
    )

def policy_ranked_model(
    inventory: object, *, role: str, required_capabilities: object,
    required_reasoning_effort: str, excluded_agent_ids: object=(),
    excluded_resolved_model_digests: object=(), resolved_model_digests: object=None,
    excluded_provider_models: object=(),
    preferred_provider: object=None, cross_provider_preferred: object=False,
    routing_policy: object=None, purpose: object=None,
) -> tuple[dict[str,object]|None,list[str]]:
    """Select one schema-5 route using policy inputs before strength ranking.

    ``resolved_model_digests`` is a controller-owned map from inventory agent
    IDs to immutable resolved identities. Its exclusions intentionally happen
    before ranking: an alias for an already-used model must not win the ranking
    and then prevent a distinct eligible alternative from being selected.
    """
    if model_inventory_errors(inventory):
        return None,["routing inventory is invalid"]
    if (not safe_public_text(role,maximum=300) or not isinstance(required_capabilities,(set,frozenset,list,tuple)) or
        not required_capabilities or any(not safe_public_text(capability,maximum=300) for capability in required_capabilities) or
        not isinstance(required_reasoning_effort,str) or
        required_reasoning_effort not in {"low","standard","high","max","ultra"}):
        return None,["routing policy inputs are invalid"]
    if not isinstance(excluded_agent_ids,(set,frozenset,list,tuple)) or any(not safe_public_text(agent,maximum=300) for agent in excluded_agent_ids):
        return None,["routing distinctness inputs are invalid"]
    if not _valid_digest_collection(excluded_resolved_model_digests):
        return None,["routing distinctness inputs are invalid"]
    if not _valid_provider_model_collection(excluded_provider_models):
        return None,["routing distinctness inputs are invalid"]
    require_trusted_identity=resolved_model_digests is not None
    if resolved_model_digests is None:
        resolved_model_digests={}
    if (type(resolved_model_digests) is not dict or
        any(not safe_public_text(agent,maximum=300) or not isinstance(digest,str) or not DIGEST_PATTERN.fullmatch(digest) for agent,digest in resolved_model_digests.items())):
        return None,["routing resolved identities are invalid"]
    if type(cross_provider_preferred) is not bool or (preferred_provider is not None and not safe_public_text(preferred_provider,maximum=300)):
        return None,["routing policy inputs are invalid"]
    if (routing_policy is None)!=(purpose is None): return None,["routing controller preference inputs are invalid"]
    restriction=None
    if routing_policy is not None:
        restriction,restriction_errors=controller_model_restriction(routing_policy,inventory,purpose)
        if restriction_errors: return None,restriction_errors
    required=set(required_capabilities); excluded_agents=set(excluded_agent_ids); excluded_digests=set(excluded_resolved_model_digests); excluded_runtime=set(excluded_provider_models)
    eligible=[
        model for model in inventory["models"]
        if model["id"] not in excluded_agents
        and (not require_trusted_identity or model["id"] in resolved_model_digests)
        and resolved_model_digests.get(model["id"]) not in excluded_digests
        and (model["provider"],model["model"]) not in excluded_runtime
        and role in model["roles"]
        and required <= set(model["capabilities"])
        and required_reasoning_effort in model["reasoning_efforts"]
        and (restriction is None or (model["provider"],model["model"])==restriction)
    ]
    if not eligible:
        if restriction is not None: return None,["routing mandatory controller model is unavailable or ineligible"]
        return None,["routing has no distinct eligible model"]
    if restriction is not None and require_trusted_identity and len({resolved_model_digests[model["id"]] for model in eligible})>1:
        return None,["routing mandatory controller model identity is ambiguous"]
    chosen=max(eligible,key=lambda model:(
        model["strength_rank"],
        cross_provider_preferred and model["provider"]!=preferred_provider,
        -model["cost_rank"],model["id"],
    ))
    return chosen,[]


def reviewer_selection_errors(value: object, *, reviewer_id: object) -> list[str]:
    """Validate durable reviewer routing without imposing identifier syntax on provider/model."""
    if type(value) is not dict or set(value)!={"id","provider","model"}:
        return ["reviewer selection is invalid"]
    if value.get("id")!=reviewer_id:
        return ["reviewer selection does not match reviewer identity"]
    if any(not safe_public_text(value.get(key),maximum=300) for key in ("id","provider","model")):
        return ["reviewer selection contains unsafe public text"]
    return []


def final_authority_routing_errors(
    inventory: object, selection: object, *, excluded_agent_ids: object=(),
    excluded_resolved_model_digests: object=(), resolved_model_digests: object=None,
    excluded_provider_models: object=(), preferred_provider: object=None, routing_policy: object=None,
) -> list[str]:
    """Choose the strongest final authority among routes still distinct from prior roles."""
    if model_inventory_errors(inventory):
        return ["final authority inventory is invalid"]
    keys={"id","provider","model","role","reasoning_effort","read_only","cross_provider","assurance"}
    if (type(selection) is not dict or set(selection)!=keys or selection.get("role")!="final_authority" or
        selection.get("reasoning_effort")!="high" or selection.get("read_only") is not True or
        type(selection.get("cross_provider")) is not bool or selection.get("assurance")!="strong" or
        any(not safe_public_text(selection.get(key),maximum=300) for key in ("id","provider","model","role","reasoning_effort","assurance"))):
        return ["final authority selection is invalid"]
    if not _valid_digest_collection(excluded_resolved_model_digests):
        return ["final authority distinctness inputs are invalid"]
    requirements=routing_role_requirements(routing_policy,"final_authority")
    if requirements is None:
        return ["final authority routing policy is invalid"]
    required_capabilities,cross_provider_preferred=requirements
    selected=next((model for model in inventory["models"] if (model["id"],model["provider"],model["model"])==(selection["id"],selection["provider"],selection["model"])),None)
    chosen,routing_errors=policy_ranked_model(
        inventory,role="final_authority",required_capabilities=required_capabilities,
        required_reasoning_effort="high",excluded_agent_ids=excluded_agent_ids,
        excluded_resolved_model_digests=excluded_resolved_model_digests,
        resolved_model_digests=resolved_model_digests,
        excluded_provider_models=excluded_provider_models,
        preferred_provider=preferred_provider,cross_provider_preferred=cross_provider_preferred,
        routing_policy=routing_policy,purpose="final_authority",
    )
    if routing_errors:
        if routing_errors==["routing has no distinct eligible model"]:
            return ["final authority selection is not distinct from a prior role"]
        return ["final authority distinctness inputs are invalid"]
    if selected is None:
        return ["final authority selection is absent from inventory"]
    if preferred_provider is not None and cross_provider_preferred and selection["cross_provider"]!=(selected["provider"]!=preferred_provider):
        return ["final authority selection is invalid"]
    if chosen is None or selected["id"]!=chosen["id"]:
        excluded_runtime=set(excluded_provider_models)
        if (selected["id"] in set(excluded_agent_ids) or
            (isinstance(resolved_model_digests,dict) and resolved_model_digests.get(selected["id"]) in set(excluded_resolved_model_digests)) or
            (selected["provider"],selected["model"]) in excluded_runtime):
            return ["final authority selection is not distinct from a prior role"]
        return ["final authority is not the strongest eligible model"]
    if "high-reasoning" not in selected["capabilities"]:
        return ["final authority selection is invalid"]
    return []
def prefix_evidence_errors(value: object, *, integration_head: str, profiles: list[str], project_profiles: object) -> list[str]:
    invalid=["batch source contains invalid prefix verification evidence"]
    if type(value) is not dict or set(value)!={"schema","integration_head","profiles"} or value.get("schema")!=1 or value.get("integration_head")!=integration_head or type(value.get("profiles")) is not list: return invalid
    if type(project_profiles) is not dict or [entry.get("profile") for entry in value["profiles"] if type(entry) is dict]!=profiles: return invalid
    for entry in value["profiles"]:
        if type(entry) is not dict or set(entry)!={"profile","commands_digest","checks","receipt_digest"} or not isinstance(entry.get("profile"),str) or entry["profile"] not in project_profiles: return invalid
        commands=project_profiles[entry["profile"]].get("commands") if type(project_profiles[entry["profile"]]) is dict else None
        if type(commands) is not list or entry.get("commands_digest")!=_canonical_digest(commands) or type(entry.get("checks")) is not list or len(entry["checks"])!=len(commands): return invalid
        for index,(check,command) in enumerate(zip(entry["checks"],commands)):
            if type(check) is not dict or set(check)!={"check_id","command_digest","exit_status","stdout_digest","stderr_digest"} or check.get("check_id")!=f"{entry['profile']}:{index}" or check.get("command_digest")!=_canonical_digest(command) or check.get("exit_status")!=0 or any(not isinstance(check.get(key),str) or not DIGEST_PATTERN.fullmatch(check[key]) for key in ("stdout_digest","stderr_digest")): return invalid
        if entry.get("receipt_digest")!=_canonical_digest({key:entry[key] for key in entry if key!="receipt_digest"}): return invalid
    return []

def _canonical_digest(value: object) -> str:
    return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(",",":"),ensure_ascii=True,allow_nan=False).encode()).hexdigest()


def _file_identity(metadata: os.stat_result) -> tuple[int,...]:
    return (metadata.st_dev,metadata.st_ino,metadata.st_mode,metadata.st_size,metadata.st_mtime_ns,metadata.st_ctime_ns)


def clean_git_snapshot(root: Path, refs: tuple[str,...] = (), *, capture_paths: tuple[str,...] = ()) -> tuple:
    """Bind actual regular worktree bytes to HEAD without refreshing the index.

    Status alone can trust cached stat data or assume-unchanged entries. Read
    every tracked blob through attached descriptors and compare it with HEAD.
    The returned token also detects equal-byte inode or directory replacement.
    """
    def read(*args, optional=False):
        result=subprocess.run(["git","--no-optional-locks",*args],cwd=root,capture_output=True,check=False)
        if result.returncode and not (optional and result.returncode==1):
            raise ValueError("batch source Git state is unavailable")
        return result.stdout
    def state():
        if read("status","--porcelain=v1","--untracked-files=all"):
            raise ValueError("batch source is dirty")
        return (read("rev-parse","HEAD").strip(),read("symbolic-ref","--short","-q","HEAD",optional=True).strip(),
                tuple((ref,read("rev-parse",ref).strip()) for ref in refs),read("ls-files","--stage","-z"))
    wanted={os.fsencode(path) for path in capture_paths}
    if len(wanted)!=len(capture_paths) or any(not path or path.startswith("/") or any(part in {"",".",".."} for part in path.split("/")) for path in capture_paths):
        raise ValueError("batch authority capture paths are invalid")
    before=state(); tree=read("ls-tree","-r","-z","--full-tree",before[0].decode("ascii")); entries=[]; captured=[]
    for record in filter(None,tree.split(b"\0")):
        metadata,separator,relative=record.partition(b"\t"); fields=metadata.split()
        if not separator or len(fields)!=3 or fields[0] not in {b"100644",b"100755"} or fields[1]!=b"blob":
            raise ValueError("batch source contains a nonregular tracked entry")
        parts=os.fsdecode(relative).split("/")
        if any(part in {"",".",".."} for part in parts): raise ValueError("batch source path is invalid")
        directories=[]; attachments=[]; descriptor=None
        try:
            directory=os.open(root,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0)); directories.append(directory)
            root_identity=_file_identity(os.fstat(directory))[:3]
            for part in parts[:-1]:
                child=os.open(part,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0),dir_fd=directory)
                directories.append(child); attachments.append((directory,part,child,_file_identity(os.fstat(child))[:3])); directory=child
            descriptor=os.open(parts[-1],os.O_RDONLY|getattr(os,"O_NOFOLLOW",0)|getattr(os,"O_NONBLOCK",0),dir_fd=directory)
            identity=_file_identity(os.fstat(descriptor))
            if not stat.S_ISREG(identity[2]) or bool(identity[2]&0o111)!=(fields[0]==b"100755") or identity!=_file_identity(os.stat(parts[-1],dir_fd=directory,follow_symlinks=False)):
                raise ValueError("batch source tracked file changed")
            blob=hashlib.sha1(f"blob {identity[3]}\0".encode()); digest=hashlib.sha256(); payload=bytearray() if relative in wanted else None
            while True:
                block=os.read(descriptor,1024*1024)
                if not block: break
                blob.update(block); digest.update(block)
                if payload is not None: payload.extend(block)
            if blob.hexdigest().encode()!=fields[2] or identity!=_file_identity(os.fstat(descriptor)) or identity!=_file_identity(os.stat(parts[-1],dir_fd=directory,follow_symlinks=False)):
                raise ValueError("batch source tracked bytes differ from the certified HEAD")
            if root_identity!=_file_identity(os.stat(root,follow_symlinks=False))[:3]: raise ValueError("batch source root changed")
            for parent,name,child,expected in attachments:
                if expected!=_file_identity(os.fstat(child))[:3] or expected!=_file_identity(os.stat(name,dir_fd=parent,follow_symlinks=False))[:3]:
                    raise ValueError("batch source parent changed")
            entries.append((relative,root_identity,tuple(item[3] for item in attachments),identity,digest.hexdigest()))
            if payload is not None: captured.append((os.fsdecode(relative),bytes(payload),digest.hexdigest()))
        finally:
            if descriptor is not None: os.close(descriptor)
            for directory in reversed(directories): os.close(directory)
    if state()!=before or read("ls-tree","-r","-z","--full-tree",before[0].decode("ascii"))!=tree:
        raise ValueError("batch source Git state changed while reading")
    for relative,root_identity,parents,identity,_digest in entries:
        path=root
        if _file_identity(os.stat(path,follow_symlinks=False))[:3]!=root_identity: raise ValueError("batch source root changed")
        for part,expected in zip(os.fsdecode(relative).split("/")[:-1],parents):
            path=path/part
            if _file_identity(os.stat(path,follow_symlinks=False))[:3]!=expected: raise ValueError("batch source parent changed")
        if _file_identity(os.stat(root/os.fsdecode(relative),follow_symlinks=False))!=identity:
            raise ValueError("batch source tracked file changed before snapshot completion")
    if wanted!={os.fsencode(item[0]) for item in captured}: raise ValueError("batch authority file is absent from the certified source")
    result=(before,tuple(entries))
    return result+(tuple(sorted(captured)),) if capture_paths else result


def _strict_json(payload: bytes) -> object:
    def pairs(items):
        value={}
        for key,item in items:
            if key in value: raise ValueError("duplicate JSON key")
            value[key]=item
        return value
    def constant(_value):
        raise ValueError("nonfinite JSON value")
    def finite_float(value):
        parsed=float(value)
        if not math.isfinite(parsed): raise ValueError("nonfinite JSON value")
        return parsed
    return json.loads(payload.decode("utf-8"),object_pairs_hook=pairs,parse_constant=constant,parse_float=finite_float)


def batch_authority_documents(snapshot: object) -> tuple[dict[str,object],dict[str,str]]:
    """Parse only authority bytes retained inside one clean-source snapshot."""
    if not isinstance(snapshot,tuple) or len(snapshot)!=3 or not isinstance(snapshot[2],tuple): raise ValueError("batch authority snapshot is invalid")
    captured={path:(payload,digest) for path,payload,digest in snapshot[2] if isinstance(path,str) and isinstance(payload,bytes) and isinstance(digest,str)}
    if set(captured)!=set(BATCH_AUTHORITY_PATHS): raise ValueError("batch authority snapshot is incomplete")
    documents={path:_strict_json(captured[path][0]) for path in BATCH_AUTHORITY_PATHS}
    digests={path:captured[path][1] for path in BATCH_AUTHORITY_PATHS}
    if strict_batch_policy_errors(documents["harness/batch-policy.json"]): raise ValueError("batch source policy binding is stale or invalid")
    if project_contract_errors(documents["harness/project.json"]): raise ValueError("batch source project contract is invalid")
    if routing_policy_errors(documents["harness/model-routing.json"]): raise ValueError("batch source routing policy is invalid")
    if review_policy_errors(documents["harness/review-policy.json"]): raise ValueError("batch source review policy is invalid")
    feature=documents["feature_list.json"]
    if type(feature) is not dict or type(feature.get("features")) is not list: raise ValueError("batch source feature authority is invalid")
    return documents,digests


def batch_review_scope_digest(request: object, feature_id: object) -> str | None:
    if type(request) is not dict or not isinstance(feature_id,str): return None
    try:
        scope={"request_id":request["request_id"],"request_digest":_canonical_digest({key:value for key,value in request.items() if key!="state"}),"feature_id":feature_id,"strategy":request["strategy"],"base_commit":request["base_commit"],"dependencies":request["dependencies"][feature_id],"classification":request["classifications"][feature_id]}
        return _canonical_digest(scope)
    except (KeyError,TypeError,ValueError):
        return None


def batch_builder_routing_errors(inventory: object, selection: object, *, classification: object, routing_policy: object, resolved_identities: object, selected_model_digest: object) -> list[str]:
    """Enforce the classification-owned, cheapest eligible builder route."""
    if model_inventory_errors(inventory) or feature_classification_errors(classification) or routing_policy_errors(routing_policy): return ["batch builder routing is invalid"]
    if type(selection) is not dict or set(selection)!={"id","provider","model"} or any(not safe_public_text(selection.get(key),maximum=300) for key in selection): return ["batch builder selection is invalid"]
    if type(resolved_identities) is not dict or resolved_identities.get(selection["id"])!=selected_model_digest or not isinstance(selected_model_digest,str) or not DIGEST_PATTERN.fullmatch(selected_model_digest): return ["batch builder identity is ambiguous or unavailable"]
    profile=routing_policy["work_profiles"].get(classification["work_kind"])
    if type(profile) is not dict: return ["batch builder routing is invalid"]
    role=profile.get("builder_role"); role_requirements=routing_role_requirements(routing_policy,role)
    if role_requirements is None: return ["batch builder routing is invalid"]
    required=set(role_requirements[0])|set(profile.get("builder_capabilities",[]))
    eligible=[model for model in inventory["models"] if model["id"] in resolved_identities and role in model["roles"] and required<=set(model["capabilities"])]
    selected=next((model for model in eligible if all(model[key]==selection[key] for key in ("id","provider","model"))),None)
    if selected is None: return ["batch builder lacks the classification role or capabilities"]
    if selected["cost_rank"]!=min(model["cost_rank"] for model in eligible): return ["batch builder is not a cheapest eligible model"]
    return []


def batch_review_evidence_errors(review: object, *, request: object, feature_id: str, reviewer_role: str, review_policy_digest: object) -> list[str]:
    if type(review) is not dict: return ["batch review evidence is invalid"]
    requirement=request.get("requirements",{}).get(feature_id) if isinstance(request,dict) else None
    if review.get("requirement_digest")!=requirement or not isinstance(requirement,str) or not DIGEST_PATTERN.fullmatch(requirement): return ["batch review requirement binding is stale"]
    if review.get("scope_digest")!=batch_review_scope_digest(request,feature_id): return ["batch review scope binding is stale"]
    if review.get("review_policy_digest")!=review_policy_digest or not isinstance(review_policy_digest,str) or not DIGEST_PATTERN.fullmatch(review_policy_digest): return ["batch review policy binding is stale"]
    assessment=review.get("quality_assessment")
    if reviewer_role=="code_reviewer":
        errors=review_quality_errors(assessment)
        if errors: return errors
        if review.get("outcome")!=assessment["outcome"]: return ["batch review outcome does not match quality evidence"]
    elif assessment is not None or review.get("outcome")!="pass":
        return ["non-code batch review has invalid quality evidence"]
    return []


def batch_review_readiness_errors(review: object) -> list[str]:
    """Keep valid adverse evidence distinct from approval authority."""
    return ["batch code quality review blocks readiness"] if isinstance(review,dict) and review.get("outcome")=="blocked" else []


def _read_regular_at(directory: int, name: str) -> tuple[object,tuple[int,...],str]:
    before_path=os.stat(name,dir_fd=directory,follow_symlinks=False)
    descriptor=os.open(name,os.O_RDONLY|getattr(os,"O_NOFOLLOW",0)|getattr(os,"O_NONBLOCK",0),dir_fd=directory)
    try:
        before=os.fstat(descriptor)
        if not stat.S_ISREG(before.st_mode) or before.st_size>MAX_BATCH_STATE_BYTES or _file_identity(before)!=_file_identity(before_path):
            raise ValueError("private record is unsafe")
        payload=bytearray()
        while True:
            block=os.read(descriptor,65536)
            if not block: break
            payload.extend(block)
            if len(payload)>MAX_BATCH_STATE_BYTES: raise ValueError("private record is oversized")
        after=os.fstat(descriptor); after_path=os.stat(name,dir_fd=directory,follow_symlinks=False)
        if _file_identity(before)!=_file_identity(after) or _file_identity(before_path)!=_file_identity(after_path):
            raise ValueError("private record changed while reading")
        return _strict_json(bytes(payload)),_file_identity(after),hashlib.sha256(payload).hexdigest()
    finally:
        os.close(descriptor)


def _private_namespace_snapshot(common: Path, namespace: str, *, batch: bool, allow_missing: bool=False) -> tuple[dict[str,object],tuple]:
    """Read a complete identity-bound namespace and recheck its attachments.

    The token includes membership, inode/ctime identity, and exact bytes; an
    alias-map comparison alone cannot detect added ambiguous bindings.
    """
    allowed={"model-bindings","batches","requests","reviews","certifications","prefix-evidence"} if batch else {"model-bindings","controller-inventory","local-model-bindings","local-model-availability","local-controller-inventory"}
    if namespace not in allowed:
        raise ValueError("private namespace is invalid")
    descriptors=[]; attachments=[]; records={}; entries=[]
    try:
        descriptor=os.open(common,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0)); descriptors.append(descriptor)
        root_identity=_file_identity(os.fstat(descriptor))
        missing=None
        parts=("repository-agent-session","batch-v2",namespace) if batch else ("repository-agent-session",namespace)
        for part in parts:
            try:
                child=os.open(part,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0),dir_fd=descriptor)
            except FileNotFoundError:
                if not allow_missing: raise
                # A dangling symlink is unsafe, not an absent namespace.
                try: os.stat(part,dir_fd=descriptor,follow_symlinks=False)
                except FileNotFoundError: pass
                else: raise ValueError("private namespace is unsafe")
                missing=(descriptor,part); break
            descriptors.append(child)
            metadata=os.fstat(child); identity=_file_identity(metadata)
            if not stat.S_ISDIR(metadata.st_mode) or metadata.st_uid!=os.geteuid() or metadata.st_mode & 0o022:
                raise ValueError("private namespace permissions are unsafe")
            if identity!=_file_identity(os.stat(part,dir_fd=descriptor,follow_symlinks=False)):
                raise ValueError("private namespace was replaced")
            attachments.append((descriptor,part,child,identity)); descriptor=child
        if missing is None:
            names=sorted(os.listdir(descriptor))
            pattern=r"[a-z][a-z0-9-]{0,31}\.json" if namespace=="batches" else r"[a-z][a-z0-9-]{0,63}\.json" if namespace=="requests" else r"[0-9a-f]{64}\.json"
            if namespace in {"controller-inventory","local-controller-inventory"}: pattern=r"(?:current|[0-9a-f]{64})\.json"
            for name in names:
                if not re.fullmatch(pattern,name): raise ValueError("private namespace has an invalid entry")
                value,identity,digest=_read_regular_at(descriptor,name)
                records[name[:-5]]=value; entries.append((name,identity,digest))
            if sorted(os.listdir(descriptor))!=names:
                raise ValueError("private namespace membership changed")
            for name,identity,_digest in entries:
                if identity!=_file_identity(os.stat(name,dir_fd=descriptor,follow_symlinks=False)):
                    raise ValueError("private namespace entry changed")
        else:
            try: os.stat(missing[1],dir_fd=missing[0],follow_symlinks=False)
            except FileNotFoundError: pass
            else: raise ValueError("private namespace appeared while reading")
        if root_identity!=_file_identity(os.fstat(descriptors[0])) or root_identity!=_file_identity(os.stat(common,follow_symlinks=False)):
            raise ValueError("private namespace root changed")
        for parent,name,child,identity in attachments:
            if identity!=_file_identity(os.fstat(child)) or identity!=_file_identity(os.stat(name,dir_fd=parent,follow_symlinks=False)):
                raise ValueError("private namespace attachment changed")
        token=(root_identity,tuple((name,identity) for _parent,name,_child,identity in attachments),missing[1] if missing else None,tuple(entries))
        return records,token
    except (OSError,UnicodeError,ValueError,RecursionError) as exc:
        raise ValueError("private namespace is unavailable or changed") from exc
    finally:
        for descriptor in reversed(descriptors): os.close(descriptor)


def batch_namespace_snapshot(common: Path, namespace: str, *, allow_missing: bool=False) -> tuple[dict[str,object],tuple]:
    return _private_namespace_snapshot(common,namespace,batch=True,allow_missing=allow_missing)


def session_namespace_snapshot(common: Path, namespace: str, *, allow_missing: bool=False) -> tuple[dict[str,object],tuple]:
    return _private_namespace_snapshot(common,namespace,batch=False,allow_missing=allow_missing)


def batch_certification_context_digest(manifest: dict, *, pending: bool=False) -> str:
    """Bind every batch field except the certification's self-reference/state."""
    integration={key:value for key,value in manifest["integration"].items() if key not in {"state","evidence_ref"}}
    return _canonical_digest({**manifest,"integration":integration,"sequence":manifest["sequence"]+int(pending)})


def model_binding_identity_map(records: object) -> dict[str,str] | None:
    """Resolve immutable bindings while permanently dropping ambiguous aliases."""
    if type(records) is not dict:
        return None
    identities={}; ambiguous=set()
    for reference,value in records.items():
        if not isinstance(reference,str) or not DIGEST_PATTERN.fullmatch(reference) or model_binding_errors(value) or _canonical_digest(value)!=reference:
            return None
        assert isinstance(value,dict)
        agent=value["agent_id"]; resolved=value["resolved_model_digest"]
        if agent in identities and identities[agent]!=resolved:
            identities.pop(agent); ambiguous.add(agent)
        elif agent not in ambiguous:
            identities[agent]=resolved
    return identities


def model_binding_identity_snapshot(common: Path) -> tuple[dict[str,str],tuple]:
    """Read and validate the complete trusted model-binding namespace."""
    records,snapshot=batch_namespace_snapshot(common,"model-bindings")
    identities=model_binding_identity_map(records)
    if identities is None:
        raise ValueError("trusted model bindings are unavailable")
    return identities,snapshot


def _all_model_binding_identity_map(common: Path) -> dict[str,str] | None:
    try:
        identities,_snapshot=model_binding_identity_snapshot(common)
    except ValueError:
        return None
    return identities


def _final_authority_errors(value: object, *, integration_head: str, prefix_evidence_ref: str, review_refs: list[str], profiles: list[str], used_model_digests: set[str], used_agent_ids: set[str], model_binding: object, inventory_binding: object=None, routing_policy: object=None, preferred_provider: object=None, resolved_model_digests: object=None, excluded_provider_models: object=()) -> list[str]:
    keys={"schema","decision","inventory","inventory_digest","inventory_binding_ref","selection","model_binding_ref","resolved_model_digest","evidence_digest","findings"}
    if type(value) is not dict or set(value)!=keys or value.get("schema")!=1 or not _enum(value.get("decision"),{"approval","advisory","blocked"}):
        return ["batch source contains an invalid certification"]
    inventory=value["inventory"]
    if not all(isinstance(value.get(key),str) and DIGEST_PATTERN.fullmatch(value[key]) for key in ("inventory_digest","inventory_binding_ref","model_binding_ref","resolved_model_digest","evidence_digest")) or not isinstance(used_model_digests,set) or any(not isinstance(item,str) or not DIGEST_PATTERN.fullmatch(item) for item in used_model_digests): return ["batch source contains an invalid certification"]
    if model_inventory_errors(inventory): return ["batch source contains an invalid certification"]
    if not isinstance(value.get("inventory_digest"),str) or value["inventory_digest"]!=_canonical_digest(inventory):
        return ["batch source contains an invalid certification"]
    if inventory_binding is None or controller_inventory_binding_errors(inventory_binding) or _canonical_digest(inventory_binding)!=value.get("inventory_binding_ref") or inventory_binding.get("inventory")!=inventory: return ["batch source contains an invalid certification"]
    if type(resolved_model_digests) is not dict:
        return ["batch source contains an invalid certification"]
    if final_authority_routing_errors(inventory,value.get("selection"),excluded_agent_ids=used_agent_ids,excluded_resolved_model_digests=used_model_digests,resolved_model_digests=resolved_model_digests,excluded_provider_models=excluded_provider_models,routing_policy=routing_policy,preferred_provider=preferred_provider):
        return ["batch source contains an invalid certification"]
    selection=value.get("selection")
    if not isinstance(selection,dict) or model_binding_errors(model_binding,role="final_authority") or model_binding.get("agent_id")!=selection.get("id") or _canonical_digest(model_binding)!=value.get("model_binding_ref") or value.get("resolved_model_digest")!=model_binding.get("resolved_model_digest") or value["resolved_model_digest"] in used_model_digests:
        return ["batch source contains an invalid certification"]
    if resolved_model_digests.get(selection["id"])!=value["resolved_model_digest"]:
        return ["batch source final authority identity is ambiguous"]
    if not isinstance(value.get("evidence_digest"),str) or value["evidence_digest"]!=_canonical_digest({"integration_head":integration_head,"prefix_evidence_ref":prefix_evidence_ref,"review_refs":review_refs,"profiles":profiles}):
        return ["batch source contains an invalid certification"]
    findings=value["findings"]
    if not isinstance(findings,list) or any(type(finding) is not dict or set(finding)!={"severity","summary","evidence"} or not _enum(finding.get("severity"),{"material","advisory"}) or not _safe_record_text(finding.get("summary")) or not _safe_record_text(finding.get("evidence")) for finding in findings):
        return ["batch source contains an invalid certification"]
    decision="blocked" if any(finding["severity"]=="material" for finding in findings) else "advisory" if findings else "approval"
    return [] if value["decision"]==decision and decision!="blocked" else ["batch source contains an invalid certification"]

def _request_classifications_valid(request: object) -> bool:
    if type(request) is not dict:
        return False
    membership=request.get("membership")
    classifications=request.get("classifications")
    return (
        isinstance(membership,list)
        and all(isinstance(member,str) for member in membership)
        and isinstance(classifications,dict)
        and set(classifications)==set(membership)
        and all(isinstance(member,str) and FEATURE_ID_PATTERN.fullmatch(member) and not feature_classification_errors(classifications[member]) for member in membership)
    )


def batch_request_shape_errors(value: object) -> list[str]:
    """Authenticate all schema-2 request fields without inventing ledger digests."""
    invalid=["batch source contains an invalid request"]
    identifier=lambda item:isinstance(item,str) and re.fullmatch(r"[a-z][a-z0-9-]{0,63}",item)
    feature=lambda item:isinstance(item,str) and FEATURE_ID_PATTERN.fullmatch(item)
    digest=lambda item:isinstance(item,str) and DIGEST_PATTERN.fullmatch(item)
    if type(value) is not dict or set(value)!=REQUEST_KEYS or type(value.get("schema")) is not int or value["schema"]!=2 or not identifier(value.get("request_id")):
        return invalid
    members=value.get("membership")
    if type(members) is not list or not 1<=len(members)<=MAX_BATCH_MEMBERS or not all(feature(member) for member in members) or len(members)!=len(set(members)):
        return invalid
    if (not _enum(value.get("strategy"),{"parallel","serial","single"}) or
        (len(members)==1)!=(value["strategy"]=="single") or
        type(value.get("max_workers")) is not int or not 1<=value["max_workers"]<=MAX_BATCH_WORKERS or
        not isinstance(value.get("base_commit"),str) or not COMMIT_PATTERN.fullmatch(value["base_commit"]) or
        not _enum(value.get("state"),{"active","terminal_pending","blocked","exhausted"}) or
        not isinstance(value.get("created_at"),str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z",value["created_at"])):
        return invalid
    try: dt.datetime.strptime(value["created_at"],"%Y-%m-%dT%H:%M:%S.%fZ")
    except ValueError: return invalid
    requirements=value.get("requirements"); dependencies=value.get("dependencies")
    if (type(requirements) is not dict or set(requirements)!=set(members) or not all(digest(item) for item in requirements.values()) or
        type(dependencies) is not dict or set(dependencies)!=set(members) or
        any(type(items) is not list or not all(feature(item) for item in items) or len(items)!=len(set(items)) for items in dependencies.values()) or
        not _request_classifications_valid(value)):
        return invalid
    pending=set(members)
    while pending:
        ready={member for member in pending if not (set(dependencies[member]) & pending)}
        if not ready: return invalid
        pending-=ready
    return []


def _terminal_worker_errors(manifest: dict, request: dict) -> list[str]:
    invalid=["batch source contains an invalid batch"]
    identifier=lambda item:isinstance(item,str) and re.fullmatch(r"[a-z][a-z0-9-]{0,63}",item)
    commit=lambda item:isinstance(item,str) and COMMIT_PATTERN.fullmatch(item)
    digest=lambda item:isinstance(item,str) and DIGEST_PATTERN.fullmatch(item)
    integration=manifest["integration"]
    if not identifier(integration.get("worktree_token")) or manifest.get("operation") is not None:
        return invalid
    workers=manifest.get("workers"); ids=set(); tokens={integration["worktree_token"]}
    if type(workers) is not list or len(workers)!=len(request["membership"]): return invalid
    for member,worker in zip(request["membership"],workers):
        if (type(worker) is not dict or set(worker)!=WORKER_KEYS or worker.get("feature_id")!=member or
            not identifier(worker.get("worker_id")) or worker["worker_id"] in ids or
            not identifier(worker.get("worktree_token")) or worker["worktree_token"] in tokens or
            worker.get("branch")!=f"codex/batch/{manifest['batch_id']}--{member}" or
            worker.get("classification")!=request["classifications"][member] or
            worker.get("task_scope_digest")!=request["requirements"][member] or
            worker.get("initial_requirement_digest")!=request["requirements"][member] or
            worker.get("start_commit")!=request["base_commit"] or worker.get("state")!="integrated" or
            worker.get("blocked_reason") is not None or not commit(worker.get("candidate_commit")) or
            not isinstance(worker.get("controller_run_id"),str) or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._:-]{0,127}",worker["controller_run_id"]) or
            not all(digest(worker.get(key)) for key in ("builder_binding_ref","builder_model_digest")) or
            type(worker.get("review_runs")) is not list or not all(digest(item) for item in worker["review_runs"]) or len(worker["review_runs"])!=len(set(worker["review_runs"]))):
            return invalid
        head=worker.get("dependency_prefix_head"); prefix=worker.get("dependency_prefix_digest")
        if (head is None)!=(prefix is None) or (head is not None and (not commit(head) or not digest(prefix))): return invalid
        ids.add(worker["worker_id"]); tokens.add(worker["worktree_token"])
    return []


def batch_review_stage_routing_errors(inventory: object, selection: object, *, role: str, routing_policy: object, excluded_agent_ids: object, excluded_model_digests: object, resolved_identities: object, excluded_provider_models: object, preferred_provider: object, selected_model_digest: object) -> list[str]:
    requirements=routing_role_requirements(routing_policy,role)
    if requirements is None or not isinstance(selection,dict) or reviewer_selection_errors(selection,reviewer_id=selection.get("id")):
        return ["batch review routing is invalid"]
    if not isinstance(resolved_identities,dict) or resolved_identities.get(selection["id"])!=selected_model_digest:
        return ["batch review identity is ambiguous or unavailable"]
    chosen,errors=policy_ranked_model(inventory,role=role,required_capabilities=requirements[0],required_reasoning_effort="high",excluded_agent_ids=excluded_agent_ids,excluded_resolved_model_digests=excluded_model_digests,resolved_model_digests=resolved_identities,excluded_provider_models=excluded_provider_models,preferred_provider=preferred_provider,cross_provider_preferred=requirements[1],routing_policy=routing_policy,purpose=role)
    if errors or chosen is None or any(selection[key]!=chosen[key] for key in ("id","provider","model")):
        return ["batch review is not the current strongest eligible high-reasoning model"]
    return []


def _batch_manifest_shape_errors(common: Path,value: object,project: object,routing_policy: object, *, feature_document: object=None, batch_policy: object=None, review_policy_digest: object=None) -> list[str]:
    """Reject incomplete hand-written terminal batch records."""
    project_profiles=project.get("profiles") if isinstance(project,dict) else None
    if type(value) is not dict or set(value)!=MANIFEST_KEYS or type(value.get("schema")) is not int or value["schema"]!=2 or not isinstance(value.get("batch_id"),str) or not BATCH_ID_PATTERN.fullmatch(value["batch_id"]):
        return ["batch source contains an invalid batch"]
    if not isinstance(value.get("request_id"),str) or not re.fullmatch(r"[a-z][a-z0-9-]{0,63}",value["request_id"]):
        return ["batch source contains an invalid batch"]
    if not all(isinstance(value.get(key),str) and DIGEST_PATTERN.fullmatch(value[key]) for key in ("request_digest","policy_digest","controller_digest")) or not isinstance(value.get("base_commit"),str) or not COMMIT_PATTERN.fullmatch(value["base_commit"]) or not isinstance(value.get("base_branch"),str) or not value["base_branch"].startswith("refs/heads/") or not isinstance(value.get("sequence"),int) or isinstance(value["sequence"],bool) or value["sequence"]<0:
        return ["batch source contains an invalid batch"]
    if strict_batch_policy_errors(batch_policy) or batch_policy.get("schema")!=2 or value["policy_digest"]!=_canonical_digest(batch_policy):
        return ["batch source policy binding is stale or invalid"]
    integration=value.get("integration")
    if type(integration) is not dict or set(integration)!=INTEGRATION_KEYS or integration.get("branch")!=f"codex/batch/{value['batch_id']}" or not isinstance(integration.get("worktree_token"),str) or not isinstance(integration.get("head"),str) or not COMMIT_PATTERN.fullmatch(integration["head"]) or not _enum(integration.get("state"),{"verified_final","certified"}) or not isinstance(integration.get("prefix_evidence_ref"),str) or not DIGEST_PATTERN.fullmatch(integration["prefix_evidence_ref"]) or not isinstance(integration.get("evidence_ref"),str) or not DIGEST_PATTERN.fullmatch(integration["evidence_ref"]):
        return ["batch source contains an invalid batch"]
    certification=_read_certification(common,integration["evidence_ref"])
    if certification is None:
        return ["batch source contains an invalid certification"]
    certification_keys={"schema","batch_id","request_id","integration_head","source_base_commit","prefix_evidence_ref","review_refs","profiles","outcome","reviewer_id","final_authority","certification_digest","batch_context_digest"}
    if (type(certification) is not dict or type(certification.get("schema")) is not int or certification["schema"]!=2 or
        certification.get("batch_context_digest")!=batch_certification_context_digest(value)):
        return ["batch source certification context is invalid; recertification is required"]
    if (not isinstance(certification,dict) or set(certification)!=certification_keys or certification.get("batch_id")!=value["batch_id"] or certification.get("request_id")!=value["request_id"] or certification.get("integration_head")!=integration["head"] or certification.get("source_base_commit")!=value["base_commit"] or certification.get("prefix_evidence_ref")!=integration["prefix_evidence_ref"] or certification.get("outcome")!="pass" or not safe_public_text(certification.get("reviewer_id"),maximum=300) or not isinstance(certification.get("review_refs"),list) or not all(isinstance(item,str) and DIGEST_PATTERN.fullmatch(item) for item in certification["review_refs"]) or not isinstance(certification.get("profiles"),list) or not certification["profiles"] or not all(safe_public_text(item,maximum=300) for item in certification["profiles"]) or certification.get("certification_digest")!=integration["evidence_ref"] or hashlib.sha256(json.dumps({key:certification[key] for key in sorted(certification) if key!="certification_digest"},sort_keys=True,separators=(",",":")).encode()).hexdigest()!=integration["evidence_ref"]):
        return ["batch source contains an invalid certification"]
    prefix_record=_read_batch_record(common,"prefix-evidence",integration["prefix_evidence_ref"])
    if prefix_record is None or _canonical_digest(prefix_record)!=integration["prefix_evidence_ref"] or prefix_evidence_errors(prefix_record,integration_head=integration["head"],profiles=certification["profiles"],project_profiles=project_profiles):
        return ["batch source contains invalid prefix verification evidence"]
    request=_read_batch_record(common,"requests",value["request_id"])
    if (batch_request_shape_errors(request) or request["request_id"]!=value["request_id"] or request["base_commit"]!=value["base_commit"] or
        _canonical_digest({key:item for key,item in request.items() if key!="state"})!=value["request_digest"] or
        request["state"]!="active" or _terminal_worker_errors(value,request)):
        return ["batch source contains an invalid batch"]
    if type(feature_document) is not dict or type(feature_document.get("features")) is not list:
        return ["batch source feature authority is invalid"]
    entries={entry["id"]:entry for entry in feature_document["features"] if type(entry) is dict and isinstance(entry.get("id"),str)}
    required_profiles=set()
    for member in request["membership"]:
        entry=entries.get(member)
        if (type(entry) is not dict or entry.get("depends_on")!=request["dependencies"][member] or
            {key:entry.get(key) for key in FEATURE_CLASSIFICATION_KEYS}!=request["classifications"][member] or
            type(entry.get("required_profiles")) is not list or not entry["required_profiles"] or
            any(not isinstance(name,str) or name not in project_profiles for name in entry["required_profiles"]) or
            any(dependency not in request["membership"] and (type(entries.get(dependency)) is not dict or entries[dependency].get("status")!="passing") for dependency in request["dependencies"][member])):
            return ["batch source feature authority is invalid"]
        required_profiles.update(entry["required_profiles"])
    if certification["profiles"]!=sorted(required_profiles): return ["batch source profile authority is invalid"]
    try:
        resolved_identities,_identity_snapshot=model_binding_identity_snapshot(common)
    except ValueError:
        return ["batch source model bindings are invalid"]
    final=certification["final_authority"]
    inventory_binding=_read_current_controller_inventory_binding(common,final.get("inventory_binding_ref","")) if isinstance(final,dict) else None
    if inventory_binding is None: return ["batch source controller inventory is stale"]
    inventory=inventory_binding["inventory"]
    workers=value.get("workers")
    if not isinstance(workers,list) or len(workers)!=len(request["membership"]):
        return ["batch source contains an invalid batch"]
    worker_review_refs=[]; review_providers=[]; final_authority_excluded_models=set(); final_authority_excluded_agents=set(); final_authority_excluded_runtime=set()
    for member,worker in zip(request["membership"],workers):
        if type(worker) is not dict or set(worker)!=WORKER_KEYS or worker.get("feature_id")!=member or worker.get("classification")!=request["classifications"][member] or worker.get("branch")!=f"codex/batch/{value['batch_id']}--{member}" or worker.get("state")!="integrated" or not isinstance(worker.get("worker_id"),str) or not re.fullmatch(r"[a-z][a-z0-9-]{0,63}",worker["worker_id"]) or not isinstance(worker.get("worktree_token"),str) or not isinstance(worker.get("start_commit"),str) or not COMMIT_PATTERN.fullmatch(worker["start_commit"]) or not all(isinstance(worker.get(key),str) and DIGEST_PATTERN.fullmatch(worker[key]) for key in ("task_scope_digest","initial_requirement_digest","builder_binding_ref","builder_model_digest")) or not isinstance(worker.get("candidate_commit"),str) or not COMMIT_PATTERN.fullmatch(worker["candidate_commit"]) or not isinstance(worker.get("review_runs"),list) or len(worker["review_runs"])!=len(set(worker["review_runs"])) or not all(isinstance(item,str) and DIGEST_PATTERN.fullmatch(item) for item in worker["review_runs"]):
            return ["batch source contains an invalid batch"]
        stages=required_review_pipeline(worker["classification"],routing_policy,project)
        if stages is None or len(worker["review_runs"])!=len(stages):
            return ["batch source contains an incomplete review pipeline"]
        worker_review_refs.extend(worker["review_runs"])
        feature_models={worker["builder_model_digest"]}; seen_agents={worker["worker_id"]}; seen_bindings={worker["builder_binding_ref"]}
        builder_selection=None
        if worker["review_runs"]:
            first_review=_read_batch_record(common,"reviews",worker["review_runs"][0])
            if not isinstance(first_review,dict): return ["batch source contains an invalid review"]
            builder_selection=first_review.get("builder_selection")
        if batch_builder_routing_errors(inventory,builder_selection,classification=worker["classification"],routing_policy=routing_policy,resolved_identities=resolved_identities,selected_model_digest=worker["builder_model_digest"]):
            return ["batch source builder routing is invalid"]
        builder=next((model for model in inventory["models"] if model["id"]==builder_selection["id"]),None)
        if builder is None or builder["id"]!=worker["worker_id"]: return ["batch source builder routing is invalid"]
        feature_runtime={(builder["provider"],builder["model"])}; preferred_provider=builder["provider"]
        final_authority_excluded_runtime.update(feature_runtime)
        final_authority_excluded_models.add(worker["builder_model_digest"]); final_authority_excluded_agents.add(worker["worker_id"])
        for stage,review_ref in enumerate(worker["review_runs"]):
            review=_read_batch_record(common,"reviews",review_ref)
            if not isinstance(review,dict):
                return ["batch source contains an invalid review"]
            selection=review.get("reviewer_selection")
            builder_binding=_read_batch_record(common,"model-bindings",review.get("builder_binding_ref", "")); reviewer_binding=_read_batch_record(common,"model-bindings",review.get("reviewer_binding_ref", ""))
            if (review.get("reasoning_effort")!="high" or review.get("read_only") is not True or
                not isinstance(builder_binding,dict) or builder_binding.get("run_id")!=worker["controller_run_id"] or
                batch_review_stage_routing_errors(inventory,selection,role=stages[stage],routing_policy=routing_policy,excluded_agent_ids=seen_agents,excluded_model_digests=feature_models,resolved_identities=resolved_identities,excluded_provider_models=feature_runtime,preferred_provider=preferred_provider,selected_model_digest=review.get("resolved_model_digest"))):
                return ["batch source contains an invalid review routing or builder run"]
            if (set(review)!=REVIEW_RECORD_KEYS or review.get("schema")!=1 or review.get("review_digest")!=review_ref or review.get("feature_id")!=member or review.get("candidate_commit")!=worker.get("candidate_commit") or review.get("builder_selection")!=builder_selection or type(review.get("stage")) is not int or review["stage"]!=stage or review.get("reviewer_role")!=stages[stage] or review.get("builder_binding_ref")!=worker["builder_binding_ref"] or review.get("builder_model_digest")!=worker["builder_model_digest"] or batch_review_evidence_errors(review,request=request,feature_id=member,reviewer_role=stages[stage],review_policy_digest=review_policy_digest) or batch_review_readiness_errors(review) or not isinstance(review.get("resolved_model_digest"),str) or not DIGEST_PATTERN.fullmatch(review["resolved_model_digest"]) or not isinstance(review.get("reviewer_id"),str) or not re.fullmatch(r"[a-z][a-z0-9-]{0,63}",review["reviewer_id"]) or review["reviewer_id"] in seen_agents or reviewer_selection_errors(selection,reviewer_id=review["reviewer_id"]) or model_binding_errors(builder_binding,role="builder") or builder_binding.get("agent_id")!=worker["worker_id"] or _canonical_digest(builder_binding)!=review["builder_binding_ref"] or model_binding_errors(reviewer_binding,role=stages[stage]) or reviewer_binding.get("agent_id")!=review["reviewer_id"] or _canonical_digest(reviewer_binding)!=review["reviewer_binding_ref"] or review["reviewer_binding_ref"] in seen_bindings or review.get("builder_model_digest")!=builder_binding.get("resolved_model_digest") or review.get("resolved_model_digest")!=reviewer_binding.get("resolved_model_digest") or review["resolved_model_digest"] in feature_models or _canonical_digest({key:review[key] for key in review if key!="review_digest"})!=review_ref):
                return ["batch source contains an invalid review"]
            seen_agents.add(review["reviewer_id"]); seen_bindings.add(review["reviewer_binding_ref"]); review_providers.append(selection["provider"]); feature_models.add(review["resolved_model_digest"]); final_authority_excluded_models.add(review["resolved_model_digest"]); final_authority_excluded_agents.add(review["reviewer_id"]); final_authority_excluded_runtime.add((selection["provider"],selection["model"]))
            feature_runtime.add((selection["provider"],selection["model"])); preferred_provider=selection["provider"]
    if certification.get("review_refs")!=worker_review_refs:
        return ["batch source contains an invalid certification"]
    final=certification["final_authority"]; binding=_read_batch_record(common,"model-bindings",final.get("model_binding_ref","")) if isinstance(final,dict) else None
    return _final_authority_errors(final,integration_head=integration["head"],prefix_evidence_ref=integration["prefix_evidence_ref"],review_refs=worker_review_refs,profiles=certification["profiles"],used_model_digests=final_authority_excluded_models,used_agent_ids=final_authority_excluded_agents,model_binding=binding,inventory_binding=inventory_binding,routing_policy=routing_policy,preferred_provider=review_providers[-1] if review_providers else None,resolved_model_digests=resolved_identities,excluded_provider_models=final_authority_excluded_runtime)


def _read_batch_record(common: Path, namespace: str, digest: str) -> object|None:
    """Read a bounded batch record while refusing symlinked parents/files."""
    pattern=r"[a-z][a-z0-9-]{0,63}" if namespace=="requests" else r"[0-9a-f]{64}"
    if not isinstance(digest,str) or not re.fullmatch(pattern,digest): return None
    try:
        records,_snapshot=batch_namespace_snapshot(common,namespace)
        return records.get(digest)
    except ValueError:
        return None

def _read_controller_inventory_record(common: Path, name: object) -> tuple[object|None,tuple[object,...]|None]:
    if not isinstance(name,str) or (name!="current.json" and not re.fullmatch(r"[0-9a-f]{64}\.json",name)):
        return None,None
    try:
        records,snapshot=session_namespace_snapshot(common,"controller-inventory")
        return records.get(name[:-5]),snapshot
    except ValueError:
        return None,None


def _read_current_controller_inventory_binding(common: Path, expected_reference: object) -> object|None:
    """Stable-read current, its immutable record, then the same current entry."""
    if not isinstance(expected_reference,str) or not DIGEST_PATTERN.fullmatch(expected_reference): return None
    current,current_identity=_read_controller_inventory_record(common,"current.json")
    if controller_inventory_binding_errors(current) or _canonical_digest(current)!=expected_reference: return None
    immutable,_immutable_identity=_read_controller_inventory_record(common,f"{expected_reference}.json")
    current_after,current_after_identity=_read_controller_inventory_record(common,"current.json")
    if (immutable!=current or current_after!=current or current_after_identity!=current_identity or
        controller_inventory_binding_errors(immutable) or _canonical_digest(immutable)!=expected_reference):
        return None
    return immutable


def _read_certification(common: Path, digest: str) -> object|None:
    return _read_batch_record(common,"certifications",digest)

def batch_source_errors(root: Path, *, snapshot_out: list | None = None) -> list[str]:
    """Refuse packaging while a template batch is unfinished or stale."""
    try:
        result=subprocess.run(["git","rev-parse","--path-format=absolute","--git-common-dir"],cwd=root,text=True,capture_output=True,check=False)
        # The closed artifact-presence validator is also used on synthetic
        # non-Git fixtures; there is no batch state to inspect there.
        if result.returncode: return []
        common=Path(result.stdout.strip())
        if not common.is_absolute(): common=(root/common).resolve()
        batches,batches_snapshot=batch_namespace_snapshot(common,"batches",allow_missing=True)
        if not batches:
            if batch_namespace_snapshot(common,"batches",allow_missing=True)[1]!=batches_snapshot: return ["batch source state changed"]
            return []
        snapshots={"batches":batches_snapshot}
        values=[]
        for identifier,value in sorted(batches.items()):
            integration=value.get("integration") if isinstance(value,dict) else None
            if not isinstance(value,dict) or value.get("schema")!=2 or not isinstance(integration,dict): return ["batch source contains an incomplete batch"]
            if not _enum(integration.get("state"),{"verified_final","certified"}): return ["batch source contains an incomplete batch"]
            if not isinstance(integration.get("evidence_ref"),str) or not re.fullmatch(r"[0-9a-f]{64}",integration["evidence_ref"]): return ["batch source contains an unverified batch"]
            values.append(value)
        dirty=subprocess.run(["git","--no-optional-locks","status","--porcelain=v1","--untracked-files=all"],cwd=root,text=True,capture_output=True,check=False)
        if dirty.returncode or dirty.stdout: return ["batch source is dirty; finish or abandon the batch before installation"]
        for identifier,value in batches.items():
            if (not isinstance(value.get("base_branch"),str) or not value["base_branch"].startswith("refs/heads/") or
                not isinstance(value["integration"].get("branch"),str) or value["integration"]["branch"]!=f"codex/batch/{identifier}"):
                return ["batch source contains an invalid batch"]
        refs=tuple(sorted({ref for value in values for ref in (value.get("base_branch",""),"refs/heads/"+value["integration"].get("branch",""))}))
        source_snapshot=clean_git_snapshot(root,refs,capture_paths=BATCH_AUTHORITY_PATHS)
        documents,authority_digests=batch_authority_documents(source_snapshot)
        for identifier,value in batches.items():
            if value.get("batch_id")!=identifier: return ["batch source contains an invalid batch"]
        for namespace in ("model-bindings","requests","reviews","certifications","prefix-evidence"):
            _records,snapshots[namespace]=batch_namespace_snapshot(common,namespace)
        _inventory,inventory_snapshot=session_namespace_snapshot(common,"controller-inventory")
        batch_policy=documents["harness/batch-policy.json"]
        project=documents["harness/project.json"]
        routing_policy=documents["harness/model-routing.json"]
        feature_document=documents["feature_list.json"]
        for value in values:
            shape_errors=_batch_manifest_shape_errors(common,value,project,routing_policy,feature_document=feature_document,batch_policy=batch_policy,review_policy_digest=authority_digests["harness/review-policy.json"])
            if shape_errors: return shape_errors
            base=subprocess.run(["git","rev-parse",value["base_branch"]],cwd=root,text=True,capture_output=True,check=False)
            if base.returncode or base.stdout.strip()!=value["base_commit"]: return ["batch source protected base has moved"]
            integration_branch=value["integration"]["branch"]
            head=subprocess.run(["git","rev-parse",f"refs/heads/{integration_branch}"],cwd=root,text=True,capture_output=True,check=False)
            if head.returncode or head.stdout.strip()!=value["integration"]["head"]: return ["batch source integration branch has moved"]
            checkout=subprocess.run(["git","rev-parse","HEAD"],cwd=root,text=True,capture_output=True,check=False)
            if checkout.returncode or checkout.stdout.strip()!=value["integration"]["head"]: return ["batch source checkout is not the certified integration"]
        for value in values:
            certification=_read_certification(common,value["integration"]["evidence_ref"])
            final=certification.get("final_authority") if isinstance(certification,dict) else None
            if not isinstance(final,dict) or _read_current_controller_inventory_binding(common,final.get("inventory_binding_ref")) is None:
                return ["batch source controller inventory is stale"]
        for namespace,snapshot in snapshots.items():
            if batch_namespace_snapshot(common,namespace)[1]!=snapshot: return ["batch source private namespace changed"]
        if session_namespace_snapshot(common,"controller-inventory")[1]!=inventory_snapshot:
            return ["batch source controller inventory namespace changed"]
        if clean_git_snapshot(root,refs,capture_paths=BATCH_AUTHORITY_PATHS)!=source_snapshot: return ["batch source Git/worktree changed before packaging"]
        for namespace,snapshot in snapshots.items():
            if batch_namespace_snapshot(common,namespace)[1]!=snapshot: return ["batch source private namespace changed"]
        if session_namespace_snapshot(common,"controller-inventory")[1]!=inventory_snapshot:
            return ["batch source controller inventory namespace changed"]
        if snapshot_out is not None: snapshot_out.append((source_snapshot,snapshots,inventory_snapshot,documents,authority_digests))
        return []
    except (OSError,ValueError): return ["batch source eligibility could not be checked"]

def validate_batch_packaging(root: Path) -> tuple | None:
    snapshots=[]
    errors=batch_source_errors(root,snapshot_out=snapshots)
    if errors: raise ValueError(errors[0])
    try: project=snapshots[0][3]["harness/project.json"] if snapshots else json.loads((root/"harness/project.json").read_text(encoding="utf-8"))
    except (OSError,UnicodeError,json.JSONDecodeError) as error: raise ValueError("installation packaging has an invalid harness/project.json") from error
    if type(project) is not dict: raise ValueError("installation packaging has an invalid harness/project.json")
    errors=_profile_unavailable_errors(project.get("profiles"))
    if errors: raise ValueError(errors[0])
    policy_value=snapshots[0][3]["harness/batch-policy.json"] if snapshots else None
    errors=batch_packaging_errors(root,project.get("run_meta_tests"),policy_value=policy_value)
    if errors: raise ValueError(errors[0])
    if snapshots:
        source=snapshots[0][0]; refs=tuple(ref for ref,_digest in source[0][2])
        if clean_git_snapshot(root,refs,capture_paths=BATCH_AUTHORITY_PATHS)!=source: raise ValueError("batch source Git/worktree changed before packaging")
    return snapshots[0] if snapshots else None
