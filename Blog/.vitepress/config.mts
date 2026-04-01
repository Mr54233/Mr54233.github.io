import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "54's blog - 记录生活",
  description: "五四的博客",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '🏠 Home', link: '/' },
      { text: '📜 Blog', link: '/blog'},
    ],
    siteTitle: "54's blog",

    logo: "/favicon.ico",

    sidebar: [
      {
        text:"Blog",
        items:[
          { text: 'Hello world', link:'/blog/Hello world'},
          { text: '万神殿看完了', link:'/blog/万神殿看完了'},
          { text: '终于回家', link:'/blog/终于回家'},
          { text: '记录一下写论文过程中遇到的问题', link:'/blog/记录一下写论文过程中遇到的问题'},
          { text: '离深随笔', link:'/blog/离深随笔'},
          { text: '初至南京', link:'/blog/初至南京' },
          { text: '总结一下实习一个多礼拜以来的问题', link:'/blog/总结一下实习一个多礼拜以来的问题'},
          { text: '旧年', link:'/blog/旧年'},
          { text: '迁移', link:'/blog/迁移'},
          { text: '你想活出怎样的人生', link:'/blog/你想活出怎样的人生'},
          { text: '浴室的灯坏了', link:'/blog/浴室的灯坏了'},
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

    
    footer: {
      message: '本站总访问量 <span id="busuanzi_value_site_pv" /> 次',
      copyright: '©2022 - 2026 By Mr54'
    }
  },
  
  lastUpdated: true,
})
