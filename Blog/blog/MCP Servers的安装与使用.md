---
title: "MCP是什么"
date: "2026-07-16"
categories:
  - AI 与编程工具
tags:
  - MCP
  - 教程
  - 工具
---

# MCP是什么

MCP (Model Context Protocol)

模型上下文协议（MCP）是一个创新的开源协议，它重新定义了大语言模型（LLM）与外部世界的互动方式。MCP 提供了一种标准化方法，使任意大语言模型能够轻松连接各种数据源和工具，实现信息的无缝访问和处理。MCP 就像是 AI 应用程序的 USB-C 接口，为 AI 模型提供了一种标准化的方式来连接不同的数据源和工具。



# MCP能干什么

MCP服务器极大拓展了AI的应用场景：

1. 开发辅助：通过Git、GitLab集成，AI可以直接参与代码开发流程
2. 信息获取：通过Fetch和Playwright，AI可以获取实时网络信息
3. 系统操作：通过Filesystem，AI可以执行文件操作
4. 设计实现：通过Figma集成，AI可以更准确地将设计转为代码
5. 数据处理：通过Redis集成，AI可以操作数据存储



# MCP的技术架构特点

MCP服务器作为AI与外部系统之间的桥梁，具有以下架构特点：

1. 微服务设计：每个MCP服务器专注于特定领域能力的提供
2. 标准化接口：遵循统一的协议标准，便于集成和扩展
3. 能力封装：将复杂的外部系统能力以结构化的方式提供给AI模型
4. 安全边界：建立AI与外部系统间的安全交互机制



# 安装

截止成文时，已经有很多AI工具客户端支持调用MCP服务器了，包括但不限于：

> 注：原文此处内嵌了一张"支持 MCP 的 AI 客户端"飞书表格，导出后已失效，故移除。

本文以**cursor**为例，来实现安装使用流程。

其余软件接入MCP的方式也大同小异，不再过多赘述。



## 从哪儿获取



mcp有很多第三方的市场，他们收集了许许多多的mcp服务器，此处推荐三个常用市场

- [MCP Servers](https://mcp.so/)
- [MCP市场 - 国内最全MCP Servers收录平台](https://mcpmarket.cn/)
- [MCP Market | Discover Top MCP Servers](https://mcpmarket.com/)

市场内有各种各样官方非官方的mcp服务器，也有可以远程调用的也有必须本地部署的。

## 准备工作

**这里需要注意一点，如果是本地部署，则需要在本地安装运行环境。**

> 注：原文此处为"官方支持的 SDK"截图，飞书图床链接已失效，故移除。

以上为官方支持的SDK，也就是说可以用这些语言来写MCP服务器，相对的想要运行这些MCP服务器也需要准备这些运行环境。



目前是前两个用的多一点，**建议安装python和uv，nodejs**



## 开始安装

### fetch

我们以[**fetch**](https://mcp.so/server/fetch/modelcontextprotocol)为例

从页面上可以看到这是 *modelcontextprotocol* 官方创建的 ，名字后面就是本mcp的[仓库链接](https://github.com/modelcontextprotocol/servers/tree/main/src/fetch)。



可以看到这个页面分成三个tab页面，分别是overview、context、tools。

- overview 概述页面概述页面概括了当前MCP服务器是干什么的，怎么使用，主要功能，以及使用场景和常见问题。
- Context 内容页面

内容页面一般是告诉用户当前MCP服务器的内容，以及安装步骤。

- Tools 工具页面工具页面就是展示当前MCP有多少工具可供大模型调用。例如当前fetch MCP 服务器只有一个fetch工具，用来获取页面内容信息。



从context页面得知安装步骤

- 使用uv（推荐）
- 使用pip

[uv](https://github.com/astral-sh/uv)是开发ruff的公司 Astral 发布的高性能Python工具，用途是安装python包，以及解析包版本之间的依赖。它的最大特点是快，相比现有的的工具都能够快一大截。

可以使用脚本安装，也可以使用pip安装，具体详情不在本文讨论范围内，请去https://github.com/astral-sh/uv自行了解



*为什么推荐uv？*

*因为如果使用`uv`作为运行工具的话，可以使用`uvx`命令直接运行`mcp-server-fetch`包，就类似`npm`里的`npx`命令，不需要复杂的项目配置，直接运行打包好的项目，****因此这两个命令在MCP服务器的安装里最常使用****。*



安装完成运行环境之后，接下来就是本地调用了

以cursor为例

1. 打开cursor右上角设置，打开页面中找到左侧MCP设置

1. 点击右上角新增按钮

将context页面中使用`uvx`命令的配置写入`mcp.json`文件中

例如：

```JSON
{
  "mcpServers": {
    "fetch": {
      "command": "uvx",
      "args": [
        "mcp-server-fetch"
      ]
    }
  }
}
```

1. 启动MCP服务器

mcp.json保存就能启动当前服务器

现在就能看到刚刚添加的fetch服务器，打开cursor会自动运行，点击右侧enabled可以关闭，点击刷新按钮可以重启。



如果正常安装了运行环境，那么等待一会就可以看到fetch左侧的黄色圆点变为绿色，并且下方Tools出现可用工具，例如：

这就代表这个MCP服务器可以使用了。



如果遇到报错，可以打开终端旁边的输出面板选择`cursor MCP`来查看报错信息以及问题



# 使用

搭建完成之后就可以直接使用了，fetch工具就是用来让大模型获取页面信息的工具。

例如：让他使用fetch工具来查看页面，获取信息

再例如：使用playwright来操作浏览器

再再例如：结合多个MCP服务器一起使用

# 推荐MCP服务器

- [Fetch MCP Server ](https://mcp.so/zh/server/fetch/modelcontextprotocol)

  - Fetch 是一个模型上下文协议（MCP）服务器，专为网页内容获取和转换而设计，允许大型语言模型（LLMs）通过将 HTML 转换为 markdown 格式来检索和处理网页内容，以便更容易使用。
- [Sequential Thinking MCP Server](https://mcp.so/zh/server/sequentialthinking/modelcontextprotocol)

  - Sequential Thinking 是一个 MCP 服务器实现，它通过结构化的思维过程提供了一个用于动态和反思性问题解决的工具。
- [Playwright Mcp](https://mcp.so/zh/server/playwright-mcp/microsoft)

  - Playwright Mcp 是一个模型上下文协议（MCP）服务器，使用 Playwright 提供浏览器**自动化功能**。此服务器使 LLMs 能够通过结构化的可访问性快照与网页交互，无需截图或视觉调整模型。
- [Time MCP Server](https://mcp.so/zh/server/time/modelcontextprotocol)

  - Time MCP Server 是一个模型上下文协议服务器，提供时间和时区转换功能。它使 LLMs 能够获取当前时间信息，并使用 IANA 时区名称进行时区转换，同时支持自动检测系统时区。
- [GitLab](https://mcp.so/zh/server/gitlab/modelcontextprotocol)

  - GitLab MCP Server 是一个 API，通过 GitLab 平台实现项目管理和文件操作。它通过用户友好的界面促进各种与 Git 相关的任务。
- [Git](https://github.com/modelcontextprotocol/servers/tree/main/src/git)

  - 一个用于 Git 仓库交互和自动化的模型上下文协议服务器。该服务器提供通过大型语言模型读取、搜索和操作 Git 仓库的工具。
- [Filesystem MCP Server](https://mcp.so/zh/server/filesystem/modelcontextprotocol)

  - Filesystem MCP Server 是一个 Node.js 服务器，它实现了模型上下文协议（MCP），用于执行各种文件系统操作。
- [Figma MCP Server](https://mcp.so/zh/server/Figma-Context-MCP/GLips)

  - Figma MCP Server 是一个专为向 AI 编码代理（如 Cursor）提供 Figma 布局信息的服务器，旨在增强它们准确实现设计的能力。
- [Redis](https://mcp.so/zh/server/redis/modelcontextprotocol)

  - Redis 是一个 Model Context Protocol 服务器，提供对 Redis 数据库的访问，使 LLMs 能够通过标准化工具与 Redis 键值存储进行交互。



# 注意事项

cursor的tools有数量限制，超出限制的可能无法调用。



# [Figma MCP Server](https://mcp.so/zh/server/Figma-Context-MCP/GLips)

Figma MCP Server 是一个专为向 AI 编码代理（如 Cursor）提供 Figma 布局信息的服务器，旨在增强它们准确实现设计的能力。说人话就是可以让AI看懂figma里的设计稿的桥梁。

### 安装

首先需要先全局安装`figma-developer-mcp`依赖

```JSON
npm install -g figma-developer-mcp
```

### 配置

然后配置cursor的mcp设置，不同的编辑器可能有不同的配置方式，此处以cursor为例

```JSON
{
  "mcpServers": {
    "figma-developer-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "figma-developer-mcp",
        "--stdio"
      ],
      "env": {
        "FIGMA_API_KEY": "这里填figma的token，往下看token获取"
      }
    }
  }
}
```



### Figma token获取

figma左上角-帮助和账户-账户设置-安全

生成一个token，该给的权限都给了点击生成

这个token就是需要填到json文件里的token，**只展示这一次，请小心保存**。

### 验证安装

再开关一下右侧的开关，名字左侧变绿还出现了tools应该就可以使用了

这时，你可以直接问他

这就算安装完成，可以使用了



### 使用

在figma里面右键拷贝为链接，然后直接丢给AI，AI就可以通过MCP工具获取到figma这一块的数据信息



接下来就可以让AI使用这些通过MCP获取到的数据来优化、生成对应代码了。



经过多次调整还是可以生成不错的前端组件样式的
