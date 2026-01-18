# 公理设计分析报告 (Axiomatic Design Analysis Report)

## 0. 项目背景 (Context)
*   **输入文档**: `docs/URD.md` (User Requirements Document)
*   **设计目标**: 构建一个可扩展、高性能且用户隐私安全的 Chrome 网页内容过滤插件。
*   **核心约束**: 必须在 V1 版本支持 Twitter, YouTube, Bilibili，且保证非白名单站点的安全性。

## 1. 顶层设计 (Level 0)
*   **FR0 (顶层功能)**: 根据用户偏好自动识别并隐藏网页中的不受欢迎内容。
*   **DP0 (顶层设计)**: Web Filter Chrome Extension System (基于 Manifest V3 的 Content Script + Popup 架构)。

## 2. 分解视图 (Decomposition)

### 第一层分解 (Level 1)

*   **CN -> FR 映射**:
    *   CN1 (Keyword Filter), CN2 (Manage Keywords), CN4 (Site Rules) -> **FR1: 管理过滤规则与用户配置**。
    *   CN6 (Performance), CN3 (Site Specifics) -> **FR2: 实时监控并捕获待处理的页面内容**。
    *   CN1, CN3, CN7 (Privacy) -> **FR3: 判定内容是否匹配并执行隐藏**。

*   **FR -> DP 映射**:

| ID | FR (功能要求) | DP (设计参数/模块) | 备注 (FP/不可变性说明) |
|----|--------------|-------------------|---------------------|
| 1  | 维护用户配置 (关键词, 站点开关) | **ConfigManager** | 负责 Storage I/O，提供 `Settings`不可变状态对象 |
| 2  | 监控页面变动并提取潜在元素 | **PageOberver** | 封装 MutationObserver，提供流式节点输出来源 |
| 3  | 匹配内容并执行视觉隐藏 | **FilterProcessor** | 核心纯逻辑判定 + 最小化 DOM 操作 |

*   **设计矩阵 (Design Matrix) - Level 1**

|     | ConfigManager (DP1) | PageObserver (DP2) | FilterProcessor (DP3) |
|-----|---------------------|--------------------|-----------------------|
| FR1 |          X          |          0         |           0           |
| FR2 |          x          |          X         |           0           |
| FR3 |          X          |          x         |           X           |

**耦合性诊断**:
*   **类型**: **准耦合 (Decoupled)** (下三角矩阵)
*   **分析**:
    *   FR1 (配置) 独立存在。
    *   FR2 (监控) 弱依赖配置 (DP1) 来决定是否要在当前站点启动监听 (x)。
    *   FR3 (处理) 强依赖配置 (DP1) 获取关键词，弱依赖监控 (DP2) 提供的节点流 (x)，强依赖自身的匹配逻辑 (DP3)。
*   **执行顺序建议**:
    1.  初始化 `ConfigManager` 加载配置。
    2.  根据配置判断是否初始化 `PageObserver`。
    3.  `PageObserver` 捕获节点传递给 `FilterProcessor` 进行处理。

---

### 第二层分解 (Level 2)

#### 2.1 分解 ConfigManager (DP1)
*   **FR1.1**: 持久化存储用户配置 (Sync) -> **DP1.1: StorageProvider** (Wrapper for chrome.storage.sync)
*   **FR1.2**: 提供默认配置与白名单 -> **DP1.2: DefaultConfigStrategy** (Pure Function)

#### 2.2 分解 PageObserver (DP2)
*   **FR2.1**: 监听 DOM 变化 -> **DP2.1: MutationMonitor**
*   **FR2.2**: 节流以保证性能 -> **DP2.2: EventDebouncer** (Higher-order function)

#### 2.3 分解 FilterProcessor (DP3) [核心逻辑]
这是业务逻辑最密集的部分，需要精细分解以支持多站点策略。

*   **FR3.1**: 解析当前站点的定位策略 -> **DP3.1: SiteStrategyFactory** (Map<Host, Strategy>)
    *   *Input*: `window.location.hostname`
    *   *Output*: `Strategy` object (selectors, handling rules)
*   **FR3.2**: 匹配文本内容 -> **DP3.2: ContentMatcher** (Pure Function)
    *   *Input*: `text, keywords`
    *   *Output*: `boolean`
*   **FR3.3**: 执行隐藏操作 -> **DP3.3: VisualHider** (DOM Impure)
    *   *Input*: `element`
    *   *Action*: `element.style.display = 'none'`

*   **设计矩阵 - Level 2.3 (FilterProcessor)**

|       | SiteStrategy (DP3.1) | ContentMatcher (DP3.2) | VisualHider (DP3.3) |
|-------|----------------------|------------------------|---------------------|
| FR3.1 |           X          |            0           |          0          |
| FR3.2 |           0          |            X           |          0          |
| FR3.3 |           X          |            X           |          X          |

*(FR3.2 匹配逻辑本身是独立的，但实际业务流中通常先获取策略，再提取文本，再匹配。如果视为纯函数库，ContentMatcher 完全独立。FR3.3 需要 Strategy 知道隐藏谁，需要 Matcher 结果知道是否隐藏。)*

## 3. 总体结论 (Conclusion)
*   [x] 存在允许的准耦合 (已规划顺序)
*   系统整体架构清晰，遵循 **配置 -> 监听 -> 处理** 的单向数据流。
*   核心业务逻辑能够通过 **SiteStrategy** 模式很好地隔离不同网站的差异，符合开闭原则 (OCP)。

## 4. 解耦/重构建议
1.  **FP 策略**: `ContentMatcher` 必须实现为纯函数 `(text: string, rules: string[]) -> boolean`，方便单元测试。
2.  **DbC 策略**: `SiteStrategy` 接口定义需严格，确保每个站点适配器返回标准化的选择器结构，避免 `VisualHider` 处理各种特例。
