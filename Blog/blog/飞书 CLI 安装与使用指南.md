---
title: "飞书 CLI 安装与使用指南"
date: "2026-07-02"
categories:
  - AI 与编程工具
tags:
  - 飞书
  - CLI
  - 教程
---

# 飞书 CLI 安装与使用指南

> 📌 **本文均为飞书 CLI 生成**

## 一、飞书 CLI 是什么？

飞书 CLI 是飞书官方推出的一款命令行工具。你可以把它理解为一个"翻译官"——它把你或者你使用的 AI 工具（比如 Claude Code、Cursor、Codex、TRAE 等）的指令，翻译成飞书能理解的操作。

简单来说，装上飞书 CLI 之后，你可以对 AI 说：

- "帮我查一下明天的日程"
- "给我创建一篇飞书文档"
- "把我这个文件上传到飞书云空间"
- "帮我看看最近有没有未读邮件"
- "给这个群发一条消息"

AI 会通过飞书 CLI 直接在飞书里帮你完成这些事情，不需要你手动打开飞书去操作。

### 飞书 CLI 能做什么？

飞书 CLI 覆盖了飞书绝大多数核心功能，以下是完整的能力列表：

| 业务域 | 命令 | 能做什么 |
|-|-|-|
| 消息与群组 | `lark-cli im` | 搜索消息和群聊、发送消息（文字/图片/文件）、回复话题、管理群成员、表情回应、消息置顶 |
| 云文档 | `lark-cli docs` | 创建文档、读取内容、更新正文、插入图片附件、搜索云文档、管理文档评论 |
| 云空间 | `lark-cli drive` | 上传下载文件、整理目录、导入导出文档（支持 PDF 等格式）、管理权限和评论、本地与云空间同步 |
| 电子表格 | `lark-cli sheets` | 创建表格、读写单元格、批量追加数据、查找替换、筛选视图、导出下载 |
| 多维表格 | `lark-cli base` | 管理数据表、字段（含公式/查找引用/跨表计算）、记录、视图、表单、仪表盘、自动化工作流、角色权限 |
| 日历 | `lark-cli calendar` | 查看日程、创建/修改/删除日程、查询忙闲、智能推荐空闲时间、预定会议室、回复邀约 |
| 视频会议 | `lark-cli vc` | 搜索会议、获取纪要和逐字稿、关联日程文档 |
| 妙记 | `lark-cli minutes` | 搜索妙记、下载音视频、获取总结和待办章节 |
| 邮箱 | `lark-cli mail` | 搜索/读取/起草/发送/回复/转发/归档邮件、管理文件夹标签规则 |
| 任务 | `lark-cli task` | 创建任务、更新状态、拆分子任务、管理清单和协作成员 |
| 知识库 | `lark-cli wiki` | 查询知识空间、管理成员、管理节点和文档层级、创建/移动/复制节点 |
| 通讯录 | `lark-cli contact` | 查询用户信息、搜索同事、查看部门信息 |
| 幻灯片 | `lark-cli slides` | 创建演示文稿、读取页面内容、增删幻灯片 |
| 画板 | `lark-cli whiteboard` | 读取画板、导出图片、用 DSL / PlantUML / Mermaid 更新画板 |
| OKR | `lark-cli okr` | 查看周期、管理目标和关键结果、维护对齐关系和量化指标 |
| 审批 | `lark-cli approval` | 查询审批实例、处理审批任务 |
| 考勤 | `lark-cli attendance` | 查询考勤打卡记录 |
| Markdown | `lark-cli markdown` | 在云空间创建、获取、覆盖 Markdown 文件 |
| 通用 API | `lark-cli api` | 直接调用任意飞书开放平台 API（支持 GET / POST / PUT / DELETE 等） |
| 实时事件 | `lark-cli event` | 订阅和消费飞书实时事件推送 |

## 二、环境要求

开始安装之前，请确保你的电脑上已经安装了：

- **Node.js** — 一个 JavaScript 运行环境。如果你不确定有没有安装，可以在终端输入 `node -v` 查看。如果没有安装，可以去 https://nodejs.org 下载安装。
- **npm / npx** — 通常随 Node.js 一起安装，无需额外操作。

## 三、安装

### 方式一：让 AI 帮你装（推荐）

将下面这段话直接发给你的 AI 工具（Claude Code、Cursor、Codex、TRAE 等），它会自动帮你完成全部安装和配置：

```Plain Text
帮我安装飞书 CLI：https://open.feishu.cn/document/no_class/mcp-archive/feishu-cli-installation-guide.md

```

安装完成后，**请重启你的 AI 工具**以确保所有功能完整加载。

### 方式二：一键安装

如果你更习惯自己操作终端，也可以直接执行：

```Shell
npx @larksuite/cli@latest install

```

这个命令会自动完成 CLI 安装、Skill 安装和飞书应用配置。

## 四、配置应用凭证

如果你使用了上一章的方式一（AI 代装）或方式二（一键安装），应用凭证已经自动配置好了，无需再手动操作。

如需重新配置或使用已有应用：

```Shell
lark-cli config init --new    # 创建新应用
lark-cli config init          # 使用已有应用（输入 App ID 和 App Secret）
lark-cli config show          # 查看当前配置

```

如果使用过程中提示缺少权限，直接告诉你的 AI 工具，它会帮你自动申请，你只需在飞书开放平台审批通过即可。

## 五、用户授权

如果你使用了上一章的方式一（AI 代装），用户授权也已经自动完成了，AI 会引导你在浏览器中扫码确认。

如果后续使用中需要重新授权或补充权限，也可以让 AI 帮你操作：

```Shell
lark-cli auth login --recommend          # 推荐方式登录
lark-cli auth login --domain calendar    # 只授权日历相关权限
lark-cli auth login --domain all         # 授权所有权限
lark-cli auth login --scope "权限名"     # 补充特定权限
lark-cli auth status                     # 查看授权状态
lark-cli auth logout                     # 登出

```

## 六、健康检查

如果安装或使用过程中遇到问题，可以运行健康检查命令快速排查：

```Shell
lark-cli doctor

```

该命令会自动检查以下内容：

- CLI 版本是否最新
- 配置文件是否存在
- 应用凭证是否正确
- 用户 Token 是否有效
- 飞书服务器网络连通性

## 八、常见问题

**Q：安装后提示命令不存在？**

CLI 安装后需要确保其所在目录已加入系统 PATH。可以通过 `npm root -g` 查看 npm 全局安装目录，确认该目录在 PATH 中。

**Q：授权失败，提示"授权码已过期"？**

OAuth 授权码有效期只有几分钟。超时后重新执行 `lark-cli auth login` 即可获取新的授权链接。

**Q：调用 API 提示权限不足？**

根据报错信息中的提示，使用 `lark-cli auth login --scope "<权限名>"` 补充对应权限。如果应用本身未开通该权限，需要先在飞书开放平台后台开通。

**Q：应用创建后提示"pending approval"（等待审批）？**

新创建的应用需要在飞书开放平台完成审批后才能正常使用。进入开放平台找到对应应用，完成审批流程后重试。

**Q：支持国际版 Lark 吗？**

支持。通过 `lark-cli config init` 配置国际版 Lark 的应用即可使用。

**Q：企业管理员可以控制权限吗？**

可以。CLI 创建的应用仍然遵循企业的统一管控规则，管理员可以在飞书管理后台对应用进行权限管控。

---

> **参考文档：**
