---
title: "意见反馈页面迁移 AI 使用说明"
description: "借助 AI 完成意见反馈页面迁移的实操说明"
date: "2026-07-07"
categories:
  - 项目实践
tags:
  - AI
  - 页面迁移
  - 实践
---

# 意见反馈页面迁移 AI 使用说明
## 场景定位



本文档针对 **Vue 2 项目迁移到 Vue 3 + 某前端基础库项目** 的场景问题。



具体来说：



- 将 `某旧版管理后台`（Vue 2 + Element UI + JavaScript）项目中的 **意见反馈页面** 迁移到 `某新版主项目`（Vue 3 + Element Plus + TypeScript）项目

- **核心要求**：优先使用某前端基础库封装好的组件（Search、Table、Dialog、useTable），而非原生 Element Plus

- 包含列表页、详情弹窗、回复功能、文件上传等完整功能
- 复用目标项目现有的工具类（如 AES 加解密）

---



## **核心指令（Prompt）**



### **通用模板**



```Plain Text
请将 [源项目名称] 中的 [页面名称] 页面迁移至 [目标项目名称]。

源代码路径：[源项目完整路径]
目标路由：[路由路径]
目标组件：[组件文件路径]

迁移要求：
1. 分析源代码结构与依赖
2. 生成迁移方案文档
3. 逐步执行迁移任务
4. 每个步骤完成后进行代码审查，并且同步更新迁移文档
```



### **本案例实际提示词**



```Plain Text
请将 某旧版管理后台 项目中的【意见反馈】页面迁移至 某新版主项目 项目。

源代码位置：<本地工作区路径>/src/views/suggest/
目标路由：/normal/suggestList
目标组件：views/normal/suggestList/index.vue

迁移要求：
1. 使用目标项目现有的 AES 加密工具（views/utils/ase.js）
2. 字典数据采用硬编码方式，暂时先不调用后端字典接口
3. 详情页面使用弹窗形式展示，不创建独立路由
4. 优先使用某前端基础库封装组件（Search、Table、Dialog、useTable），
   参考用户管理页面（views/sys/user/index.vue）的实现方式
5. 每个步骤完成后更新迁移文档，并使用 Claude Code Skills 技术执行自动化代码审查
```



---



## **使用步骤**



### **步骤 1：分析源代码与目标框架**



1. 打开源项目，找到目标页面文件
2. 分析页面结构、依赖的 API、使用的组件

3. **重要**：查看目标项目中类似页面的实现方式（如用户管理 `views/sys/user/index.vue`）

1. 识别需要迁移的内容：

   - Vue 文件（`.vue`）
   - API 接口文件
   - 工具类（如加密、格式化）
   - 静态资源

### **步骤 2：生成迁移方案文档**



让 AI 生成一份包含以下内容的迁移方案：



- 文件清单
- 技术栈差异（Vue 2 → Vue 3，Element UI → Element Plus）
- 依赖关系
- 实施步骤

### **步骤 3：创建 API 接口文件**



```TypeScript
// api/suggestion/index.ts
import { requestClient } from '#/api/request';

// 定义接口类型
export interface AdviceReportQuery {
  adviceCode?: string;
  adviceType?: string;
  startTime?: string;
  endTime?: string;
  adviceStatus?: string;
  pageNo: number;
  pageSize: number;
  username?: string;
  nickname?: string;
}

// 导出 API 方法
export function getAdviceReport(data: AdviceReportQuery) {
  return requestClient.post('/system/advice/getAdviceReport', data);
}
```



### **步骤 4：使用某前端基础库封装组件创建页面**



```Plain Text
<!-- views/normal/suggestList/index.vue -->
<script setup lang="ts">
import type { SearchItemConfig, TableColumn, ActionButton } from '@lib/component-ui';
import { ref, h } from 'vue';
import { Dialog, Search, Table, useTable } from '@lib/component-ui';
import { ElTag } from 'element-plus';
import { View, ChatDotSquare } from '@element-plus/icons-vue';
import { MainContainer } from '#/components/main-container';
import { getAdviceReport, getAdviceReportDetails } from '#/api/suggestion';

// 搜索配置
const searchItems: SearchItemConfig[] = [
  { prop: 'suggestCode', label: '建议编号', type: 'input', placeholder: '请输入建议编号' },
  { prop: 'suggestType', label: '建议类型', type: 'select', options: typeOptions },
  // ...
];

// 表格列配置
const columns: TableColumn[] = [
  { prop: 'adviceCode', label: '建议编号', minWidth: 120 },
  { prop: 'username', label: '用户账号', minWidth: 100 },
  // ...
];

// 操作按钮配置
const actionBtns: ActionButton[] = [
  { text: '回复', type: 'primary', link: true, icon: ChatDotSquare, onClick: handleReply },
  { text: '查看', type: 'primary', link: true, icon: View, onClick: handleDetail },
];

// useTable Hook
const api = {
  list: async (params: any) => {
    const { model, current, size } = params;
    const res = await getAdviceReport({ ...model, pageNo: current, pageSize: size });
    return { data: { list: res.list || [], total: res.total || 0 } };
  },
};

const { loading, data, pagination, refresh, search, handleSizeChange, handleCurrentPageChange } =
  useTable({ api, rowKey: 'adviceCode' });
</script>

<template>
  <MainContainer>
    <!-- 使用某前端基础库的 Search 组件 -->
    <Search :items="searchItems" :loading="loading" @search="search" @reset="refresh" />

    <!-- 使用某前端基础库的 Table 组件 -->
    <Table
      :data="data"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      show-pagination
      show-action
      :column-action-btns="actionBtns"
      @size-change="handleSizeChange"
      @current-page-change="handleCurrentPageChange"
    />

    <!-- 使用某前端基础库的 Dialog 组件 -->
    <Dialog v-model="detailVisible" title="意见反馈详情" width="800px">
      <!-- 内容 -->
    </Dialog>
  </MainContainer>
</template>
```



### **步骤 5：处理依赖**



如果遇到缺失依赖，安装它：



```Bash
pnpm add crypto-js --filter @lib/admin
```



### **步骤 6：验证功能**



1. 启动开发服务器
2. 访问页面路由
3. 测试各功能点

---



## **注意事项 / 技巧**



### **1. 优先使用某前端基础库封装组件**



| 原生 Element Plus | 某前端基础库封装组件 | 说明 |
|-|-|-|
| `<el-form>` + 手动布局 | `<Search>` | 搜索表单，支持折叠展开 |
| `<el-table>` + 手动分页 | `<Table>` + `useTable` | 表格+分页一体化 |
| `<el-dialog>` | `<Dialog>` | 弹窗，统一样式和交互 |
| 手动状态管理 | `useTable` Hook | 自动管理 loading、data、pagination |



**参考实现**：`views/sys/user/index.vue`



### **2. 路由配置**



某新版主项目使用动态路由，路径映射规则：



```Plain Text
/normal/suggestList → views/normal/suggestList/index.vue
```



确保文件路径与路由配置一致。



### **3. AES 加密参数**



如需修改加密参数，编辑以下文件：



```JavaScript
// views/utils/ase.js
const originKey = 'your-key'; // 加密密钥
const originIv = 'your-iv'; // 初始向量
```



### **4. 字典数据**



本案例暂时使用硬编码字典，如需修改：



```TypeScript
// 在 index.vue 中修改
const typeOptions = [
  { value: '1', label: '功能建议' },
  { value: '2', label: 'Bug反馈' },
  // 添加更多选项...
];
```



暂时使用硬编码实现字典功能，等待字典功能数据迁移完毕可以直接调用某前端基础库内自带的字典管理功能。



### **5. 文件上传配置**



**认证头**：某新版主项目使用 `Satoken` 而非 `Authorization`



```Plain Text
<!-- 正确写法 -->
<el-upload :headers="{ Satoken: accessToken }">

<!-- 错误写法（旧项目的写法） -->
<el-upload :headers="{ Authorization: 'Bearer ' + token }">
```



**响应结构**：文件上传响应格式为 `{ code: 0, data: { url: 'xxx' } }`



```TypeScript
// 正确提取URL
const replyFileUrlList = fileList.value
  .filter(f => ((f.response as any)?.code === 0 && (f.response as any)?.data?.url) || f.url)
  .map(f => ({
    name: f.name,
    url: (f.response as any)?.data?.url || f.url
  }));
```



**修改上传限制**：



```TypeScript
// ReplyModal.vue
const ALLOWED_EXTENSIONS = ['rar', 'zip', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'txt'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_FILE_COUNT = 5;
const UPLOAD_URL = '/admin-api/infra/file/uploadFileForAdvice';
```



### 6. 安全问题：禁用 v-html



**错误写法**（XSS 风险）：



```Plain Text
<div v-html="detailData.adviceDesc"></div>
```



**正确写法**：



```Plain Text
<div class="whitespace-pre-wrap break-words">{{ detailData.adviceDesc }}</div>
```



### 7. 模板中不能直接使用 `import.meta.env`



**错误写法：**



```Plain Text
<el-upload :action="`${import.meta.env.VITE_API_URL}/upload`">
```



**正确写法：**



```Plain Text
<script setup>
const uploadUrl = `${import.meta.env.VITE_API_URL}/system/file/upload`;
</script>
<template>
  <el-upload :action="uploadUrl">
</template>
```



### 8. Element Plus 图标导入



```TypeScript
// 需要显式导入图标
import { Upload, Search, Refresh, View } from '@element-plus/icons-vue';
```



### 9. 数据脱敏



修改脱敏规则：



```TypeScript
const maskText = (text: string, type: string): string => {
  if (!text) return '';
  switch (type) {
    case 'phone':
      return text.substring(0, 3) + '****' + text.substring(7); // 138****1234
    case 'name':
      return text.substring(0, 1) + '*'.repeat(Math.max(0, text.length - 1)); // 张*
    case 'IDCard':
      return text.replace(/(\w{6})\w*(\w{4})/, '$1********$2'); // 123456********1234
    default:
      return text;
  }
};
```



### 10. Dialog 宽度



保持与源项目一致：



| 弹窗类型 | 宽度 |
|-|-|
| 详情弹窗 | 800px |
| 回复弹窗 | 1092px |



---



## 文件清单



| 文件路径 | 说明 |
|-|-|
| `api/suggestion/index.ts` | API 接口定义 + TypeScript 类型 |
| `views/normal/suggestList/index.vue` | 列表页面（Search、Table、Dialog、useTable） |
| `views/normal/suggestList/ReplyModal.vue` | 回复弹窗（Dialog、el-upload） |



---



## 技术栈对照表



| 项目 | 旧版本 (某旧版管理后台) | 新版本 (某新版主项目) |
|-|-|-|
| Vue | 2.x (Options API) | 3.x (Composition API + `<script setup>`) |
| UI 框架 | Element UI | Element Plus + 某前端基础库封装组件 |
| 语言 | JavaScript | TypeScript |
| 状态管理 | Vuex | Pinia |
| 构建工具 | Webpack | Vite |
| 表格 | `<el-table>` + 手动分页 | `<Table>` + `useTable` |
| 搜索 | `<el-form>` | `<Search>` |
| 弹窗 | `<el-dialog>` | `<Dialog>` |
| 认证头 | `Authorization: Bearer xxx` | `Satoken: xxx` |



---



## AI 能力说明



### 代码审查（Code Review Skills）



本迁移过程使用了 **Claude Code Skills** 技术进行自动化代码审查：



```Plain Text
/superpowers:requesting-code-review
```



**核心能力：**



- 自动对比源代码与迁移代码的差异
- 检查技术栈转换的正确性（Vue 2 → Vue 3、Element UI → Element Plus）
- 识别潜在的安全问题（如 XSS 漏洞）
- 验证 API 响应结构的兼容性
- 提供分级修复建议（Critical / Important / Minor）



**使用时机：**



- 每个功能模块完成后
- 重大代码变更后
- 最终交付前



---



## 常见问题



### Q: 页面访问 404？



A: 检查文件路径是否与动态路由规则匹配，确保 `index.vue` 文件存在于正确目录。



### Q: API 请求失败？



A: 检查 `requestClient` 配置，确认 baseURL 和请求头设置正确。



### Q: 表格/搜索样式不统一？



A: 确保使用某前端基础库封装的 `Table` 和 `Search` 组件，而非原生 Element Plus。



### Q: 文件上传后 URL 为空？



A: 检查响应结构，正确提取 `response.data.url`，而非 `response.data`。



### Q: 类型报错？



A: 确保为 API 响应定义了正确的 TypeScript 接口。



---



*文档更新时间：2026-03-13*
