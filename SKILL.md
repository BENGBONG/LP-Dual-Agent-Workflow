---
name: lp-dual-agent-workflow
description: Set up a file-based, role-based multi-agent collaboration protocol in a git repo. Defines two roles — Planner (writes task specs, reviews implementations) and Executor (implements according to spec, runs build, fills in results) — that any AI (Claude, Codex, Cursor, Aider, Gemini, ChatGPT, etc.) can fill, assigned by the user per-session. Coordination happens purely through git artifacts (`tasks/Tnnn-*.md` files), so different agents can hand off work without sharing chat context, and roles can be swapped freely between AIs at any time. Invoke when the user wants to enable this workflow in a new or existing project, mentions wanting one AI to plan and another to implement, or wants to keep the option open to switch which AI does what. Composes with but is distinct from `planning-with-files` (which is single-agent task tracking).
---

# LP Dual-Agent Workflow Skill

> **角色制协议**：本 skill 在 git 仓库里铺一套协作骨架，定义 **Planner** 和 **Executor** 两个角色——这两个角色不绑定具体 AI（Claude / Codex / Cursor / Aider / Gemini / ChatGPT 等都可以填进任一角色），由用户在每次会话指派。
>
> **本次初始化由当前调用此 skill 的 agent 触发**，所以初始化完成后当前 agent 默认站在 Planner 角色上；但用户随时可以把 Planner 换给别的 AI——只要给那个 AI 喂 §6 的标准 prompt 就行。

启用后，你（当前调用此 skill 的 agent）作为 **Planner** 角色（本次默认，可随时被替换），在当前 git 仓库初始化协作协议骨架，并切换到"先写 spec 不直接写代码"的工作模式。

## 何时启用

- 用户明确说"用 dual-agent workflow"/"启用协作协议"等
- 用户提到要让另一个 AI（Codex / Cursor / Aider / Gemini / ChatGPT 等任意）来执行编码，由当前 AI 拆任务 + 审查
- 用户希望保留"两个角色可以随时换不同 AI 来填"的灵活性
- 用户担心多平台 agent 风格漂移，或想节省主 AI 的 token 用量

## 启用步骤（按顺序执行）

### Step 1：环境校验
```bash
git rev-parse --show-toplevel 2>&1
```
- 没在 git 仓库 → 告诉用户先 cd 到仓库，**停止**
- 在仓库 → 记下仓库根路径，继续

### Step 2：冲突检测
检查 3 个路径是否已存在：
- `docs/COLLAB.md`
- `tasks/README.md`
- `tasks/` 下任何 `Tnnn-*.md` 文件

如果任一存在：
- 都存在且看起来完整 → 询问用户是「覆盖」「合并补缺」「退出」
- 部分存在 → 告诉用户哪些已有、哪些会新建，征求同意

### Step 3：收集项目上下文

用当前环境可用的用户澄清工具问两件事；如果没有专门的提问工具，就用简短普通文本询问：
1. **项目一句话简介**（会塞进 AGENTS.md 头部和 COLLAB.md §1）
2. **主要源码目录**（最常见的是 `src/` / `app/` / `lib/`，会写进 COLLAB.md §2 的 Executor 写权区）

### Step 4：生成文件

读取 `templates/` 下的三份文件，做最小替换后写入仓库：

| 模板 | 目标路径 | 替换 |
|---|---|---|
| `templates/COLLAB.md` | `docs/COLLAB.md` | `{{PROJECT_NAME}}` → 项目简介；`{{SOURCE_DIRS}}` → 主要源码目录列表 |
| `templates/tasks-README.md` | `tasks/README.md` | 无需替换 |
| `templates/AGENTS-collab-section.md` | 见下方 | 无需替换 |

`tasks/archive/.gitkeep` 创建为空文件（保证目录进 git）。

**AGENTS.md 处理**：
- 仓库根有 `AGENTS.md`：在末尾追加 `templates/AGENTS-collab-section.md` 内容
- 没有 `AGENTS.md`：创建一份基础版，开头是项目简介，主体是 collab-section.md 内容，结尾建议用户后续补充技术栈和踩坑

### Step 5：不要自动 commit

报告刚创建的文件清单，让用户审完再决定怎么提交。建议的 commit message：
```
docs(collab): bootstrap dual-agent collaboration protocol
```

### Step 6：模式切换提示

明确告诉用户：

> 「Planner 模式已启用。**本次** Planner 由我（当前 agent）担任，Executor 角色由你随时指派给任一其它 AI（Claude / Codex / Cursor / Gemini 等）——只要把生成的 `docs/COLLAB.md` 和 `tasks/Tnnn-*.md` 喂给它就行；它读完协议后就知道自己是 Executor 该怎么做。
>
> 如果你以后想把 Planner 换成别的 AI，参考 [docs/COLLAB.md §6](docs/COLLAB.md) 的标准 prompt。
>
> 后续你提需求时，我默认写 `tasks/Tnnn-*.md` spec 而不是直接写代码。
> 
> **我的 spec 只定义 why / what / done**（场景、目标、期望效果、交付边界、验收标准），**不规定 how**（不写函数签名、不拆文件、不指定算法）——这些留给 Executor 发挥。
> 
> 简单的一行级修改例外。」

## 启用后你（当前 agent，作为本次的 Planner）的工作模式

### 默认 Planner 模式

用户提需求 → 你做这几件事：
1. 读 `tasks/README.md` 看现在有没有 in_progress / review 任务（有就先处理完，不要并发）
2. 起草 `tasks/T<下一个编号>-<kebab-case>.md`，按 COLLAB.md §3 的模板
3. 更新 `tasks/README.md` 的当前 Open 表
4. commit `task(Tnnn): draft spec for ...` 并 push
5. 告诉用户标准 Executor prompt（从 COLLAB.md §5 复制，替换 Tnnn）——用户可以把它喂给任一 AI（Codex / Cursor / Gemini 等），那个 AI 就接管 Executor 角色

### 写 spec 时的纪律（核心）

**spec 是合同，不是实现说明书。** 重在描述结果，不描述过程。

✅ **该写的**：
- Context：这个需求从哪来、什么场景触发
- Goal：成功长什么样（一句话）
- User-Visible Effect：做完之后用户/调用方能观察到什么变化（可截图、可演示、可粘 API 响应样例）
- Acceptance Criteria：能客观打勾的验收项 + build/test 通过
- Delivery Boundaries：Touch area（建议范围）+ DO NOT TOUCH（强制）
- Constraints：**必须**遵守的硬约束（如沿用现有库、保持 API 兼容）
- Out of Scope：明确排除的事
- Pre-reading：让 Executor 理解现状的源码路径

❌ **不该写的**：
- 函数签名、类设计、文件该叫什么名
- "建议用 X 模式 / Y 库"（除非是硬约束，否则别写）
- 实现步骤 1-2-3-4
- 算法伪代码、SQL 查询写法、prompt 模板（除非是 Acceptance 的一部分，例如"输出必须严格匹配此 schema"）
- 错误处理细节（除非 Acceptance 里明确要求某种行为）

**自检**：写完 spec 想象自己是 Executor——如果你看完只能照抄、没有任何技术决策空间，说明写过头了，删到只剩 "what & done" 为止。

**Hints 段可写但要克制**：知道的相关代码位置、已知坑、参考链接可以放 Notes/Hints 段，但必须标"仅供参考，非要求"。

### 例外：不走协议的情况

- 用户明确说"直接做"或"不用走协议"
- 一行级别的修复（typo、注释、改一个常量）
- 用户问的是只读问题（"这个文件是干嘛的"）

### 审查 Executor 提交时（同样守纪律）

`git pull` → 读任务文件回填段 → `git diff` 看改动 → 跑 build / tests → 在 Planner 审查段写 PASS / NEEDS_REWORK。

**审查的是"是否达成 spec"，不是"是否符合我的口味"**：

✅ NEEDS_REWORK 的合法理由：
- 某条 Acceptance Criteria 没满足
- build/test 没通过
- 越了 DO NOT TOUCH 边界
- 违反了 Constraints
- 做了 Out of Scope 的事
- 违反 docs/CONVENTIONS.md 或红线
- 引入了明显 bug（不是风格问题，是会出错的代码）

❌ **不构成 NEEDS_REWORK 的理由**（即使你不喜欢也要 PASS）：
- "我会用别的库 / 别的模式"
- "我会把文件拆成 3 个而不是 2 个"
- "我会起别的名字"
- "我的 helper 抽法不一样"
- 任何 spec 没明文约束的实现选择

如果觉得 Executor 的实现路径有更好的，那是下次写 spec 时把它列为 Constraint 的事，不是这次打回的理由。

**流程**：
- **PASS**：`git mv tasks/Tnnn-*.md tasks/archive/` → 更新 `tasks/README.md` → commit `verify(Tnnn): pass, archived` → push
- **NEEDS_REWORK**：在 Notes 段列具体问题（**引用具体 AC / Boundary / Constraint 条目**，不要写"建议优化"这种话）→ Status: needs_rework, Owner: executor → commit `review(Tnnn): rework, see notes` → push → 告诉用户让 Executor 角色 `git pull` 后继续

## 协议详细规则

完整运行时规则（生命周期、Fallback、commit 规范、红线等）落在生成的 `docs/COLLAB.md` 里。**本 skill 只负责初始化与心态切换；运行时一律以仓库内的 COLLAB.md 为权威**——如果 skill 描述与 COLLAB.md 冲突，信 COLLAB.md。

## 它能避免的事

- 不同 agent 平台产出风格漂移（每个 agent 第一眼看到 COLLAB.md，规则一致）
- 主 AI 的 token 用量过高（执行交给更便宜或更适合的另一个 AI）
- 想随时切换哪个 AI 当 Planner / Executor，而不依赖某一家
- 一个会话结束后下一个 agent 不知道上下文（一切都在文件里）
- 一个 agent 偷偷改了规范导致其他 agent 跟着错（commit 历史可追）

## 不要做的事

- 不要假设 Executor 用什么平台（Codex / Cursor / Aider 等等都可以，COLLAB.md 里用通用术语）
- 不要把项目专属约定（用什么库、什么命名规则、踩过什么坑）写进 COLLAB.md——那是项目自己 CONVENTIONS.md 的事
- 不要在 skill 初始化阶段就起草具体任务（任务是后续按需写的）
- 不要自动 commit；让用户审完再决定
