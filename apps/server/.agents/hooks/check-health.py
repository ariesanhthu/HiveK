#!/usr/bin/env python3
import os
import re
import sys
import argparse
import subprocess
from datetime import datetime

CORE_FORBIDDEN = [r'@nestjs/', r'mongoose', r'express', r'fastify', r'typeorm', r'prisma', r'axios', r'node-fetch', r'@sgod-', r'cloudinary', r'handlebars', r'socket\.io', r'winston']
APP_FORBIDDEN = [r'src/infrastructure/', r'src/presentation/', r'@nestjs/microservices', r'mongoose', r'@sgod-', r'cloudinary', r'handlebars', r'socket\.io']

def run_cmd(cmd):
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return res.returncode, res.stdout.strip(), res.stderr.strip()

def check_git_clean():
    rc, stdout, _ = run_cmd("git status --porcelain")
    if stdout:
        print("❌ Error: Uncommitted changes detected in working directory.")
        print("   Architecture health checks require a clean Git commit baseline.")
        print("   Please commit or stash your changes before running review-architecture.")
        sys.exit(1)

def get_git_hashes():
    _, full_hash, _ = run_cmd("git rev-parse HEAD")
    _, short_hash, _ = run_cmd("git rev-parse --short HEAD")
    return full_hash, short_hash

def parse_latest_baseline(latest_path):
    if not os.path.exists(latest_path):
        return None, []
    
    with open(latest_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    commit_match = re.search(r'\*\*Commit\*\*:\s*([a-f0-9]+)', content)
    last_hash = commit_match.group(1) if commit_match else None
    
    violations = []
    # Parse table rows under NEW and PERSISTING
    for line in content.splitlines():
        if line.startswith("|") and not line.startswith("| File") and not line.startswith("|---"):
            parts = [p.strip() for p in line.split("|")[1:-1]]
            if len(parts) >= 3 and parts[0] and parts[1].isdigit():
                violations.append({
                    "file": parts[0],
                    "line": int(parts[1]),
                    "rule": parts[2],
                    "risk": parts[3] if len(parts) > 3 else "MEDIUM"
                })
    return last_hash, violations

def scan_file(file_path, root_dir):
    rel_path = os.path.relpath(file_path, root_dir)
    findings = []

    if not os.path.exists(file_path):
        return findings

    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()

    is_core = rel_path.startswith("src/core/")
    is_app = rel_path.startswith("src/application/")
    is_presentation = rel_path.startswith("src/presentation/")

    for idx, line in enumerate(lines, 1):
        if not (line.startswith("import ") or line.startswith("from ") or "require(" in line):
            continue

        if is_core:
            for pattern in CORE_FORBIDDEN:
                if re.search(pattern, line):
                    findings.append({
                        "file": rel_path,
                        "line": idx,
                        "rule": f"Core layer importing framework/driver ({pattern})",
                        "risk": "HIGH"
                    })
        elif is_app:
            for pattern in APP_FORBIDDEN:
                if re.search(pattern, line):
                    findings.append({
                        "file": rel_path,
                        "line": idx,
                        "rule": f"Application layer importing infrastructure/presentation ({pattern})",
                        "risk": "HIGH"
                    })
        elif is_presentation:
            for pattern in [r'mongoose', r'@nestjs/mongoose']:
                if re.search(pattern, line):
                    findings.append({
                        "file": rel_path,
                        "line": idx,
                        "rule": f"Presentation layer importing database driver ({pattern})",
                        "risk": "HIGH"
                    })

    return findings

def main():
    parser = argparse.ArgumentParser(description="Git-anchored incremental architecture health check")
    parser.add_argument("--full", action="store_true", help="Force a full scan of src/")
    args = parser.parse_args()

    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    src_dir = os.path.join(root_dir, "src")
    health_dir = os.path.join(root_dir, "docs/health")
    latest_file = os.path.join(health_dir, "latest.md")

    check_git_clean()
    full_hash, short_hash = get_git_hashes()
    last_hash, prev_violations = parse_latest_baseline(latest_file)

    scan_mode = "full" if (args.full or not last_hash) else "incremental"
    files_to_scan = []

    if scan_mode == "full":
        if os.path.exists(src_dir):
            for dp, _, fns in os.walk(src_dir):
                for f in fns:
                    if f.endswith(".ts") or f.endswith(".js"):
                        files_to_scan.append(os.path.join(dp, f))
    else:
        rc, diff_out, _ = run_cmd(f"git diff --name-only {last_hash}..HEAD -- src/")
        if diff_out:
            for rel in diff_out.splitlines():
                full_p = os.path.join(root_dir, rel)
                if os.path.exists(full_p) and (full_p.endswith(".ts") or full_p.endswith(".js")):
                    files_to_scan.append(full_p)

    current_findings = []
    for fp in files_to_scan:
        current_findings.extend(scan_file(fp, root_dir))

    # Categorize into NEW, PERSISTING, RESOLVED
    prev_map = {(v["file"], v["line"], v["rule"]): v for v in prev_violations}
    curr_map = {(c["file"], c["line"], c["rule"]): c for c in current_findings}

    new_violations = [c for key, c in curr_map.items() if key not in prev_map]
    persisting_violations = [c for key, c in curr_map.items() if key in prev_map]
    resolved_violations = [v for key, v in prev_map.items() if key not in curr_map]

    date_str = datetime.now().strftime("%Y%m%d")
    report_file = os.path.join(health_dir, f"{date_str}-{short_hash}.md")

    os.makedirs(health_dir, exist_ok=True)

    report_lines = [
        "# Architecture Health Report",
        "",
        f"**Date**: {datetime.now().strftime('%Y-%m-%d')}",
        f"**Commit**: {full_hash}",
        f"**Previous baseline**: {last_hash if last_hash else 'none (bootstrap)'}",
        f"**Scan mode**: {scan_mode}",
        "",
        "## Trend Summary",
        "",
        "| Category | Count |",
        "|---|---|",
        f"| New violations | {len(new_violations)} |",
        f"| Resolved since last check | {len(resolved_violations)} |",
        f"| Persisting (file touched, violation remains) | {len(persisting_violations)} |",
        "",
        "> Persisting violations are files that were modified in this diff but still contain a previously recorded violation.",
        "",
        "## Violations",
        "",
        "### NEW",
        "| File | Line | Rule Violated | Risk |",
        "|------|------|---------------|------|"
    ]

    if new_violations:
        for v in new_violations:
            report_lines.append(f"| {v['file']} | {v['line']} | {v['rule']} | {v['risk']} |")
    else:
        report_lines.append("| (None) | - | - | - |")

    report_lines.extend([
        "",
        "### PERSISTING",
        "| File | Line | Rule Violated | Risk |",
        "|------|------|---------------|------|"
    ])

    if persisting_violations:
        for v in persisting_violations:
            report_lines.append(f"| {v['file']} | {v['line']} | {v['rule']} | {v['risk']} |")
    else:
        report_lines.append("| (None) | - | - | - |")

    report_lines.extend([
        "",
        "### RESOLVED",
        "| File | Rule | Resolved In |",
        "|------|------|-------------|"
    ])

    if resolved_violations:
        for v in resolved_violations:
            report_lines.append(f"| {v['file']} | {v['rule']} | {short_hash} |")
    else:
        report_lines.append("| (None) | - | - |")

    report_content = "\n".join(report_lines) + "\n"

    with open(report_file, "w", encoding="utf-8") as f:
        f.write(report_content)

    with open(latest_file, "w", encoding="utf-8") as f:
        f.write(report_content)

    print(f"✅ Architecture health report generated: docs/health/{date_str}-{short_hash}.md")
    print(f"   Scan mode: {scan_mode} | New: {len(new_violations)} | Persisting: {len(persisting_violations)} | Resolved: {len(resolved_violations)}")

if __name__ == "__main__":
    main()
