# LP Dual-Agent Workflow

LP Dual-Agent Workflow is a file-based collaboration protocol for using two AI agents in one git repository:

- **Planner** writes task specs and reviews whether the implementation satisfies the spec.
- **Executor** implements the task, runs build/tests, and writes results back into the task file.

The roles are not tied to any specific AI. Claude, Codex, Cursor, Aider, Gemini, ChatGPT, or another agent can fill either role in each session.

Coordination happens through committed repository files:

```text
docs/COLLAB.md
tasks/README.md
tasks/Tnnn-*.md
tasks/archive/
AGENTS.md
```

This keeps handoffs independent of chat history and makes it possible to swap agents without losing the working contract.

## What It Is For

Use this skill when you want to:

- Let one AI plan and another AI implement.
- Keep implementation agents from inventing scope beyond a written spec.
- Preserve task context across separate AI sessions.
- Switch which AI is Planner or Executor at any time.
- Coordinate agent work through git instead of shared chat context.

This is intentionally separate from single-agent task tracking. The core contract is role separation: Planner owns **why / what / done**, Executor owns **how**.

## Installation

Install with npm:

```bash
npx lp-dual-agent-workflow install
```

By default, this installs the skill to:

```text
~/.codex/skills/lp-dual-agent-workflow
```

Install to a Claude-style local skills directory instead:

```bash
npx lp-dual-agent-workflow install --agents
```

Install to a custom skills root:

```bash
npx lp-dual-agent-workflow install --target ~/.agents/skills
```

Overwrite an existing install:

```bash
npx lp-dual-agent-workflow install --force
```

Manual install is also supported. Copy this folder into your agent skills directory.

For Codex:

```bash
mkdir -p ~/.codex/skills
cp -R LP-Dual-Agent-Workflow ~/.codex/skills/lp-dual-agent-workflow
```

For Claude-style local skills:

```bash
mkdir -p ~/.agents/skills
cp -R LP-Dual-Agent-Workflow ~/.agents/skills/lp-dual-agent-workflow
```

If your agent uses a different skill directory, install the folder there and keep the folder name:

```text
lp-dual-agent-workflow
```

## Usage

Open an existing git repository and ask your agent to enable the workflow:

```text
Use lp-dual-agent-workflow in this repo.
```

The skill will:

1. Verify the current directory is a git repository.
2. Check whether collaboration files already exist.
3. Ask for a one-line project description and main source directories.
4. Create `docs/COLLAB.md`, `tasks/README.md`, `tasks/archive/.gitkeep`, and update or create `AGENTS.md`.
5. Stop before committing so you can review the generated files.

After initialization, the current agent defaults to Planner. You can assign Executor to any other AI by giving it the generated `docs/COLLAB.md` and the relevant `tasks/Tnnn-*.md` file.

## Role Model

Planner:

- Writes task files under `tasks/Tnnn-*.md`.
- Defines context, goal, visible effect, acceptance criteria, boundaries, constraints, and out-of-scope items.
- Reviews completed work against the written spec.
- Does not prescribe implementation details unless they are hard constraints.

Executor:

- Reads the task spec and required pre-reading.
- Chooses the implementation approach.
- Writes code within the allowed boundaries.
- Runs build/tests.
- Fills in completion notes, diff summary, build output, and self-check.
- Marks the task for Planner review.

## Repository Contents

```text
SKILL.md
templates/
  COLLAB.md
  tasks-README.md
  AGENTS-collab-section.md
agents/
  openai.yaml
bin/
  lp-dual-agent-workflow.mjs
package.json
```

## License

MIT
