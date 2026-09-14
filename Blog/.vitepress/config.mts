import { defineConfig } from 'vitepress'
// 注意:必须从 'vitepress-theme-teek/config' 深层入口导入,
// 不能从包根 'vitepress-theme-teek' 导入 —— 根入口会连带 import 'vitepress/theme',
// config 加载阶段走 Node 原生 ESM,无法解析 vitepress 主题入口的无扩展名导入和 CSS 导入,构建必挂。
// 深层入口只含配置函数与 vite 插件注册(文章列表/分类/标签数据来源),链路上没有 vitepress/theme。
import { defineTeekConfig } from 'vitepress-theme-teek/config'

const teekConfig = defineTeekConfig({
  // 关闭按文件树自动生成的平铺侧边栏,使用下方自定义分组 sidebar
  vitePlugins: { sidebar: false },

  // 首页卡片:隐藏精选文章和友情链接(以后要开就删掉这两个 enabled 或改回 true)
  topArticle: { enabled: false },
  friendLink: { enabled: false },

  // ---------------- Teek 主题配置 ----------------

  // 博主信息(首页卡片)
  blogger: {
    name: "54",
    slogan: "杂七杂八的写点东西",
    avatar: "/avatar.jpg",
  },

  // 评论区:giscus(基于 GitHub Discussions,替代原 gitalk)
  comment: {
    provider: "giscus",
    options: {
      repo: "Mr54233/Mr54233.github.io",
      repoId: "R_kgDOLn4B5g",
      category: "Announcements",
      categoryId: "DIC_kwDOLn4B5s4DFlkS",
      mapping: "pathname",
      strict: "0",
      reactionsEnabled: "1",
      emitMetadata: "0",
      inputPosition: "top",
      lang: "zh-CN",
      loading: "lazy",
      online: true, // 使用在线脚本,无需安装 giscus 依赖
    },
  },

  // 文章分析(首页统计卡片,使用 busuanzi 统计访问量)
  docAnalysis: {
    statistics: {
      provider: "busuanzi",
      siteView: true,
      pageView: true,
    },
  },

  // 页脚
  footerInfo: {
    copyright: {
      createYear: 2022,
      suffix: "By Mr54",
    },
  },

  // ---------------- VitePress 原生 themeConfig ----------------

  // https://vitepress.dev/reference/default-theme-config
  nav: [
    { text: '🏠 Home', link: '/' },
    { text: '📜 Blog', link: '/blog' },
  ],
  siteTitle: "54's blog",

  logo: "/favicon.ico",

  sidebar: [
    {
      text: '🏠 生活随笔',
      items: [
        { text: '穿普拉达的女王2', link: '/blog/穿普拉达的女王2' },
        { text: '浴室的灯坏了', link: '/blog/浴室的灯坏了' },
        { text: '你想活出怎样的人生', link: '/blog/你想活出怎样的人生' },
        { text: '离深随笔', link: '/blog/离深随笔' },
        { text: '初至南京', link: '/blog/初至南京' },
        { text: '总结一下实习一个多礼拜以来的问题', link: '/blog/总结一下实习一个多礼拜以来的问题' },
        { text: '旧年', link: '/blog/旧年' },
        { text: '终于回家', link: '/blog/终于回家' },
        { text: '记录一下写论文过程中遇到的问题', link: '/blog/记录一下写论文过程中遇到的问题' },
        { text: '迁移', link: '/blog/迁移' },
        { text: '万神殿看完了', link: '/blog/万神殿看完了' },
        { text: 'Hello world', link: '/blog/Hello world' }
      ]
    },
    {
      text: '🤖 AI 与编程工具',
      items: [
        { text: 'MCP 2026-07-28 规范，说点人话', link: '/blog/MCP 2026-07-28 规范，说点人话' },
        { text: 'Model Context Protocol 2026-07-28 规范', link: '/blog/Model Context Protocol 2026-07-28 规范' },
        { text: 'grill-with-docs 使用指南：怎么用，怎么用好', link: '/blog/grill-with-docs 使用指南：怎么用，怎么用好' },
        { text: 'grill-with-docs 技能家族深度解析：从写法到设计哲学', link: '/blog/grill-with-docs 技能家族深度解析：从写法到设计哲学' },
        { text: 'MCP Servers 的安装与使用', link: '/blog/MCP Servers的安装与使用' },
        { text: '怎么写好一个 Skill', link: '/blog/怎么写好一个Skill' },
        { text: 'Claude Code Skills 使用指南', link: '/blog/Claude Code Skills 使用指南' },
        { text: 'Claude Code Goal 命令编写指南', link: '/blog/Claude Code Goal 命令编写指南' },
        { text: 'RIPER-5 模式 + 多维度智能协作协议 (v4.9.12)', link: '/blog/RIPER-5 模式 + 多维度智能协作协议 (v4.9.12)' },
        { text: 'Hermes Agent 深度技术分析报告', link: '/blog/Hermes Agent 深度技术分析报告' },
        { text: '通过 Hermes Agent 将编码任务委托给 Claude Code 指南', link: '/blog/通过 Hermes Agent 将编码任务委托给 Claude Code 指南' },
        { text: '飞书 CLI 安装与使用指南', link: '/blog/飞书 CLI 安装与使用指南' },
        { text: '循环工程(Loop Engineering)详解', link: '/blog/循环工程(Loop Engineering)详解' },
        { text: '驾驭工程(Harness Engineering)详解', link: '/blog/驾驭工程(Harness Engineering)详解' },
        { text: 'OpenClaw 使用工具说明书', link: '/blog/OpenClaw 使用工具说明书' }
      ]
    },
    {
      text: '⚙️ 前端技术',
      items: [
        { text: 'TypeScript 学习笔记', link: '/blog/TypeScript' },
        { text: 'TypeScript 7.0：原生时代来了，但我们该怎么接', link: '/blog/TypeScript 7.0：原生时代来了，但我们该怎么接' },
        { text: 'HTTP QUERY 方法详解', link: '/blog/HTTP QUERY 方法详解' },
        { text: '工具配置', link: '/blog/工具配置' }
      ]
    },
    {
      text: '💼 项目实践',
      items: [
        { text: '前端升级规划', link: '/blog/前端升级规划' },
        { text: '某数字员工前端项目 前端框架升级总结与复盘', link: '/blog/某数字员工前端项目 前端框架升级总结与复盘' },
        { text: '某前端主项目 Vite 6 → Vite 8 升级影响分析报告', link: '/blog/某前端主项目 Vite 6 → Vite 8 升级影响分析报告' },
        { text: '某前端基础库 前端图标系统完整分析文档', link: '/blog/某前端基础库 前端图标系统完整分析文档' },
        { text: '某前端基础库 图标管理模块设计方案研究报告', link: '/blog/某前端基础库 图标管理模块设计方案研究报告' },
        { text: '意见反馈页面迁移 AI 使用说明', link: '/blog/意见反馈页面迁移AI使用说明' },
        { text: 'MemPalace 构建指南', link: '/blog/MemPalace 构建指南' },
        { text: 'RTK + MemPalace 工具使用教程', link: '/blog/RTK + MemPalace 工具使用教程' }
      ]
    }
  ],

  socialLinks: [
    { icon: 'github', link: 'https://github.com/Mr54233' }
  ],

  search: {
    provider: 'local',
    options: {
      locales: {
        root: {
          translations: {
            button: {
              buttonText: '搜索文档',
              buttonAriaLabel: '搜索文档'
            },
            modal: {
              noResultsText: '无法找到相关结果',
              resetButtonTitle: '清除查询条件',
              footer: {
                selectText: '选择',
                navigateText: '切换'
              }
            }
          }
        }
      }
    }
  },
})

// https://vitepress.dev/reference/site-config
export default defineConfig({
  extends: teekConfig,
  title: "54's blog - 记录生活",
  description: "五四的博客",
  lastUpdated: true,
})
