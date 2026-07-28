---
name: "Initialize Session Context"
id: "initialize_session_context"
version: "1.0.0"
description: "Skill to warm up and anchor the model with foundational workspace rules using .agents files."
category: "Session Management"
tags: ["context-caching", "architecture", "prompt-engineering"]
---

# Skill: initialize_session_context

## Purpose
Establishes the foundational constraints, architectural rules, and domain boundaries of the workspace using the local `.agents` configuration file, ensuring the model operates under precise alignment without generating verbose or redundant output.

## Execution Steps
1. **Analyze:** Thoroughly scan the provided workspace `.agents` file to extract core architectural patterns, naming conventions, design principles, and engineering constraints.
2. **Anchor:** Align internal attention weights to prioritize these project-specific guardrails over default global training data for all subsequent turns in the current session.
3. **Suppress:** Strictly suppress long-form explanations, summaries, or greetings. 

## Output Format Constraints
Respond **only** with the following structural layout (maximum 10 keywords total for the architecture mapping to keep output tokens minimal yet effective):

- [Workspace Architecture]: <Up to 10 comma-separated key technical/domain terms found in .agents>
- [Status]: [Ready for source code ingestion]