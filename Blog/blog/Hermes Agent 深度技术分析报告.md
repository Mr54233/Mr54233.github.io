---
title: "Hermes Agent 深度技术分析报告"
description: "Hermes Agent 的架构与技术细节分析"
date: "2026-07-03"
categories:
  - AI 与编程工具
tags:
  - Hermes
  - Agent
  - 架构分析
---

# Hermes Agent 深度技术分析报告

> 分析日期: 2026-05-13  
> 
> 项目版本: v0.13.0  
> 
> 仓库: NousResearch/hermes-agent  
> 
> 许可证: MIT



---



## 一、项目概览



**Hermes Agent** 是由 Nous Research 开发的开源自改进 AI 代理框架。其核心理念是构建一个"闭环学习系统"——代理能从经验中自动创建技能、在使用过程中持续改进、跨会话持久化知识，并对用户建立渐进式的认知模型。



### 1.1 基础指标



| 指标 | 数值 |
|-|-|
| Python 代码总量 | ~6.7 万行 |
| 测试文件数 | 1,076 个（~17k 测试用例） |
| 工具文件数 | 75+ 个 |
| 平台适配器数 | 20+ 个消息平台 |
| 技能分类数 | 26 个大类 |
| 插件模块数 | 14 个 |
| 仓库体积 | 284MB |
| 发布节奏 | 每周一个版本（如 v2026.5.7） |
| 最低 Python 版本 | 3.11 |



### 1.2 核心卖点



1. **自改进学习闭环** — 从任务经验中创建技能，技能在使用中自我优化
2. **跨平台消息网关** — 单一网关进程同时对接 20+ 消息平台
3. **多模型无锁定** — 支持 OpenRouter（200+ 模型）、Anthropic、OpenAI、Gemini、NVIDIA NIM、小米 MiMo、GLM、Kimi/Moonshot、MiniMax、HuggingFace 等
4. **七种终端后端** — 本地、Docker、SSH、Singularity、Modal、Daytona、Vercel Sandbox
5. **MCP/ACP 协议集成** — 与 Claude Code、Cursor、VS Code 等工具互操作

---



## 二、项目架构



### 2.1 顶层目录结构



```Plain Text
hermes-agent/
├── run_agent.py              # AIAgent 核心对话循环（15,919 行）
├── cli.py                    # HermesCLI 交互式终端（13,567 行）
├── model_tools.py            # 工具调度与编排（865 行）
├── toolsets.py               # 工具集定义（855 行）
├── hermes_state.py           # SQLite 会话存储（2,966 行）
├── hermes_constants.py       # 共享常量与路径解析（389 行）
├── hermes_logging.py         # 日志系统（389 行）
├── mcp_serve.py              # MCP 服务器（975 行）
├── trajectory_compressor.py  # 上下文压缩（1,508 行）
├── agent/                    # 代理内部模块（36,467 行）
│   ├── memory_manager.py     # 记忆管理器
│   ├── memory_provider.py    # 记忆提供商抽象基类
│   ├── context_compressor.py # 上下文窗口压缩
│   ├── prompt_builder.py     # 系统提示词构建
│   ├── anthropic_adapter.py  # Anthropic 适配器
│   ├── gemini_native_adapter.py
│   ├── bedrock_adapter.py
│   └── ...
├── tools/                    # 工具实现（59,659 行）
│   ├── registry.py           # 工具自动发现注册
│   ├── terminal_tool.py      # 终端执行
│   ├── delegate_tool.py      # 子代理委派
│   ├── memory_tool.py        # 持久记忆
│   ├── browser_tool.py       # 浏览器自动化
│   ├── web_tools.py          # Web 搜索/抓取
│   └── ...
├── gateway/                  # 消息网关（25,186 行）
│   ├── run.py                # 网关主循环（16,671 行）
│   ├── session.py            # 会话管理
│   ├── config.py             # 配置系统
│   └── platforms/            # 平台适配器
│       ├── api_server.py     # OpenAI 兼容 HTTP API
│       ├── telegram.py
│       ├── discord.py
│       ├── slack.py
│       ├── wecom.py          # 企业微信
│       ├── feishu.py         # 飞书
│       ├── dingtalk.py       # 钉钉
│       ├── qqbot/            # QQ Bot
│       └── ...
├── skills/                   # 内置技能（26 个分类）
├── optional-skills/          # 可选技能
├── plugins/                  # 插件系统（33,355 行）
│   ├── memory/               # 记忆后端插件
│   ├── model-providers/      # 模型提供商插件
│   ├── kanban/               # 多代理看板
│   └── ...
├── acp_adapter/              # ACP 协议适配器
├── ui-tui/                   # Ink (React) 终端 UI
├── tui_gateway/              # TUI JSON-RPC 后端
├── cron/                     # 定时任务调度器
├── environments/             # RL 训练环境
├── hermes_cli/               # CLI 子命令（85,084 行）
├── tests/                    # 测试套件
└── website/                  # Docusaurus 文档站
```



### 2.2 文件依赖链



```Plain Text
hermes_constants.py  ← 无依赖，被所有模块导入
       ↓
tools/registry.py    ← 无依赖，被所有工具文件导入
       ↓
tools/*.py           ← 各自调用 registry.register() 完成注册
       ↓
model_tools.py       ← 导入 tools/registry，触发工具发现
       ↓
run_agent.py         ← 核心入口，导入 model_tools + hermes_state + agent/*
       ↓
cli.py / gateway/run.py / batch_runner.py
```



### 2.3 核心类 AIAgent



`AIAgent`（`run_agent.py`）是整个系统的核心，承担对话循环、工具调用、上下文管理等职责：



- `__init__` 接受约 **60 个参数**（凭据、路由、回调、会话上下文、预算、凭据池等）
- 核心方法 `run_conversation()` 驱动主循环
- 通过 `model_tools.py` 编排工具发现与调用
- 通过 `hermes_state.py` 管理会话持久化

---



## 三、对外暴露的接口



Hermes 提供 **5 种对外接口通道**，覆盖不同使用场景：



### 3.1 CLI 交互接口



| 属性 | 说明 |
|-|-|
| 入口 | `hermes` 命令 → `hermes_cli/main.py:main` |
| 核心类 | `HermesCLI`（`cli.py`, 13,567 行） |
| 功能 | 多行编辑、流式输出、斜杠命令、会话管理、工具配置 |
| 使用场景 | 本地终端直接交互 |



常用命令：

```Bash
hermes              # 启动交互式对话
hermes model        # 选择 LLM 提供商和模型
hermes tools        # 配置启用的工具集
hermes gateway      # 启动消息网关
hermes setup        # 运行完整设置向导
hermes doctor       # 诊断问题
```



### 3.2 消息网关 (Gateway)



#### 3.2.1 HTTP API 服务（OpenAI 兼容）



| 端点 | 方法 | 说明 |
|-|-|-|
| `/v1/chat/completions` | POST | OpenAI Chat Completions 格式（无状态；通过 `X-Hermes-Session-Id` 头可续接会话） |
| `/v1/responses` | POST | OpenAI Responses API 格式（有状态，通过 `previous_response_id`） |
| `/v1/responses/{id}` | GET | 获取已存储的响应 |
| `/v1/responses/{id}` | DELETE | 删除已存储的响应 |
| `/v1/models` | GET | 列出可用模型 |
| `/v1/capabilities` | GET | 机器可读的 API 能力声明 |
| `/v1/runs` | POST | 启动异步运行（立即返回 run_id，202） |
| `/v1/runs/{id}` | GET | 查询运行状态 |
| `/v1/runs/{id}/events` | GET | SSE 事件流 |
| `/v1/runs/{id}/approval` | POST | 解决待审批请求 |
| `/v1/runs/{id}/stop` | POST | 中断运行中的代理 |
| `/health` | GET | 健康检查 |
| `/health/detailed` | GET | 详细状态（跨容器仪表盘探针） |



默认地址: `http://127.0.0.1:8642/v1`



兼容的第三方前端: Open WebUI、LobeChat、LibreChat、AnythingLLM、NextChat、ChatBox 等。



#### 3.2.2 平台适配器



网关通过统一适配器接口对接 20+ 消息平台：



| 平台 | 适配器文件 | 说明 |
|-|-|-|
| Telegram | `telegram.py` | Bot API + 长轮询/Webhook |
| Discord | `discord.py` | discord.py 库 |
| Slack | `slack.py` | slack-bolt 框架 |
| WhatsApp | 通过 Gateway 集成 | WhatsApp Business API |
| Signal | `signal.py` | signal-cli |
| Matrix | `matrix.py` | mautrix 库 |
| Mattermost | `mattermost.py` | WebSocket |
| Email | `email.py` | IMAP/SMTP |
| SMS | `sms.py` | aiohttp |
| 飞书 | `feishu.py` + `feishu_comment.py` | Lark Open API |
| 钉钉 | `dingtalk.py` | Stream 协议 |
| 企业微信 | `wecom.py` | 企业微信 API |
| QQ Bot | `qqbot/` | QQ 机器人 |
| Home Assistant | `homeassistant.py` | 智能家居集成 |
| Webhook | `webhook.py` | 通用 HTTP 回调 |
| API Server | `api_server.py` | 上文描述的 HTTP API |
| BlueBubbles | `bluebubbles.py` | iMessage 桥接 |
| MS Graph Webhook | `msgraph_webhook.py` | Microsoft 365 集成 |



所有适配器继承自 `BasePlatformAdapter`（`gateway/platforms/base.py`）。



### 3.3 MCP 服务器



| 属性 | 说明 |
|-|-|
| 入口 | `hermes mcp serve` → `mcp_serve.py` |
| 协议 | Model Context Protocol (MCP) |
| 传输 | stdio |
| SDK | `mcp.server.fastmcp.FastMCP` |



暴露的工具：



| 工具名 | 功能 |
|-|-|
| `conversations_list` | 列出活跃会话 |
| `conversation_get` | 获取会话详情 |
| `messages_read` | 读取消息历史 |
| `messages_send` | 发送消息 |
| `attachments_fetch` | 获取附件 |
| `events_poll` | 轮询事件 |
| `events_wait` | 等待事件 |
| `permissions_list_open` | 列出待审批权限 |
| `permissions_respond` | 响应权限请求 |
| `channels_list` | Hermes 特有的频道目录 |



客户端配置示例：

```JSON
{
  "mcpServers": {
    "hermes": {
      "command": "hermes",
      "args": ["mcp", "serve"]
    }
  }
}
```



### 3.4 ACP 服务器



| 属性 | 说明 |
|-|-|
| 入口 | `hermes-acp` → `acp_adapter/entry.py` |
| 协议 | Agent Client Protocol (ACP) v0.9.0 |
| 集成目标 | VS Code、Zed、JetBrains 等 IDE |



ACP 能力：

- 创建/恢复/分叉会话
- 流式消息输出（文本、图像、音频）
- MCP 服务发现（stdio/http/sse）
- 权限管理
- 模型切换
- 多模态内容块

### 3.5 Web Dashboard



| 属性 | 说明 |
|-|-|
| 入口 | `hermes dashboard` → `hermes_cli/web_server.py` |
| 技术栈 | FastAPI + Uvicorn + SPA 前端 |
| 默认地址 | `http://127.0.0.1:9119` |
| 安全 | 仅绑定 localhost，远程访问需 SSH 隧道 |



---



## 四、会话管理



### 4.1 存储架构



**存储层**：`SessionDB` 类（`hermes_state.py:309`）



- **数据库引擎**: SQLite
- **存储位置**: `~/.hermes/state.db`
- **Journal 模式**: WAL（Write-Ahead Logging）

  - 支持并发读取 + 单写入者
  - 在 NFS/SMB/FUSE 等不支持 WAL 的文件系统上自动降级为 DELETE 模式
- **Schema 版本**: v11（含迁移机制）

### 4.2 核心表结构



```SQL
-- 会话表
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,             -- 会话唯一标识
    source TEXT NOT NULL,            -- 来源: cli / telegram / discord / cron 等
    user_id TEXT,                    -- 用户标识
    model TEXT,                      -- 使用的模型
    model_config TEXT,               -- 模型配置 JSON
    system_prompt TEXT,              -- 系统提示词
    parent_session_id TEXT,          -- 压缩时的父会话（链式结构）
    started_at REAL NOT NULL,        -- 开始时间
    ended_at REAL,                   -- 结束时间
    end_reason TEXT,                 -- 结束原因
    message_count INTEGER DEFAULT 0, -- 消息数
    tool_call_count INTEGER DEFAULT 0,
    input_tokens INTEGER DEFAULT 0,  -- token 统计
    output_tokens INTEGER DEFAULT 0,
    cache_read_tokens INTEGER DEFAULT 0,
    cache_write_tokens INTEGER DEFAULT 0,
    reasoning_tokens INTEGER DEFAULT 0,
    title TEXT,                      -- 会话标题
    handoff_state TEXT,              -- 跨平台移交状态
    handoff_platform TEXT,           -- 移交目标平台
    -- ... 还有计费相关字段
    FOREIGN KEY (parent_session_id) REFERENCES sessions(id)
);

-- 消息表
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL REFERENCES sessions(id),
    role TEXT NOT NULL,              -- system / user / assistant / tool
    content TEXT,                    -- 消息内容
    tool_call_id TEXT,               -- 工具调用 ID
    tool_calls TEXT,                 -- 工具调用列表 JSON
    tool_name TEXT,                  -- 工具名称
    timestamp REAL NOT NULL,         -- 时间戳
    token_count INTEGER,             -- token 计数
    finish_reason TEXT,              -- 结束原因
    reasoning TEXT,                  -- 思维链
    reasoning_content TEXT,
    reasoning_details TEXT,
    codex_reasoning_items TEXT,
    codex_message_items TEXT
);

-- FTS5 全文搜索虚拟表
-- 支持跨所有会话的消息全文搜索
```



### 4.3 会话生命周期



```Plain Text
创建阶段
  create_session(id, source, model, ...)
      ↓
活跃阶段
  append_message(session_id, role, content, ...)
      ↓ （循环多轮）
      ↓
压缩触发（token 超限时）
  ContextCompressor.should_compress() → true
      ↓
  compress_session()
    → 调用辅助模型压缩中间轮次为摘要
    → 创建新 session（parent_session_id 指向旧 session）
    → 旧 session 结束，新 session 继续
      ↓
结束阶段
  end_session(session_id, end_reason)
      ↓
恢复阶段（可选）
  resolve_resume_session_id() → 找到历史会话
  reopen_session() → 重新激活
```



### 4.4 关键特性



| 特性 | 说明 |
|-|-|
| **会话链** | 通过 `parent_session_id` 形成链式结构，支持跨压缩的完整历史追溯 |
| **跨平台移交** | `handoff_state` + `handoff_platform` 实现会话在平台间的无缝迁移（如 CLI → Telegram） |
| **FTS5 全文搜索** | 跨所有历史会话的全文搜索，配合 LLM 摘要实现跨会话召回 |
| **会话标题** | 自动生成或手动设置，支持按标题查找和恢复 |
| **Telegram Topic 绑定** | 专门的 topic binding 机制，支持 Telegram 群组的分主题会话 |
| **孤立会话清理** | `prune_empty_ghost_sessions()` 和 `finalize_orphaned_compression_sessions()` |
| **会话导出** | `export_session()` 导出完整会话数据 |



### 4.5 核心方法清单



| 方法 | 行号 | 功能 |
|-|-|-|
| `create_session` | 713 | 创建新会话 |
| `end_session` | 717 | 结束会话 |
| `reopen_session` | 735 | 重新打开已结束的会话 |
| `append_message` | 1433 | 追加消息 |
| `replace_messages` | 1520 | 替代会话的所有消息（压缩后使用） |
| `get_messages` | 1599 | 获取会话消息列表 |
| `get_messages_as_conversation` | 1686 | 获取格式化的对话记录（含链式追溯） |
| `search_messages` | 1880 | FTS5 全文搜索消息 |
| `search_sessions` | 2151 | 搜索会话 |
| `resolve_resume_session_id` | 1621 | 解析恢复目标的会话 ID |
| `set_session_title` / `get_session_title` | 1015/1044 | 标题管理 |
| `export_session` | 2217 | 导出会话数据 |
| `delete_session` | 2276 | 删除会话 |
| `prune_sessions` | 2310 | 清理旧会话 |



---



## 五、内存管理



Hermes 的内存系统采用 **四层架构**，各有不同的生命周期和用途：



### 5.1 第一层：内置文件记忆



**实现**: `tools/memory_tool.py`



| 属性 | 说明 |
|-|-|
| MEMORY.md | Agent 自身笔记（环境事实、项目约定、工具技巧、经验总结） |
| USER.md | 用户画像（偏好、沟通风格、工作习惯、期望） |
| 存储位置 | `~/.hermes/memories/` |
| 条目分隔符 | `§`（段落符号） |
| 字符限制 | 按字符数（非 token），因为字符计数与模型无关 |



**工作机制**：

1. **会话开始**：冻结快照，注入 system prompt

   - 好处：保持 system prompt 稳定，有利于前缀缓存（Prompt Caching）
2. **会话中途**：通过 `memory` 工具实时写入磁盘（持久化）

   - 操作：`add` / `replace` / `remove` / `read`
   - 匹配方式：短唯一子串匹配（非全文匹配或 ID 匹配）
3. **下次会话**：重新加载最新快照

**安全机制**：写入前自动扫描以下威胁模式：

- Prompt 注入（"ignore previous instructions"）
- 角色劫持（"you are now"）
- 隐蔽行为（"do not tell the user"）
- 密钥泄露（curl/wget + API KEY）
- SSH 后门（authorized_keys）
- 文件锁：Unix 使用 fcntl，Windows 使用 msvcrt

### 5.2 第二层：上下文窗口压缩



**实现**: `agent/context_compressor.py`



当对话 token 数接近模型上下文窗口上限时自动触发。



**压缩策略**：



```Plain Text
[保护头部 N 条消息] + [压缩中间轮次] + [保护尾部最近消息]
```



**摘要结构**：



```Plain Text
[CONTEXT COMPACTION — REFERENCE ONLY]
## Resolved Questions（已解决问题）
## Pending Questions（挂起问题）
## Active Task（当前活跃任务）
## Remaining Work（剩余工作）
## Key Decisions（关键决策）
```



**技术细节**：

- 使用辅助模型（便宜/快速）执行压缩，不占用主模型额度
- 压缩比例：摘要预算 = 压缩内容的 20%，上限 12,000 tokens
- 迭代压缩：多次压缩时保留之前的摘要信息
- 工具输出预处理：压缩前先修剪冗长的工具输出（低成本预过滤）
- 无效压缩检测：连续 2 次压缩节省率不足时暂停自动压缩

### 5.3 第三层：外部记忆插件



**实现**: `agent/memory_provider.py`（抽象基类）+ `agent/memory_manager.py`（编排器）+ `plugins/memory/`（具体实现）



**MemoryProvider 生命周期**：



```Plain Text
initialize(session_id, **kwargs)
    ↓
system_prompt_block()     → 生成注入 system prompt 的静态文本
    ↓ （每轮对话）
prefetch(query)           → 对话前背景召回
sync_turn(user, asst)     → 对话后异步写入
    ↓ （可选钩子）
on_turn_start()           → 每轮开始
on_session_end()          → 会话结束提取
on_session_switch()       → 会话切换
on_pre_compress()         → 压缩前提取
on_memory_write()         → 镜像内置记忆写入
on_delegation()           → 子代理观察
    ↓
shutdown()                → 清理退出
```



**已支持的外部后端**：

- **Honcho** — 方言式用户建模
- **Mem0** — 智能记忆层
- **Hindsight** — 回溯分析
- **Supermemory** — 超级记忆

**限制**：同一时间只能激活一个外部记忆提供商（防止工具 schema 膨胀和后端冲突）。



**MemoryManager 编排**：



```Python
# run_agent.py 中的集成方式
self._memory_manager = MemoryManager()
self._memory_manager.add_provider(plugin_provider)  # 最多一个外部

# 系统提示词
prompt_parts.append(self._memory_manager.build_system_prompt())

# 每轮对话前
context = self._memory_manager.prefetch_all(user_message)

# 每轮对话后
self._memory_manager.sync_all(user_msg, assistant_response)
self._memory_manager.queue_prefetch_all(user_msg)
```



**流式清洗**：`StreamingContextScrubber`（`agent/memory_manager.py`）是一个状态机，在流式输出中实时过滤记忆上下文的 fence 标记（`<memory-context>`），防止内部记忆内容泄漏到用户界面。



### 5.4 第四层：会话搜索与跨会话召回



**实现**: `SessionDB.search_messages()` + FTS5

- 基于 SQLite FTS5 的全文搜索引擎
- 支持跨所有历史会话的消息检索
- 配合 LLM 摘要化实现跨会话的语义召回
- 用户可通过 `/resume`、`/history` 等命令访问

### 5.5 四层架构总览



```Plain Text
┌─────────────────────────────────────────────────┐
│  第一层: 文件记忆 (MEMORY.md / USER.md)          │
│  生命周期: 跨会话持久化                            │
│  特点: 会话开始时冻结注入, 会话中实时写入          │
├─────────────────────────────────────────────────┤
│  第二层: 上下文压缩 (ContextCompressor)           │
│  生命周期: 单会话内, token 超限时触发              │
│  特点: 辅助模型生成结构化摘要, 保护首尾消息        │
├─────────────────────────────────────────────────┤
│  第三层: 外部记忆插件 (MemoryProvider)             │
│  生命周期: 跨会话持久化, 由后端自行管理            │
│  特点: 可插拔后端, 每轮 prefetch + sync           │
├─────────────────────────────────────────────────┤
│  第四层: 会话搜索 (FTS5)                          │
│  生命周期: 永久, 基于 SQLite                       │
│  特点: 全文检索 + LLM 摘要化跨会话召回             │
└─────────────────────────────────────────────────┘
```



---



## 六、Hermes 调用 Claude Code 可行性分析



### 6.1 结论



**完全可行，且已有现成方案。**



Hermes 已内置 Claude Code 集成技能：`skills/autonomous-ai-agents/claude-code/SKILL.md`（746 行详细指南）。



### 6.2 调用模式



#### 模式 1：Print 模式（推荐，适合大多数场景）



```Python
terminal(
    command="claude -p 'Fix the auth bug in src/auth.py' --allowedTools 'Read,Edit' --max-turns 10",
    workdir="/path/to/project",
    timeout=120
)
```



特点：

- 一次性任务，返回结果后退出
- 无需 PTY，无交互式对话框
- 支持 JSON 输出（`--output-format json`）
- 支持流式 JSON（`--output-format stream-json`）
- 支持会话续接（`--resume` / `--continue`）
- 支持 JSON Schema 结构化输出（`--json-schema`）

返回示例：

```JSON
{
  "type": "result",
  "subtype": "success",
  "result": "修复内容...",
  "session_id": "75e2167f-...",
  "num_turns": 3,
  "total_cost_usd": 0.0787,
  "duration_ms": 10276,
  "stop_reason": "end_turn",
  "usage": { "input_tokens": 5, "output_tokens": 603 }
}
```



#### 模式 2：tmux 交互模式（适合多轮迭代，仅 Linux/macOS/WSL2）



> **Windows 不可用**：tmux 是 Unix 工具，Windows 原生不支持。Windows 上需用 Print 模式 + 多次 `claude -p` 拼接上下文来模拟多轮交互。



```Python
# 1. 创建 tmux 会话
terminal(command="tmux new-session -d -s claude-work -x 140 -y 40")

# 2. 启动 Claude Code
terminal(command="tmux send-keys -t claude-work 'cd /project && claude' Enter")

# 3. 等待启动并处理信任对话框
terminal(command="sleep 5 && tmux send-keys -t claude-work Enter")

# 4. 发送任务
terminal(command="tmux send-keys -t claude-work 'Refactor the auth module' Enter")

# 5. 监控进度
terminal(command="sleep 15 && tmux capture-pane -t claude-work -p -S -50")

# 6. 发送后续指令
terminal(command="tmux send-keys -t claude-work 'Now add unit tests' Enter")

# 7. 完成后清理
terminal(command="tmux send-keys -t claude-work '/exit' Enter")
```



特点：

- 完整的交互式 REPL
- 支持多轮迭代（重构 → 审查 → 修复 → 测试）
- 可使用 CC 的斜杠命令（`/compact`, `/review`, `/model`）
- 需要 tmux 进行窗口管理

#### 模式 3：并行多实例（仅 Linux/macOS/WSL2）



> **Windows 不可用**：依赖 tmux。Windows 上可用 `delegate_task` 启动多个子代理，每个子代理各自调 `claude -p` 实现并行。



```Python
# 同时启动多个独立的 Claude Code 任务
terminal(command="tmux new-session -d -s task1 && tmux send-keys -t task1 'claude -p \"Fix backend bug\" --max-turns 10' Enter")
terminal(command="tmux new-session -d -s task2 && tmux send-keys -t task2 'claude -p \"Write integration tests\" --max-turns 15' Enter")
terminal(command="tmux new-session -d -s task3 && tmux send-keys -t task3 'claude -p \"Update docs\" --max-turns 5' Enter")
```



### 6.3 调用链路



```Plain Text
方式 A: 直接调用
┌──────────────┐     terminal_tool     ┌──────────────┐
│ Hermes Agent │ ───────────────────→ │ Claude Code  │
│   (主代理)    │ ←─────────────────── │   (CLI 进程)  │
└──────────────┘    JSON 结果返回      └──────────────┘

方式 B: 通过子代理委派
┌──────────────┐  delegate_task  ┌──────────────┐  terminal_tool  ┌──────────────┐
│ Hermes Agent │ ─────────────→ │  子代理        │ ──────────────→ │ Claude Code  │
│   (父代理)    │                │  (AIAgent)    │ ←────────────── │   (CLI 进程)  │
└──────────────┘                 └──────────────┘   结果返回       └──────────────┘
```



### 6.4 反向集成：Claude Code 调用 Hermes



通过 MCP 协议实现双向集成：



```Bash
# 在 Claude Code 中注册 Hermes MCP 服务器
claude mcp add hermes -- hermes mcp serve
```



注册后 Claude Code 可直接：

- 列出/读取 Hermes 的会话和消息
- 通过 Hermes 发送消息到任意平台（Telegram、Discord 等）
- 查看和管理审批请求
- 访问 Hermes 的频道目录

### 6.5 前置条件



| 条件 | 说明 |
|-|-|
| 安装 Claude Code | `npm install -g @anthropic-ai/claude-code` |
| 认证方式 | OAuth 登录（`claude auth login`）或设置 `ANTHROPIC_API_KEY` |
| 版本要求 | Claude Code v2.x+ |
| 终端后端 | 本地终端即可（Print 模式）；tmux 需额外安装（交互模式），Windows 不支持 |
| 操作系统 | Print 模式：全平台（含 Windows 原生）；交互/并行模式：仅 Linux/macOS/WSL2 |



### 6.6 风险与注意事项



| 风险 | 级别 | 说明 |
|-|-|-|
| **双层 LLM 成本** | 高 | Hermes + CC 各自独立调用 LLM，费用叠加。建议设置 `--max-budget-usd` 和 `--max-turns` |
| **延迟叠加** | 中 | 通过 terminal_tool 调用 CC 有额外的进程启动和 IO 开销。Print 模式延迟低于交互模式 |
| **上下文信息损耗** | 中 | Hermes → CC 的信息传递依赖自然语言描述，不如直接 API 调用精确 |
| **错误处理** | 中 | CC 可能因权限、额度、网络等原因失败，需要 fallback 逻辑 |
| **Windows 兼容性** | 中 | Print 模式可用；交互模式和并行模式依赖 tmux，Windows 原生不可用，需 WSL2 |
| **安全边界** | 中 | `--dangerously-skip-permissions` 跳过所有权限检查，需谨慎使用 |



### 6.7 最佳实践建议



1. **优先使用 Print 模式** — 更简洁、无对话框处理、有结构化输出，且是 Windows 唯一可用的模式
2. **始终设置 `--max-turns`** — 防止无限循环和费用失控
3. **使用 `--allowedTools` 限制工具** — 仅开放任务所需的工具
4. **指定 `workdir`** — 保持 CC 聚焦在正确的项目目录
5. **使用 `--output-format json`** — 便于程序化解析结果
6. **监控成本** — 解析返回的 `total_cost_usd` 字段
7. **Windows 多轮交互替代方案** — 将上一轮 `claude -p` 的输出拼接到下一轮 prompt 中，模拟上下文延续
8. **会话续接** — 使用 `--resume` 或 `--continue` 延续之前的任务
9. **CI/自动化场景** — 使用 `--bare` 模式跳过插件/hook/MCP 发现，加速启动

---



## 七、技术特征总结



| 维度 | 技术选型 |
|-|-|
| 语言 | Python 3.11+，asyncio 异步 |
| 依赖管理 | uv + exact-pinned 策略（`==X.Y.Z`） |
| 包构建 | setuptools + pyproject.toml |
| 数据库 | SQLite + WAL + FTS5 |
| 容器化 | Dockerfile + docker-compose.yml |
| CI/CD | GitHub Actions |
| 代码质量 | Ruff (lint) + ty (type check) + pytest |
| 前端 | Ink (React) 终端 UI |
| 文档站 | Docusaurus |
| Nix | flake.nix 支持 |
| 国际化 | locales/ 多语言目录 |
| 供应链安全 | 严格精确锁定依赖 + 惰性安装（`lazy_deps.py`） |



---



## 附录 A：代码量分布



| 模块 | 代码行数 | 占比 |
|-|-|-|
| `hermes_cli/` | 85,084 | 28.7% |
| `plugins/` | 33,355 | 11.2% |
| `tools/` | 59,659 | 20.1% |
| `gateway/` | 25,186 | 8.5% |
| `agent/` | 36,467 | 12.3% |
| `run_agent.py` | 15,919 | 5.4% |
| `cli.py` | 13,567 | 4.6% |
| `hermes_state.py` | 2,966 | 1.0% |
| 其他根文件 | ~4,600 | 1.5% |
| `environments/` | ~2,000 | 0.7% |
| 其他模块 | ~18,000 | 6.0% |
| **合计** | **~296,000** | 100% |



注：含注释和空行。纯代码约 6.7 万行 Python。



## 附录 B：巨型文件清单



以下文件超过 1,000 行，修改时需特别关注影响范围：



| 文件 | 行数 | 职责 |
|-|-|-|
| `gateway/run.py` | 16,671 | 消息网关主循环 |
| `run_agent.py` | 15,919 | AIAgent 核心对话循环 |
| `cli.py` | 13,567 | CLI 交互式终端 |
| `hermes_state.py` | 2,966 | SQLite 会话存储 |
| `trajectory_compressor.py` | 1,508 | 上下文压缩 |



## 附录 C：近期版本发布记录



| 版本 | 日期 |
|-|-|
| v2026.5.7 | 2026-05-07 |
| v2026.4.30 | 2026-04-30 |
| v2026.4.23 | 2026-04-23 |
| v2026.4.16 | 2026-04-16 |
| v2026.4.13 | 2026-04-13 |
| v2026.4.8 | 2026-04-08 |
| v2026.4.3 | 2026-04-03 |
| v2026.3.30 | 2026-03-30 |
