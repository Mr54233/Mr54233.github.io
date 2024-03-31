// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './style.css'
import { inBrowser } from 'vitepress'


// 评论
import GitalkLayout from './layout/GitalkLayout.vue'
import 'gitalk/dist/gitalk.css'

// 统计
import busuanzi from 'busuanzi.pure.js'

// export default {
//   extends: DefaultTheme,
//   Layout: () => {
//     return h(DefaultTheme.Layout, null, {
//       // https://vitepress.dev/guide/extending-default-theme#layout-slots
//       GitalkLayout
//     })
//   },
//   enhanceApp({ app, router, siteData }) {
//     // ...

//   }
// } satisfies Theme

const theme: Theme = {
  ...DefaultTheme,
  Layout: GitalkLayout,
  enhanceApp({ app, router, siteData }) {
    if (inBrowser) {
      router.onAfterRouteChanged = () => {
        busuanzi.fetch()
      }
    }
  }
}

export default theme
