---
title: "Claude Code Skills 使用指南"
date: "2026-07-08"
categories:
  - AI 与编程工具
tags:
  - Claude Code
  - Skills
  - 指南
---

# Claude Code Skills 使用指南



> 本文档面向了解 Claude Code 但不熟悉 Skills 功能的用户，帮助你快速掌握 Skills 的创建、管理和使用。



---



## **📚 一、什么是 Skills？**



**Skills** 是教 Claude 如何完成特定任务的 Markdown 文件。你可以把它理解为 Claude 的"技能包"。



### **核心特点**



- ✅ **自动触发**：Claude 会根据你的请求自动选择合适的 Skill，无需手动调用

- ✅ **可复用**：一次创建，多次使用

- ✅ **可共享**：可以跨项目、跨团队共享



### **应用场景**



| 场景 | 示例 |
|-|-|
| 代码审查 | 使用团队标准审查 PR |
| 提交消息 | 按统一格式生成 Git 提交消息 |
| 文档生成 | 按项目规范生成 API 文档 |
| 数据查询 | 查询公司数据库架构 |



---



## **📁 二、Skills 存放位置**



Skills 存放的位置决定了它的适用范围：



| 位置 | 路径 | 适用范围 | 优先级 |
|-|-|-|-|

| **企业** | 参见托管设置 | 组织内所有用户 | ⭐⭐⭐⭐⭐ 最高 |

| **个人** | `~/.claude/skills/` | 你自己，跨所有项目 | ⭐⭐⭐⭐ |

| **项目** | `.claude/skills/` | 当前仓库的所有协作者 | ⭐⭐⭐ |

| **插件** | 与插件捆绑 | 安装该插件的任何人 | ⭐⭐ |



> 💡 **优先级规则**：企业 > 个人 > 项目 > 插件



---



## **🔍 三、Skills vs 其他功能**



Claude Code 提供多种自定义方式，了解它们的区别很重要：



| 功能 | 触发方式 | 适用场景 |
|-|-|-|

| **Skills** | Claude 自动选择 | 给 Claude 专业知识（如审查标准） |

| **斜杠命令** | 用户输入 `/command` | 可重用的操作流程（如 `/deploy staging`） |

| **CLAUDE.md** | 自动加载到每个对话 | 项目全局说明（如代码规范） |

| **子代理** | Claude 委托或显式调用 | 需要独立上下文或工具访问 |

| **Hooks** | 特定工具事件触发 | 在文件保存等事件上运行脚本 |

| **MCP 服务器** | Claude 按需调用 | 连接外部工具和数据源 |



### **关键区别**



- **Skills vs 斜杠命令**：Skills 自动触发，斜杠命令需要手动输入

- **Skills vs 子代理**：Skills 添加知识，子代理提供隔离的执行环境

- **Skills vs MCP**：Skills 告诉 Claude **如何**使用工具，MCP **提供**工具



---



## **🛠️ 四、创建你的第一个 Skill**



### **4.1 基本结构**



每个 Skill 目录必须包含一个 `SKILL.md` 文件：



```Plain Text
my-skill/
└── SKILL.md
```



### **4.2 SKILL.md 模板**



```Markdown
---
name: your-skill-name
description: 简要描述这个 Skill 的功能和使用场景
```

**---**



# **Skill 名称**



## **使用说明**

提供清晰的步骤指导。



## **示例**

展示具体的使用示例。

```Plain Text

```

### **4.3 完整示例**



创建一个生成 Git 提交消息的 Skill：



**目录结构**：



```Plain Text
commit-helper/
└── SKILL.md
```



**SKILL.md 内容**：



```Markdown
---
name: generating-commit-messages
description: 从 git diff 生成清晰的提交消息。在编写提交消息或审查暂存更改时使用。
```

**---**



# **生成提交消息**



## **使用说明**



1. 运行 `git diff --staged` 查看更改
2. 我会建议包含以下内容的提交消息：

   - 50 字符以内的摘要
   - 详细描述
   - 受影响的组件

## **最佳实践**



- 使用现在时态
- 说明做什么和为什么，而不是怎么做

```Plain Text

---
```

## **⚙️ 五、Skill 配置详解**



### **5.1 元数据字段**



| 字段 | 必需 | 说明 |
|-|-|-|
| `name` | 是 | Skill 名称，只能包含小写字母、数字和连字符（最多 64 字符） |
| `description` | 是 | 功能描述和使用场景（最多 1024 字符）- 决定 Claude 何时使用它 |
| `allowed-tools` | 否 | 允许 Claude 使用的工具列表，无需权限批准 |
| `model` | 否 | 指定使用的模型（如 `claude-sonnet-4-20250514`） |
| `context` | 否 | 设置为 `fork` 可在独立子代理上下文中运行 |
| `agent` | 否 | 指定 `context: fork` 时使用的代理类型 |
| `hooks` | 否 | 定义生命周期钩子（PreToolUse、PostToolUse、Stop） |
| `user-invocable` | 否 | 控制是否在斜杠命令菜单中显示，默认 `true` |



### **5.2 限制工具访问**



使用 `allowed-tools` 限制 Skill 可以使用的工具：



```YAML
---
name: reading-files-safely
description: 只读文件访问，不进行任何修改
allowed-tools: Read, Grep, Glob
---
```



或使用 YAML 列表格式：



```YAML
---
name: reading-files-safely
description: 只读文件访问，不进行任何修改
allowed-tools:
  - Read
  - Grep
  - Glob
---
```



### **5.3 控制可见性**



`user-invocable` 字段控制 Skill 在斜杠菜单中的显示：



| 设置 | 斜杠菜单 | Skill 工具 | 自动发现 | 用例 |
|-|-|-|-|-|
| `user-invocable: true`（默认） | 可见 | 允许 | 是 | 用户直接调用的 Skills |
| `user-invocable: false` | 隐藏 | 允许 | 是 | 仅 Claude 使用的内部 Skills |
| `disable-model-invocation: true` | 可见 | 阻止 | 是 | 仅限用户手动调用 |



---



## **📦 六、高级功能**



### **6.1 多文件 Skills（渐进式披露）**



对于复杂的 Skills，使用支持文件避免消耗上下文：



```Plain Text
pdf-processing/
├── SKILL.md              # 概述和快速入门
├── FORMS.md              # 表单字段映射
├── REFERENCE.md          # API 详细参考
└── scripts/
    ├── fill_form.py      # 实用脚本
    └── validate.py       # 验证脚本
```



**SKILL.md 示例**：



```Markdown
---
name: pdf-processing
description: 提取文本、填写表单、合并 PDF。需要 pypdf 和 pdfplumber 包。
allowed-tools: Read, Bash(python:*)
```

**---**



# **PDF 处理**



## **快速入门**



提取文本：

```Python
import pdfplumber
with pdfplumber.open("doc.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```



## **其他资源**



- 表单填写说明：参见 `FORMS.md`
- API 详细参考：参见 `REFERENCE.md`

## **实用脚本**



验证输入文件：

```Bash
python scripts/validate.py input.pdf
```

### 6.2 在分叉上下文中运行

使用 `context: fork` 在独立子代理中运行 Skill：

```yaml
---
name: code-analysis
description: 分析代码质量并生成详细报告
context: fork
agent: general-purpose
---
```



### **6.3 定义 Hooks**



在 Skill 生命周期中运行脚本：



```YAML
---
name: secure-operations
description: 执行带安全检查的操作
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/security-check.sh $TOOL_INPUT"
          once: true
---
```



---



## **🚀 七、分发 Skills**



### **7.1 项目 Skills**



将 `.claude/skills/` 提交到版本控制：



```Bash
git add .claude/skills/
git commit -m "Add project skills"
```



### **7.2 插件分发**



在插件中创建 `skills/` 目录：



```Plain Text
my-plugin/
├── .claude-plugin/
│   └── plugin.json
└── skills/
    └── my-skill/
        └── SKILL.md
```



### **7.3 企业托管**



管理员可以通过托管设置在组织范围内部署 Skills。



---



## **🧪 八、测试和故障排除**



### **8.1 查看可用 Skills**



向 Claude 提问：



```Plain Text
What Skills are available?
```



### **8.2 测试特定 Skill**



执行与 Skill 描述匹配的任务，例如：



```Plain Text
Review the changes in my current branch.
```



### **8.3 常见问题**



| 问题 | 解决方案 |
|-|-|

| **Skill 不触发** | 检查 `description` 是否具体，包含触发关键词 |

| **Skill 不加载** | 检查文件路径和 `SKILL.md` 文件名（区分大小写） |

| **YAML 语法错误** | 确保前置部分以 `---` 开始和结束，使用空格缩进 |

| **插件 Skills 不出现** | 清除插件缓存：`rm -rf ~/.claude/plugins/cache` |

| **多个 Skills 冲突** | 使用更具体的触发术语区分描述 |



### **8.4 调试模式**



```Bash
claude --debug
```



---



## **📋 九、快速参考**



### **最小 Skill 模板**



```Markdown
---
name: my-skill
description: 简短描述，说明这个 Skill 做什么以及何时使用
```

**---**



# **Skill 标题**



## **使用说明**

1. 步骤一
2. 步骤二

## **示例**

这里展示使用示例。

```Plain Text

```

### **关键要点**



1. **description 是关键** - 它决定 Claude 何时使用你的 Skill

2. **使用具体触发词** - 包含用户会提到的关键词

3. **渐进式披露** - 复杂文档放在支持文件中

4. **测试 Skill** - 使用匹配描述的任务来测试



---



## **📖 十、后续学习**



- [什么是 Skills？](https://code.claude.com/docs/zh-CN/skills) - Skills 的背景知识
- [Hooks 配置](https://code.claude.com/docs/zh-CN/hooks) - Hooks 的完整配置格式

---



**文档版本**：基于 Claude Code Skills 官方文档整理

**最后更新**：2025-01-19
