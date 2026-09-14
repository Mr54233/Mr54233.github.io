---
title: "某前端主项目 Vite 6 → Vite 8 升级影响分析报告"
date: "2026-07-06"
categories:
  - 项目实践
tags:
  - Vite
  - 升级
  - 影响分析
---

# 某前端主项目 Vite 6 → Vite 8 升级影响分析报告

> 生成日期：2026-04-27
> 
> 项目版本：8.1.0
> 
> 当前 Vite 版本：^6.4.2
> 
> 目标 Vite 版本：^8.0.0



---



## **目录**



- [一、项目概况](#一项目概况)
- [二、Vite 8 核心架构变更](#二vite-8-核心架构变更)
- [三、阻塞性问题（必须修改）](#三阻塞性问题必须修改)
- [四、高风险问题（可能导致运行时异常）](#四高风险问题可能导致运行时异常)
- [五、中等风险（需要检查/更新）](#五中等风险需要检查更新)
- [六、低风险（基本无影响）](#六低风险基本无影响)
- [七、受影响文件清单](#七受影响文件清单)
- [八、升级路线图](#八升级路线图)
- [九、回滚方案](#九回滚方案)

---



## **一、项目概况**



### **1.1 项目结构**



```Plain Text
主项目/
├── apps/
│   ├── admin/          # 管理后台（@lib/vite-config 应用模式）
│   ├── demo/           # 演示应用（@lib/vite-config 应用模式）
│   ├── wflow/          # 流程设计器（独立 Vite 配置）
│   ├── file-manager/   # 文件管理（@lib/vite-config 应用模式）
│   └── mobile/         # 移动端（完全独立配置）
├── internal/
│   └── vite-config/    # 共享 Vite 配置包（核心）
├── packages/
│   ├── @core/          # 核心包
│   ├── component-ui/   # 组件库
│   ├── effects/        # 副作用模块
│   ├── business/       # 业务模块
│   └── styles/         # 样式包
└── pnpm-workspace.yaml # monorepo 依赖管理
```



### **1.2 关键依赖版本**



| 依赖 | 当前版本 | Vite 8 要求/建议 |
|-|-|-|
| vite | ^6.4.2 | ^8.0.0 |
| node | >=20.10.0 | >=20.19.0 |
| @vitejs/plugin-vue | ^5.2.3 | 需检查是否有 v6 |
| @vitejs/plugin-vue-jsx | ^4.1.2 | 需检查是否有新版本 |
| rollup | ^4.40.1 | 由 Rolldown 替代 |
| esbuild | 0.25.3 (override) | 不再需要 |
| sass | ^1.83.0 | 保持（已用 modern API） |
| vitest | ^3.1.2 | ^3.x 兼容 |



---



## **二、Vite 8 核心架构变更**



Vite 8 是自 Vite 2 以来最重大的架构变更，核心变化是**统一使用 Rolldown 替代 esbuild + Rollup 双打包器**：



```Plain Text
Vite 6（当前）                        Vite 8（目标）
┌─────────────────────┐              ┌─────────────────────┐
│  开发模式：esbuild    │    ───►     │  统一：Rolldown       │
│  生产构建：Rollup     │              │  转换/压缩：Oxc       │
│  压缩：esbuild       │              │  CSS压缩：LightningCSS│
└─────────────────────┘              └─────────────────────┘
```



| 功能 | Vite 6 | Vite 8 |
|-|-|-|
| 依赖预打包 | esbuild | Rolldown |
| JS 转换 | esbuild | Oxc |
| JS 压缩 | esbuild | Oxc Minifier |
| CSS 压缩 | esbuild | Lightning CSS |
| 生产打包 | Rollup | Rolldown |
| 插件 API | Rollup 插件 API | 兼容 Rollup 插件 API |



---



## **三、阻塞性问题（必须修改）**



### **3.1`manualChunks` 对象形式被移除**



**严重程度：��� 阻塞**



Vite 8 中 `build.rollupOptions.output.manualChunks` 的对象形式已**移除**，函数形式已**废弃**，需改用 Rolldown 的 `codeSplitting`。



**受影响文件：**



#### **apps/admin/vite.config.mts（第 24-31 行）**



```TypeScript
// ❌ 当前写法 - 对象形式，Vite 8 已移除
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'element-plus': ['element-plus'],
        'wujie': ['wujie-vue3'],
        'echarts': ['echarts'],
        'vxe-pc-ui': ['vxe-pc-ui'],
        'vue-vendor': ['vue', 'vue-router', 'pinia', '@vueuse/core'],
        'utils': ['axios', 'dayjs', 'jsencrypt'],
      },
    },
  },
}
```



#### **apps/demo/vite.config.mts（第 24-31 行）**



同 admin，内容基本一致。



#### **apps/mobile/build/vite/index.ts（第 72-80 行）**



```TypeScript
// ❌ 当前写法 - 通过插件 config hook 使用对象形式
{
  name: 'manual-chunk-split',
  apply: 'build',
  config() {
    return {
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              vant: ['vant'],
              echarts: ['echarts', 'vue-echarts'],
              utils: ['axios', 'lodash-es', 'dayjs', 'tiny-pinyin'],
            },
          },
        },
      },
    };
  },
}
```



**迁移方案：**



```TypeScript
// ✅ 方案A：使用函数形式（兼容期可用，但已废弃）
build: {
  rolldownOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('element-plus')) return 'element-plus';
        if (id.includes('echarts')) return 'echarts';
        if (id.includes('node_modules/vue') || id.includes('node_modules/vue-router')) return 'vue-vendor';
      },
    },
  },
}

// ✅ 方案B：使用 Rolldown 的 codeSplitting（推荐）
build: {
  rolldownOptions: {
    output: {
      codeSplitting: {
        strategy: 'explicit',
        groups: [
          { name: 'element-plus', test: /element-plus/ },
          { name: 'echarts', test: /echarts/ },
          { name: 'vue-vendor', test: /node_modules\/(vue|vue-router|pinia|@vueuse)\// },
          { name: 'utils', test: /node_modules\/(axios|dayjs|jsencrypt)\// },
        ],
      },
    },
  },
}
```



---



### **3.2`@vitejs/plugin-legacy` 不支持 ES5 转译**



**严重程度：��� 阻塞（mobile 应用）**



**受影响文件：** `apps/mobile/build/vite/index.ts`（第 4 行导入，第 157-159 行使用）



```TypeScript
import legacy from '@vitejs/plugin-legacy';
// ...
legacy({
  targets: ['defaults', 'not IE 11'],
}),
```



Vite 8 (Rolldown) **不支持** plugin-legacy 的 ES5 转译功能（rolldown-vite#452）。



**迁移方案：**



- **方案A**：移除 `@vitejs/plugin-legacy`，接受仅支持现代浏览器

- **方案B**：若需兼容旧浏览器，使用 `build.target` 设置较低目标 + babel 预处理

- **方案C**：mobile 应用暂时保持 Vite 7 + rolldown-vite



---



### **3.3`build.rollupOptions` 重命名为 `build.rolldownOptions`**



**严重程度：��� 兼容层存在，但已废弃**



Vite 8 提供兼容层自动转换，但该选项已标记为废弃，建议尽早迁移。



**受影响文件：**



| 文件 | 行号 | 使用方式 |
|-|-|-|
| `internal/vite-config/src/config/application.ts` | 60-67 | `rollupOptions.output.*`（fileNames） |
| `internal/vite-config/src/config/library.ts` | 43-49 | `rollupOptions.external` |
| `apps/admin/vite.config.mts` | 19-33 | `rollupOptions.external + output` |
| `apps/demo/vite.config.mts` | 19-33 | `rollupOptions.external + output` |
| `apps/wflow/vite.config.js` | 82-89 | `rollupOptions.external` |
| `apps/mobile/build/vite/index.ts` | 69-84 | `rollupOptions.output` |



**迁移示例：**



```TypeScript
// ❌ 旧写法
build: {
  rollupOptions: { /* ... */ }
}

// ✅ 新写法
build: {
  rolldownOptions: { /* ... */ }
}
```



> 注意：兼容层会在过渡期自动处理，不急于一次性全部改完。



---



## **四、高风险问题（可能导致运行时异常）**



### **4.1`esbuild.\*` 配置需迁移到 `oxc.\*`**



**受影响文件：**



#### **internal/vite-config/src/config/application.ts（第 71-79 行）**



```TypeScript
// ❌ 当前写法
esbuild: {
  drop: isBuild ? ['debugger'] : [],
  legalComments: 'none',
}
```



#### **apps/wflow/vite.config.js（第 75-78 行）**



```TypeScript
// 空对象，无实际功能
esbuild: {}
```



**迁移映射：**



| 旧配置 (esbuild) | 新配置 (oxc/rolldown) | 说明 |
|-|-|-|
| `esbuild.drop: ['debugger']` | `build.rolldownOptions.output.minify.compress.drop_debugger: true` | 通过 Rolldown 压缩选项控制 |
| `esbuild.legalComments: 'none'` | Rolldown 默认行为或通过插件处理 | 移除注释 |



```TypeScript
// ✅ 迁移后
build: {
  rolldownOptions: {
    output: {
      minify: {
        compress: {
          drop_debugger: isBuild,
        },
      },
    },
  },
}
```



---



### **4.2 CommonJS 互操作性变更**



**严重程度：��� 可能导致默认导入返回值不同**



Vite 8 (Rolldown) 改变了 CJS 模块默认导入的处理逻辑。当 `import x from 'cjs-pkg'` 时，返回值可能不同。



**受影响的 CJS 包：**



| 包 | 使用文件数 | 关键文件 |
|-|-|-|
| `lodash.clonedeep` | 1 | `packages/@core/base/shared/src/utils/index.ts:17` |
| `lodash.get` | 1 | `packages/@core/base/shared/src/utils/index.ts:18` |
| `lodash.isequal` | 1 | `packages/@core/base/shared/src/utils/index.ts:19` |
| `lodash.set` | 1 | `packages/@core/base/shared/src/utils/index.ts:20` |
| `qs` | 1 | `packages/effects/request/src/request-client/request-client.ts:8` |
| `dayjs` | ~15 | 多个应用中广泛使用 |
| `nprogress` | 3 | `apps/mobile/src/router/index.ts` 等 |



**临时回退方案：**



```TypeScript
// vite.config.ts
export default defineConfig({
  legacy: {
    inconsistentCjsInterop: true,  // 恢复旧版 CJS 互操作行为
  },
})
```



**长期方案：** 替换为 ESM 版本的包（如 `lodash-es`、`qs/esm` 等）。



---



### **4.3`build.target: 'es2015'` 过于老旧**



**受影响文件：** `internal/vite-config/src/config/application.ts`（第 68 行）



```TypeScript
build: {
  target: 'es2015',  // ❌ 2015 年标准，Rolldown 对此支持有限
}
```



**建议：** 升级到 `'es2020'` 或更高。如果确实需要兼容旧浏览器，应配合 Babel 预处理而非依赖打包器降级。



---



### **4.4 CSS 压缩默认改为 Lightning CSS**



**当前状态：** 项目使用 PostCSS + cssnano 管道，未使用 Lightning CSS。



**影响：**

- Vite 8 默认使用 Lightning CSS 做生产 CSS 压缩
- 输出可能略有不同（包体积可能微增，语法降级策略不同）
- Lightning CSS 作为依赖会增加约 10MB 安装体积

**处理方式：**



```TypeScript
// 如需保持旧行为
build: {
  cssMinify: 'esbuild',  // 需额外安装 esbuild
}

// 或接受默认 Lightning CSS（推荐）
build: {
  cssMinify: 'lightningcss',  // Vite 8 默认值
}
```



---



### **4.5 Sass`silenceDeprecations` 需关注**



**受影响文件：** `apps/wflow/vite.config.js`（第 56-58 行）



```TypeScript
scss: {
  silenceDeprecations: ["legacy-js-api"],
}
```



Vite 8 已移除 Sass legacy API 支持。这个配置抑制了 legacy-js-api 的警告，可能意味着 wflow 或其依赖仍在使用旧 API 特性。升级后需要测试 wflow 的 SCSS 编译是否正常。



---



## **五、中等风险（需要检查/更新）**



### **5.1 Node.js engines 版本**



**文件：** `package.json`（第 100 行）



```JSON
// ❌ 当前
"engines": { "node": ">=20.10.0" }

// ✅ 需改为
"engines": { "node": ">=20.19.0" }
```



---



### **5.2 Vite 插件兼容性检查**



| 插件 | 当前版本 | Vite 8 兼容性 | 需要操作 |
|-|-|-|-|
| `@vitejs/plugin-vue` | ^5.2.3 | ⚠️ 可能需升级到 v6 | 检查是否有 v6 |
| `@vitejs/plugin-vue-jsx` | ^4.1.2 | ⚠️ 可能需升级 | 检查新版本 |
| `vite-plugin-compression` | ^0.5.1 | ⚠️ 较旧，需验证 | 测试 Rolldown 兼容性 |
| `vite-plugin-html` | ^3.2.2 | ⚠️ 较旧，需验证 | 测试 Rolldown 兼容性 |
| `vite-plugin-lazy-import` | ^1.0.7 | ⚠️ 较旧，需验证 | 测试 Rolldown 兼容性 |
| `vite-plugin-dts` | ^4.5.3 | ✅ 应该兼容 | 保持 |
| `vite-plugin-pwa` | ^1.0.0 | ✅ 应该兼容 | 保持 |
| `vite-plugin-vue-devtools` | ^7.7.6 | ✅ 应该兼容 | 保持 |
| `rollup-plugin-visualizer` | ^5.14.0 | ⚠️ 需验证 | 测试 Rolldown 兼容性 |
| `unplugin-auto-import` | ^19.2.0 | ✅ 应该兼容 | 保持 |
| `unplugin-vue-components` | ^28.5.0 | ✅ 应该兼容 | 保持 |
| `code-inspector-plugin` | ^1.2.4 | ✅ 应该兼容 | 保持 |



### **5.3 自定义插件兼容性**



项目中有 8 个自定义 Vite 插件（位于 `internal/vite-config/src/plugins/`），使用的 Rollup hooks 如下：



| 插件 | 使用的 Hooks | Vite 8 兼容 |
|-|-|-|
| `viteArchiverPlugin` | `closeBundle` | ✅ |
| `viteLicensePlugin` | `generateBundle` | ✅ |
| `vitePrintPlugin` | `configureServer` | ✅ |
| `viteVxeTableImportsPlugin` | 标准 Vite hooks | ✅ |
| `viteMetadataPlugin` | `config` | ✅ |
| `viteInjectAppLoadingPlugin` | `transformIndexHtml` | ✅ |
| `viteExtraAppConfigPlugin` | `configResolved`, `generateBundle`, `transformIndexHtml` | ✅ |
| `viteImportMapPlugin` | `config`, `resolveId`, `buildEnd`, `transformIndexHtml` | ✅ |



> 所有自定义插件均**未使用**已移除的 hooks（`shouldTransformCachedModule`、`resolveImportMeta`、`renderDynamicImport`、`resolveFileUrl`）。



---



### **5.4 package.json overrides 和 peerDependencyRules**



**文件：** `package.json`（第 105-133 行）



```JSON
// ❌ 需要调整
"peerDependencyRules": {
  "ignoreMissing": ["postcss", "esbuild"],  // esbuild 不再是直接依赖，可能需要移除或调整
  "allowedVersions": {
    "rollup": "^4.x"  // 可能需改为 rolldown 相关
  }
},
"overrides": {
  "esbuild": "0.25.3"  // 不再需要 override esbuild
}
```



---



### **5.5 library 模式 CSS 文件名变更**



**受影响文件：** `internal/vite-config/src/config/library.ts`（第 37-42 行）



```TypeScript
build: {
  lib: {
    entry: 'src/index.ts',
    fileName: () => 'index.mjs',
    formats: ['es'],
  },
}
```



Vite 8 中库模式默认 CSS 文件名从 `style.css` 改为基于 `package.json` 的 `name` 字段。如果使用了 library 模式的子包依赖 `style.css` 这个固定名称，需添加配置：



```TypeScript
build: {
  lib: {
    entry: 'src/index.ts',
    fileName: () => 'index.mjs',
    formats: ['es'],
    cssFileName: 'style',  // ✅ 保持旧的 CSS 文件名
  },
}
```



---



### **5.6 pnpm-workspace.yaml catalog 更新**



**文件：** `pnpm-workspace.yaml`（第 185-186 行）



```YAML
# ❌ 当前
vite: ^6.4.2
rollup: ^4.40.1

# ✅ 需更新为
vite: ^8.0.0
# rollup 可能不再需要（Rolldown 内置于 Vite 8）
```



同时需要更新以下依赖版本：

- `@vitejs/plugin-vue`
- `@vitejs/plugin-vue-jsx`
- `rollup-plugin-visualizer`（如保留）

---



## **六、低风险（基本无影响）**



| 项目 | 状态 | 说明 |
|-|-|-|
| Sass Modern API | ✅ 无影响 | 已配置 `api: 'modern'` |
| `import.meta.hot.accept` | ✅ 无影响 | 项目中未使用 |
| glob 范围括号 | ✅ 无影响 | 未使用 `{01..03}` 模式 |
| .env 变量插值 | ✅ 无影响 | 无变量插值依赖 |
| `output.format: 'system'/'amd'` | ✅ 无影响 | 未使用 |
| SSR 配置 | ✅ 无影响 | 仅 importmap 插件中有条件判断，非 SSR 应用 |
| `transformWithEsbuild` | ✅ 无影响 | 未使用 |
| `unbuild` 构建 | ✅ 无影响 | 独立于 Vite 的构建工具 |
| Vitest | ✅ 兼容 | ^3.1.2 与 Vite 8 兼容 |
| VitePress | ✅ 兼容 | ^1.6.3 与 Vite 8 兼容 |
| CSS Modules | ✅ 基本无影响 | wflow 中有少量使用 |
| PostCSS 工作流 | ✅ 无影响 | TailwindCSS + PostCSS 流程不受影响 |



---



## **七、受影响文件清单**



### **需要修改代码的文件**



| 文件 | 修改内容 | 优先级 |
|-|-|-|
| `pnpm-workspace.yaml` | 更新 vite 版本号 | ��� |
| `apps/admin/vite.config.mts` | manualChunks → codeSplitting | ��� |
| `apps/demo/vite.config.mts` | manualChunks → codeSplitting | ��� |
| `apps/mobile/build/vite/index.ts` | manualChunks + 移除 legacy 插件 | ��� |
| `internal/vite-config/src/config/application.ts` | esbuild → oxc, rollupOptions → rolldownOptions, target 更新 | ��� |
| `internal/vite-config/src/config/library.ts` | rollupOptions → rolldownOptions, 添加 cssFileName | ��� |
| `apps/wflow/vite.config.js` | 移除空 esbuild 配置, 验证 silenceDeprecations | ��� |
| `package.json` | engines.node, overrides, peerDependencyRules | ��� |



### **需要测试验证的文件**



| 文件/模块 | 验证内容 |
|-|-|
| `packages/@core/base/shared/src/utils/index.ts` | lodash 系列 CJS 默认导入 |
| `packages/effects/request/src/request-client/request-client.ts` | qs CJS 导入 |
| 全项目 dayjs 导入（~15 个文件） | dayjs CJS 导入 |
| `apps/mobile/src/router/index.ts` | nprogress CJS 导入 |
| `apps/wflow/src/**/*.scss` | SCSS 编译（legacy-js-api deprecation） |
| 所有构建产物 | CSS 压缩结果（Lightning CSS 差异） |



---



## **八、升级路线图**



### **阶段一：准备工作（0.5 天）**



```Plain Text
1. 创建升级分支
   git checkout -b upgrade/vite-8

2. 更新 Node.js engines
   package.json: "node": ">=20.19.0"

3. 更新 pnpm-workspace.yaml catalog
   vite: ^8.0.0

4. 执行 pnpm install
   验证依赖安装无错误
```



### **阶段二：核心配置修改（0.5 天）**



```Plain Text
1. 修改 manualChunks → codeSplitting
   ├─ apps/admin/vite.config.mts
   ├─ apps/demo/vite.config.mts
   └─ apps/mobile/build/vite/index.ts

2. 处理 @vitejs/plugin-legacy
   └─ apps/mobile/build/vite/index.ts（移除或替代）

3. 迁移 esbuild → oxc
   └─ internal/vite-config/src/config/application.ts

4. 更新 build.target
   └─ internal/vite-config/src/config/application.ts（es2015 → es2020）
```



### **阶段三：逐步验证（0.5 天）**



```Plain Text
1. 验证 @lib/vite-config 构建
   pnpm -F @lib/vite-config run stub

2. 逐个应用构建测试
   pnpm build:admin
   pnpm build:demo
   pnpm build:wflow
   pnpm build:mobile
   pnpm build:fileManage

3. 运行单元测试
   pnpm test:unit

4. 开发模式验证
   pnpm dev:admin
   pnpm dev:demo
   pnpm dev:wflow
   pnpm dev:mobile
```



### **阶段四：兼容性修复（0.5 天）**



```Plain Text
1. CJS 互操作测试
   - 测试所有 lodash.* 包的导入
   - 测试 qs, dayjs, nprogress 导入
   - 必要时添加 legacy.inconsistentCjsInterop: true

2. 插件兼容性测试
   - 逐个验证旧版插件
   - 更新不兼容的插件

3. CSS 输出验证
   - 对比构建产物 CSS 差异
   - 必要时调整 cssMinify 配置

4. 清理 package.json
   - 移除 esbuild override
   - 更新 peerDependencyRules
```



### **验证清单**



- [ ] `pnpm build:admin` 构建成功

- [ ] `pnpm build:wflow` 构建成功

- [ ] `pnpm build:mobile` 构建成功

- [ ] `pnpm build:demo` 构建成功

- [ ] `pnpm build:fileManage` 构建成功

- [ ] `pnpm dev:admin` 开发模式正常

- [ ] `pnpm dev:wflow` 开发模式正常

- [ ] `pnpm dev:mobile` 开发模式正常

- [ ] `pnpm test:unit` 测试通过

- [ ] admin 应用功能测试通过

- [ ] wflow 流程设计器功能测试通过

- [ ] mobile 移动端功能测试通过

- [ ] CSS 样式无异常

- [ ] 生产环境部署验证通过



---



## **九、回滚方案**



如果升级过程中遇到无法解决的问题，可以按以下步骤回滚：



### **方案A：Git 回滚**



```Bash
# 丢弃升级分支，回到原分支
git checkout dev
git branch -D upgrade/vite-8
```



### **方案B：渐进式升级（推荐）**



如果直接从 Vite 6 → 8 风险太大，可以分步走：



```Plain Text
Step 1: Vite 6 → Vite 7
  - 较小变更，主要是 Node.js 版本和 Sass legacy API
  - 验证稳定后继续

Step 2: Vite 7 + rolldown-vite 技术预览
  - 在 Vite 7 上安装 rolldown-vite 测试 Rolldown 兼容性
  - pnpm add -D rolldown-vite
  - package.json: "vite": "npm:rolldown-vite@7.2.2"

Step 3: rolldown-vite → Vite 8
  - 确认 Rolldown 兼容性后，切换到正式 Vite 8
```



### **方案C：部分应用升级**



```Plain Text
- admin/demo/wflow/file-manager → 升级到 Vite 8（共享 @lib/vite-config）
- mobile → 暂时保持 Vite 6（独立配置，依赖 @vitejs/plugin-legacy）
```



---



## **附录：关键参考链接**



- [Vite 8 发布公告](https://vite.dev/blog/announcing-vite8)
- [Vite 8 迁移指南（v7→v8）](https://vite.dev/guide/migration)
- [Vite 7 迁移指南（v6→v7）](https://v7.vite.dev/guide/migration.html)
- [Rolldown 文档](https://rolldown.rs/)
- [Rolldown codeSplitting 配置](https://rolldown.rs/config/output#outputcodesplitting)
- [Vite 插件注册表](https://registry.vite.dev/)
