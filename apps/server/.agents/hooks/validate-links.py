#!/usr/bin/env python3
import os
import re
import sys
import argparse

LINK_REGEX = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')

def validate_and_repair(fix=False):
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    agents_dir = os.path.join(root_dir, ".agents")
    
    files_to_check = [os.path.join(root_dir, "AGENTS.md")]
    for dirpath, _, filenames in os.walk(agents_dir):
        for f in filenames:
            if f.endswith(".md"):
                files_to_check.append(os.path.join(dirpath, f))

    broken_links = []
    repaired_count = 0

    for file_path in files_to_check:
        if not os.path.exists(file_path):
            continue
            
        file_dir = os.path.dirname(file_path)
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        new_content = content
        lines = content.splitlines()

        for line_num, line in enumerate(lines, 1):
            for match in LINK_REGEX.finditer(line):
                label, target = match.group(1), match.group(2)

                # Skip web links or mailto
                if target.startswith("http://") or target.startswith("https://") or target.startswith("mailto:") or target.startswith("#"):
                    continue

                # Strip anchor fragment
                target_path_part = target.split("#")[0]
                if not target_path_part:
                    continue

                # Resolve relative path
                resolved_target = os.path.abspath(os.path.join(file_dir, target_path_part))

                # Check if target exists (or if it's a planned doc in docs/ which might not be scaffolded yet)
                # Ignore un-scaffolded docs/ or specs/ paths if init-project / spec-specify hasn't run yet
                if target_path_part.startswith("docs/") or "/docs/" in target_path_part or "../docs/" in target_path_part or target_path_part.startswith("specs/") or "/specs/" in target_path_part or "../specs/" in target_path_part:
                    continue

                if not os.path.exists(resolved_target):
                    target_basename = os.path.basename(target_path_part)
                    
                    # Try to find target file by basename inside .agents/
                    candidate_path = None
                    for dp, _, fns in os.walk(agents_dir):
                        if target_basename in fns:
                            candidate_path = os.path.join(dp, target_basename)
                            break
                    
                    rel_candidate = None
                    if candidate_path:
                        rel_candidate = os.path.relpath(candidate_path, file_dir)

                    broken_links.append({
                        "file": os.path.relpath(file_path, root_dir),
                        "line": line_num,
                        "label": label,
                        "target": target,
                        "suggestion": rel_candidate
                    })

                    if fix and rel_candidate:
                        old_link_str = f"[{label}]({target})"
                        new_link_str = f"[{label}]({rel_candidate})"
                        new_content = new_content.replace(old_link_str, new_link_str)
                        repaired_count += 1

        if fix and new_content != content:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(new_content)

    if broken_links:
        print(f"❌ Found {len(broken_links)} broken link(s):")
        for b in broken_links:
            sug_str = f" -> Suggested fix: [{b['label']}]({b['suggestion']})" if b['suggestion'] else " (No candidate found)"
            print(f"  - {b['file']}:{b['line']} [{b['label']}]({b['target']}){sug_str}")
        
        if fix and repaired_count > 0:
            print(f"✨ Auto-repaired {repaired_count} link(s)!")
            return 0
        elif not fix:
            print("\nRun with '--fix' to auto-repair broken links.")
            return 1
    else:
        print("✅ All markdown links in .agents/ verified cleanly!")
        return 0

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Validate and repair markdown links in .agents/")
    parser.add_argument("--fix", action="store_true", help="Auto-repair broken links where candidates exist")
    args = parser.parse_args()
    sys.exit(validate_and_repair(fix=args.fix))
