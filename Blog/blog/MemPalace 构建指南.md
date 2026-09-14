---
title: "MemPalace 构建指南"
date: "2026-07-06"
categories:
  - 项目实践
tags:
  - MemPalace
  - 记忆系统
  - 指南
---

# MemPalace 构建指南

> 版本：v3.0.0 | 适用平台：Windows / macOS / Linux
>
> MemPalace 是一个本地语义搜索引擎，可以将项目代码和文档分块嵌入向量数据库，支持自然语言搜索。无需 API Key。



---



## **一、安装**



### **1.1 前置依赖**



- **Python 3.10+**（推荐 64 位）

- **pip**



### **1.2 安装 MemPalace**



```Bash
pip install mempalace
```



安装完成后会自动拉取以下依赖：

- `chromadb` — 向量数据库
- `pyyaml` — 配置文件解析

### **1.3 ChromaDB 嵌入模型**



ChromaDB 首次运行时会自动下载 ONNX 嵌入模型 `all-MiniLM-L6-v2`（约 79MB）。



**国内网络问题**：模型从 AWS S3 下载，国内可能极慢或超时。解决方案：



1. 手动下载模型到 ChromaDB 缓存目录：

   ```Plain Text
   缓存路径：C:\Users\<用户名>\.cache\chroma\onnx_models\all-MiniLM-L6-v2\
   ```
2. 下载地址（任选）：

   - HuggingFace：`https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2`
   - 设置 HuggingFace 镜像加速：

     ```Bash
     set HF_ENDPOINT=https://hf-mirror.com
     ```

---



## **二、配置**



### **2.1 初始化项目**



在项目根目录执行：



```Bash
mempalace init .
```



这会自动检测项目目录结构，生成 `mempalace.yaml` 配置文件。交互式地让你确认/修改检测到的 "房间"（room）。



如果不想交互，直接全部接受：



```Bash
mempalace init . --yes
```



### **2.2 mempalace.yaml 配置文件**



生成的配置文件示例：



```YAML
wing: my_project          # 项目名（最高层级）
rooms:                    # 房间列表（对应目录/模块）
  - name: backend         # 房间名
    description: Files from src/backend/
  - name: frontend
    description: Files from src/frontend/
  - name: general         # 兜底房间
    description: Files that don't fit other rooms
```



你可以手动编辑这个文件来调整房间分类。



### **2.3 数据存储位置**



嵌入数据默认存储在 `~/.mempalace/palace/` 目录下：



| 路径 | 内容 |
|-|-|
| `~/.mempalace/palace/chroma.sqlite3` | ChromaDB 向量数据库 |
| `~/.mempalace/config.json` | 全局配置 |



---



## **三、索引项目（Mine）**



### **3.1 基本用法**



```Bash
mempalace mine .
```



扫描项目目录，读取所有代码和文档文件，分块后生成向量嵌入存入 ChromaDB。



### **3.2 常用参数**



```Bash
# 指定 wing 名称（默认用目录名）
mempalace mine . --wing my_project

# 指定记录的 agent 名称
mempalace mine . --agent claude

# 限制处理文件数（用于测试或分批处理）
mempalace mine . --limit 500

# 预览模式（不实际写入）
mempalace mine . --dry-run
```



### **3.3 已索引的文件会自动跳过**



重复运行 `mine` 时，已经索引过的文件会被自动跳过，只处理新增或修改的文件。



### **3.4 默认跳过的目录**



以下目录会被自动忽略（硬编码在 `miner.py` 的 `SKIP_DIRS` 中）：



```Plain Text
.git, node_modules, __pycache__, .venv, venv, env,
dist, build, .next, coverage, .mempalace
```



以下文件会被自动忽略：



```Plain Text
mempalace.yaml, mempalace.yml, .gitignore, package-lock.json
```



### **3.5 支持的文件类型**



```Plain Text
.txt, .md, .py, .js, .ts, .jsx, .tsx, .json, .yaml, .yml,
.html, .css, .scss, .less, .sql, .toml, .xml, .properties,
.java, .kt, .groovy, .go, .rs, .c, .cpp, .h, .rb, .php,
.sh, .bash, .ps1, .dart, .swift, .r, .lua
```



---



## **四、搜索**



### **4.1 CLI 搜索**



```Bash
# 基本搜索
mempalace search "权限控制"

# 限制在特定 wing 搜索
mempalace search "表单权限" --wing my_project

# 限制在特定 room 搜索
mempalace search "登录逻辑" --room backend

# 指定返回结果数
mempalace search "API接口" --results 10
```



### **4.2 MCP 工具搜索（在 Claude Code 中使用）**



配置好 MCP 后，Claude Code 可以直接调用以下工具：



| MCP 工具 | 说明 |
|-|-|
| `mempalace_search` | 语义搜索项目内容 |
| `mempalace_status` | 查看宫殿状态（已索引的文件数等） |
| `mempalace_wake_up` | 获取项目概览上下文 |
| `mempalace_list_wings` | 列出所有 wing（项目） |
| `mempalace_list_rooms` | 列出所有 room（模块） |
| `mempalace_traverse` | 遍历内容层级结构 |
| `mempalace_find_tunnels` | 查找文件/概念之间的关联 |
| `mempalace_graph_stats` | 知识图谱统计 |
| `mempalace_kg_query` | 查询知识图谱关系 |
| `mempalace_kg_timeline` | 知识图谱时间线 |
| `mempalace_diary_write` | 写日记（记录决策、笔记） |
| `mempalace_diary_read` | 读取日记 |
| `mempalace_check_duplicate` | 检查重复内容 |
| `mempalace_get_aaak_spec` | 获取 AAAK 压缩规范 |
| `mempalace_get_taxonomy` | 获取分类体系 |
| `mempalace_add_drawer` | 手动添加一个 drawer |
| `mempalace_delete_drawer` | 删除指定 drawer |



---



## **五、其他命令**



### **5.1 查看状态**



```Bash
mempalace status
```



显示已索引的文件数、wing/room 分布等。



### **5.2 获取项目概览**



```Bash
mempalace wake-up
mempalace wake-up --wing my_project
```



生成项目的高层级摘要，适合在开始工作前快速了解项目结构。



### **5.3 压缩嵌入（高级）**



```Bash
mempalace compress
mempalace compress --wing my_project
mempalace compress --dry-run
```



使用 AAAK Dialect 压缩 drawers，约可减少 30 倍存储空间。



### **5.4 分割对话记录**



```Bash
mempalace split ./chats/
mempalace split ./chats/ --output-dir ./split-chats/
mempalace split ./chats/ --dry-run
```



将拼接的对话导出文件拆分为独立的会话文件，然后再用 `--mode convos` 索引。



---



## **六、配置 MCP Server（Claude Code 集成）**



### **6.1 在 `.claude.json` 中添加**



```JSON
{
  "mcpServers": {
    "mempalace": {
      "command": "cmd",
      "args": ["/c", "mempalace", "serve"]
    }
  }
}
```



### **6.2 全局配置（所有项目共享）**



编辑 `C:\Users\<用户名>\.claude.json`，在 `mcpServers` 中添加上述配置。



---



## **七、常见问题**



### **Q1: 首次 mine 下载 ONNX 模型失败/超时**



**原因**：国内网络访问 AWS S3 极慢。



**解决方案**：

1. 设置 HuggingFace 镜像后重试：

   ```Bash
   set HF_ENDPOINT=https://hf-mirror.com
   ```
2. 手动下载模型文件放到 `~/.cache/chroma/onnx_models/all-MiniLM-L6-v2/` 目录下。

### **Q2: Windows 下 Unicode 输出报错 `UnicodeEncodeError: 'gbk'`**



**原因**：Windows 终端默认 GBK 编码，MemPalace 输出了 Unicode 字符（如 `✓`）。



**解决方案**：

```Bash
set PYTHONIOENCODING=utf-8
mempalace mine .
```



### **Q3: 大项目 mine 时内存不足崩溃**



**原因**：ChromaDB 的嵌入数据 + ONNX 模型运行时内存开销。



**解决方案**：

1. 分批处理：

   ```Bash
   mempalace mine . --limit 500
   ```
2. 排除不必要的目录（修改 `miner.py` 中的 `SKIP_DIRS`）：

   ```Python
   # 路径：Python安装目录/lib/site-packages/mempalace/miner.py
   SKIP_DIRS = {
       ".git", "node_modules", "__pycache__", ".venv", "venv", "env",
       "dist", "build", ".next", "coverage", ".mempalace",
       "target",    # Java 构建输出
       ".idea",     # IntelliJ IDEA
       ".vscode",   # VS Code
       ".gradle",   # Gradle
       "logs",      # 日志
       "site",      # 静态站点生成
   }
   ```
3. 排除 lock 文件（修改 `scan_project` 函数中的跳过列表）：

   ```Python
   if filename in (...) or filename.endswith(".lock") or filename.endswith(".lock.yaml"):
       continue
   ```

### **Q4: 搜索结果显示乱码（Windows）**



**原因**：Windows 终端 GBK 编码与 UTF-8 内容冲突。



**解决方案**：

```Bash
set PYTHONIOENCODING=utf-8
mempalace search "关键词"
```



或在 MCP 中使用（Claude Code 内部自动处理编码）。



### **Q5: mine 速度慢**



**现状**：MemPalace 的嵌入模型（all-MiniLM-L6-v2）通过 ChromaDB 单线程调用，速度约 250-350 嵌入/分钟。大项目可能需要 30-60 分钟。



**优化建议**：

1. 排除不必要的文件（lock 文件、构建产物、静态资源等）
2. 使用 `--limit` 分批处理，避免内存堆积
3. 首次 mine 后增量更新很快（自动跳过已索引文件）

---



## **八、最佳实践**



1. **项目根目录放 `mempalace.yaml`**：确保在项目根目录执行 `mempalace init`，这样配置文件会跟着项目走。



2. **定期增量更新**：代码有较大变更后，重新执行 `mempalace mine .` 即可，已有文件会自动跳过。



3. **善用 room 分类**：编辑 `mempalace.yaml` 让文件按模块归类，搜索时可以用 `--room` 精确过滤。



4. **结合 MCP 使用**：在 Claude Code 中通过 MCP 工具搜索比 CLI 更方便，且不受 Windows 编码问题影响。



5. **用 diary 记录决策**：`mempalace_diary_write` 可以记录架构决策、踩坑经验等，后续可以通过搜索快速找回。



---



## **九、项目结构示意**



```Plain Text
某前端基础库/
├── mempalace.yaml          # MemPalace 配置（init 生成）
├── deploy/                 # → room: configuration
├── docs/                   # → room: documentation
├── 某后端服务/            # → room: 某后端服务
├── 某前端主项目/                # → room: 某前端主项目
├── ...                     # → 各自对应的 room
│
~/.mempalace/
├── config.json             # 全局配置
└── palace/
    └── chroma.sqlite3      # 向量数据库（所有项目共享）
```



MemPalace 采用 **Wing → Room → Drawer** 三级结构：

- **Wing**：一个项目（如 `某前端基础库`）

- **Room**：项目内的模块/目录（如 `某后端服务`、`某前端主项目`）

- **Drawer**：具体的内容块（一个文件的若干分块）
