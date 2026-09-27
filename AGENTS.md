# AGENTS.md

This repository is currently a minimal workspace and does not yet define a concrete app or framework. Keep customizations small, explicit, and low-risk until the project structure is established.

## Working conventions

- Prefer the smallest possible change that addresses the request.
- Before adding new files or scaffolding, check whether a project already exists.
- If a README or package manifest appears later, use it as the source of truth for commands, conventions, and architecture.
- Do not invent project patterns, dependencies, or build commands that are not supported by the workspace.
- If the repository is empty or ambiguous, ask for clarification rather than assuming a framework or stack.

## Expected agent behavior

- Read the repository root and any existing documentation before making edits.
- Use existing naming, structure, and toolchain conventions when they exist.
- Prefer direct edits over broad refactors.
- Keep instructions, comments, and generated code aligned with the actual repo state.
- When introducing new automation, prefer minimal configuration over large scaffolding.

## Validation

- Run the narrowest relevant validation command available for the change.
- If no project commands exist yet, avoid making assumptions; document that validation is blocked by missing project setup.
- Treat missing framework files as a signal to stop and confirm intent, rather than generating an app scaffold unprompted.

## Repository guidance

- This directory is currently a placeholder workspace; treat it as a blank slate until code is added.
- If a future project is created, add or update the project documentation and then refine this file to reflect the real conventions.

## Useful defaults for future work

- Prefer AGENTS.md for repo-level instructions.
- Link to detailed docs instead of copying large sections.
- Keep instructions actionable and concise.
