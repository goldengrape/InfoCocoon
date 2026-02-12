# Changelog

本项目的所有重要更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

---

## [1.3.0] - 2026-02-12

### 新增
- **关键词作用域**: 支持全局关键词和站点独立关键词
  - **全局关键词** (默认): 在所有启用过滤的网站上生效
  - **站点独立关键词**: 仅在指定域名上生效，例如 `！` 仅作用于 `bilibili.com`
  - 向后兼容：旧版数据（无 `scope` 字段）自动视为全局关键词，无需迁移
- Popup 弹窗和选项页添加关键词时支持选择作用域（🌐 全局 / 📌 指定站点）
- 选项页关键词标签显示作用域标识徽章
- 新增 `getKeywordsForSite()` API，按 hostname 返回合并后的关键词列表

### 变更
- **数据模型升级**: 关键词对象新增可选 `scope` 字段 `{word, expiresAt, scope?}`
- `addKeyword()` / `removeKeyword()` 新增 `scope` 参数，重复检测同时匹配 word 和 scope
- 内容过滤脚本按当前 hostname 预过滤关键词，站点独立关键词不再跨站点生效
- 导出版本号升至 3

### 文件变更
- `src/utils/config-manager.js`: 新增 `getKeywordsForSite()`，scope 参数贯穿 CRUD 和导入导出
- `src/content/content-script.js`: 使用 `getKeywordsForSite()` 按 hostname 过滤
- `src/popup/popup.html`: 新增作用域选择器
- `src/popup/popup.js`: 读取 scope 选择器并传递给 `addKeyword()`
- `src/options/options.html`: 新增作用域选择器
- `src/options/options.js`: scope 下拉框动态填充、标签显示 scope 徽章、scope 感知的增删
- `src/options/options.css`: 新增 `.scope-badge` 样式
- `docs/keywords_sample.json`: 版本 3，新增站点独立关键词示例
- `docs/URD.md`: 新增 v1.3 关键词作用域需求文档

---

## [1.2.0] - 2026-02-05

### 新增
- **通配符关键词支持**: 使用 `*` 匹配任意字符，`?` 匹配单个字符
  - 自动识别：包含通配符的关键词自动启用模式匹配
  - 示例：`熬了*通宵` 可匹配 "熬了3个通宵"、"熬了一晚上通宵" 等
- **输入验证**: 拒绝单独的 `*` 或 `?` 以防止误杀所有内容
- **通配符标识**: 选项页中通配符关键词显示蓝色"通配符"徽章

### 变更
- UI 新增通配符提示说明
- 关键词标签支持通配符样式区分

### 文件变更
- `src/utils/matcher.js`: 新增通配符转换和验证逻辑
- `src/options/options.html`: 新增提示说明
- `src/options/options.css`: 新增通配符徽章样式
- `src/options/options.js`: 集成验证和徽章显示

---

## [1.1.0] - 2026-02-05

### 新增
- **关键词导入/导出功能**: 在选项页新增"📤 导出关键词"和"📥 导入关键词"按钮
  - 导出为 JSON 格式文件，包含版本号和时间戳
  - 导入时自动跳过重复关键词
- **关键词时效设置**: 添加关键词时可选择有效期
  - 永久有效（默认）
  - 30天有效，到期自动删除
- **过期关键词自动清理**: 每次加载配置时自动移除过期关键词
- **过期提醒**: 即将过期（7天内）的关键词显示黄色警告标签

### 变更
- **数据模型升级**: 关键词存储格式从字符串数组改为对象数组 `{word, expiresAt}`
- **自动迁移**: 旧版本用户数据会自动转换为新格式，无需手动操作
- 选项页 UI 优化，新增导入导出区块

### 文件变更
- `src/utils/config-manager.js`: 新增迁移、导入导出、过期清理逻辑
- `src/utils/matcher.js`: 支持新关键词对象格式
- `src/options/options.html`: 新增 UI 元素
- `src/options/options.css`: 新增样式
- `src/options/options.js`: 完整功能实现
- `src/popup/popup.js`: 适配新 API

---

## [1.0.0] - 2026-01-xx

### 初始版本
- 基于关键词的内容过滤
- 支持 Twitter/X、YouTube、Bilibili
- 按站点启用/禁用过滤
- 弹出窗口快速添加关键词
- 选项页管理关键词和站点规则
