# LP Dual-Agent Workflow

English | [中文](#中文)

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

After the package is published to npm, install it with:

```bash
npx lp-dual-agent-workflow install
```

By default, this installs the skill to:

```text
~/.agents/skills/lp-dual-agent-workflow
```

For Codex, use:

```bash
npx lp-dual-agent-workflow install --codex
```

To overwrite an existing install:

```bash
npx lp-dual-agent-workflow install --force
```

You can also install the command globally:

```bash
npm install -g lp-dual-agent-workflow
lp-dual-agent-workflow install
```

Manual installation is also supported.

Copy this folder into your agent skills directory.

For the default agent skills directory:

```bash
mkdir -p ~/.agents/skills
cp -R LP-Dual-Agent-Workflow ~/.agents/skills/lp-dual-agent-workflow
```

For Codex:

```bash
mkdir -p ~/.codex/skills
cp -R LP-Dual-Agent-Workflow ~/.codex/skills/lp-dual-agent-workflow
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
```

## License

MIT

---

## 中文

LP Dual-Agent Workflow 是一套基于文件的双智能体协作协议，用来在同一个 git 仓库里协调两个 AI agent：

- **Planner** 负责任务拆解、编写任务 spec，并审查实现是否满足 spec。
- **Executor** 负责按 spec 实现、运行 build/test，并把结果回填到任务文件里。

这两个角色不绑定具体 AI。Claude、Codex、Cursor、Aider、Gemini、ChatGPT 或其他 agent 都可以在不同会话中担任任一角色。

协作通过提交到仓库的文件完成：

```text
docs/COLLAB.md
tasks/README.md
tasks/Tnnn-*.md
tasks/archive/
AGENTS.md
```

这样可以让交接不依赖聊天记录，也可以随时切换哪个 AI 当 Planner 或 Executor。

## 适用场景

当你想做这些事时，可以使用这个 skill：

- 让一个 AI 负责规划，另一个 AI 负责实现。
- 防止实现方在没有书面 spec 的情况下扩大范围。
- 在不同 AI 会话之间保留任务上下文。
- 随时切换 Planner 或 Executor 的具体 AI。
- 通过 git 文件而不是共享聊天上下文来协调 agent 工作。

它和单智能体任务跟踪不同。核心是角色分离：Planner 负责 **why / what / done**，Executor 负责 **how**。

## 安装

包发布到 npm 后，可以用下面的命令安装：

```bash
npx lp-dual-agent-workflow install
```

默认会安装到：

```text
~/.agents/skills/lp-dual-agent-workflow
```

如果要安装到 Codex 的 skills 目录：

```bash
npx lp-dual-agent-workflow install --codex
```

如果本地已经安装过，需要覆盖：

```bash
npx lp-dual-agent-workflow install --force
```

也可以全局安装命令：

```bash
npm install -g lp-dual-agent-workflow
lp-dual-agent-workflow install
```

也支持手动安装。

把这个文件夹复制到你的 agent skills 目录即可。

默认全局 agent skills 目录：

```bash
mkdir -p ~/.agents/skills
cp -R LP-Dual-Agent-Workflow ~/.agents/skills/lp-dual-agent-workflow
```

Codex 目录：

```bash
mkdir -p ~/.codex/skills
cp -R LP-Dual-Agent-Workflow ~/.codex/skills/lp-dual-agent-workflow
```

如果你的 agent 使用其他 skills 目录，把文件夹复制过去，并保持文件夹名为：

```text
lp-dual-agent-workflow
```

## 使用方式

在一个已有 git 仓库里打开 agent，然后说：

```text
Use lp-dual-agent-workflow in this repo.
```

这个 skill 会：

1. 检查当前目录是否是 git 仓库。
2. 检查是否已经存在协作协议文件。
3. 询问项目一句话简介和主要源码目录。
4. 创建 `docs/COLLAB.md`、`tasks/README.md`、`tasks/archive/.gitkeep`，并更新或创建 `AGENTS.md`。
5. 停在提交前，让你先审查生成的文件。

初始化后，当前 agent 默认担任 Planner。你可以把 Executor 指派给任意其他 AI，只需要把生成的 `docs/COLLAB.md` 和对应的 `tasks/Tnnn-*.md` 给它即可。

## 角色模型

Planner：

- 编写 `tasks/Tnnn-*.md` 任务文件。
- 定义上下文、目标、可见效果、验收标准、交付边界、硬约束和排除范围。
- 按书面 spec 审查已完成的实现。
- 除非是硬约束，否则不规定具体实现细节。

Executor：

- 阅读任务 spec 和前置文档。
- 自主选择实现方案。
- 在允许的边界内写代码。
- 运行 build/test。
- 回填完成说明、diff 摘要、build 输出和自检结果。
- 将任务标记为等待 Planner 审查。

## 仓库内容

```text
SKILL.md
templates/
  COLLAB.md
  tasks-README.md
  AGENTS-collab-section.md
agents/
  openai.yaml
```

## 许可证

MIT
