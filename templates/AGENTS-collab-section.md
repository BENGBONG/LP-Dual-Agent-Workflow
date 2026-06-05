## 协作模式

本项目由多个 AI agent 协作开发，使用**角色制**协议——具体由哪个 AI（Claude / Codex / Cursor / Aider / Gemini / ChatGPT 等）担任哪个角色，由用户在每次会话指派。详细规则见 [docs/COLLAB.md](docs/COLLAB.md)。**简化版**：

- **如果用户告诉你"你是 Planner"**：拆任务，写 `tasks/Tnnn-*.md` spec，最后审 Executor 的实现。
  - spec **只定义** why（场景）/ what（目标 + 期望效果）/ done（验收标准 + 交付边界）
  - spec **不规定** how（不写函数签名、不指定算法、不强制文件拆分）——把技术方案的发挥空间留给 Executor
- **如果用户告诉你"你是 Executor"**：从 `tasks/README.md` 找 Status: open 的任务，按文件 spec 执行。
  - **技术方案、文件拆分、函数签名、选库都由你自主决定**（除非 spec 的 Constraints 段明确约束）
  - M/L 任务建议先写一段 Approach 大纲再写代码（详见 COLLAB.md §3）
  - 完成后改 Status: review 并 push 等审
- **任何 agent 第一次进仓库**：先读 COLLAB.md 把协议吃透，确认自己的角色，再动手。
- **角色边界严格**：Planner 不直接写功能代码；Executor 不动 docs/* 与 tasks/README.md。
- **正常情况下 Executor 不能自己归档任务**（即不能自己改 Status: done）。Fallback B 例外，见 COLLAB.md §9。

## 文档导航（多 agent 协作相关）

| 想做的事 | 先读 |
|---|---|
| **多 agent 协作机制 / 你被派来执行任务（必读）** | [docs/COLLAB.md](docs/COLLAB.md) |
| **看现在有什么 open 任务** | [tasks/README.md](tasks/README.md) |

## 不要做的事（协作相关）

- **Executor 不要改** `docs/*` / `tasks/README.md` / `AGENTS.md` / planning 类文件（task_plan.md / progress.md / findings.md 如有），那是 Planner 的编辑权区。
- 不要在没有 spec 的情况下做架构改动。
- 不要 force push 到主分支。
- 不要自己改 Status: done（除非 Fallback B 且自审清单全过）。
