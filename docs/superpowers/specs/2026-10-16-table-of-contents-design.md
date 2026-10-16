# 文章目录（Table of Contents）设计

## 目的

作品集和博客的详情页里，长文（例如 `portfolio/novel/five-truths-about-the-night.zh.mdx`，36 个标题、三层结构）只能靠滚动找章节。做一个像 Notion / Google Docs 那样的目录：根据每页的标题层级自动生成，点击跳转，高亮当前正在读的章节，可以展开和收起，在各种窗口宽度下都有合适的形态，视觉上和站点现有的侧边筛选菜单（`SidebarFilter`）是同一套语言。

## 目标

- 对 `app/[lang]/blog/[category]/[slug]` 和 `app/[lang]/portfolio/[category]/[slug]` 两类详情页都生效，同一个组件。
- 根据正文中的 `#` / `##` / `###` 动态生成层级树，作者不需要写任何额外标记。
- 点击条目平滑滚动到对应标题，标题不被固定页头挡住，URL hash 同步更新（可分享链接）。
- 滚动时高亮当前章节；当前章节的父级也有弱一级的提示。
- 两种“收起”：整个目录面板收起/展开；有子章节的条目可以单独折叠/展开。
- 宽屏、平板、手机各自用最合适的形态。
- 亮色/暗色主题都协调；尊重 `prefers-reduced-motion`。

## 非目标

- 不给首页、关于、经历等非文章页面加目录。
- 不做“阅读进度百分比”、“预计阅读时间”等附加信息（以后可以单独加）。
- 不让作者在 frontmatter 里手动编辑目录内容。

## 反目标（做了等于失败）

- 目录出现时正文列变窄或位置跳动——现在正文是 `max-w-4xl` 居中，读者已经习惯的阅读宽度不能被挤压。
- 手机上目录常驻占据屏幕。
- 标题很少的短文也硬塞一个目录。
- 首屏闪烁：先渲染出无目录的页面，再“跳”出目录。

## 现状（勘察结果）

- 两个详情页都用 `components/shared/MDXContent.tsx`（`next-mdx-remote/rsc` 的 `MDXRemote`，只有 `remark-gfm`）。**正文标题目前没有 `id`**——`lib/mdx.ts` 里配了 `rehype-slug` 的 `serializeMDX` 没有被任何地方调用。
- 内容里正文直接用 `#` 作为一级章节（110 个 `#`、95 个 `##`、33 个 `###`），同时页面本身的标题也是 `<h1>`。
- 同名标题很常见（“第一场 小黑屋”、“第一序列”在同一篇里出现多次），id 必须去重。
- 页头 `components/layout/Header.tsx` 是 `fixed`，高 `h-16` / `md:h-20`；已有滚动偏移约定 80px（`lib/smooth-scroll.ts`、`ScrollHandler`）。
- `github-slugger` 已作为 `rehype-slug` 的依赖存在于 `node_modules`。
- 风格参照：`SidebarFilter` —— `text-sm`，常态 `text-gray-700 / dark:text-gray-300`，激活 `text-primary-600 / dark:text-primary-400 font-medium`，一个滑动的 `bg-primary-50 / dark:bg-primary-900/20` 圆角高亮块（`useSlidingIndicator`），动画全部包在 `motion-safe:` 下。
- 站点右下角目前没有任何悬浮元素。

## 设计

### 1. 数据：标题在服务端一次性提取

把 `MDXContent` 从 `<MDXRemote>` 改为 `compileMDX`（同一个包），rehype 管线中加：

1. `rehype-slug` —— 给每个 `h1`–`h3` 加 `id`（github-slugger，中文保留，重复自动加 `-1`、`-2`）。
2. 一个本地的小 rehype 插件 `rehypeCollectHeadings`，紧接在 `rehype-slug` 之后运行，把 `{ depth, id, text }` 收集到传入的数组里。

这样 id 的生成和目录读取的是同一份 HAST，不可能对不上；目录随页面一起服务端渲染，没有首屏闪烁。

纯函数 `buildTocTree(headings)`（放在 `lib/toc.ts`，带 vitest 单测）把扁平列表转成树：

- **相对层级**：以本文出现的最浅层级为第 1 层。只用 `##`/`###` 的文章同样显示为两层。
- 最多显示 3 层，更深的标题并入第 3 层。
- 跳级（`#` 后直接 `###`）挂到最近的上级下面，不凭空造中间节点。

**显示门槛**：标题总数 < 2 时不渲染目录（≥ 2 个标题才显示）。

正文标题统一加 `scroll-margin-top: 6rem`（在 `.prose h1, h2, h3` 上），这样点击跳转、直接打开带 hash 的链接、浏览器原生锚点都会落在页头下方。

### 2. 布局：三种宽度三种形态

断点沿用 Tailwind 默认值。

**宽屏（≥ `xl`，1280px）：左侧常驻目录栏**

- 正文列保持 `max-w-4xl`，位置不变；目录作为 `sticky` 栏放在正文列左侧的空白里（靠正文一侧右对齐）（`top-28`，宽度最大 `w-56`，1280px 时随空白收窄，最大高度 `calc(100vh - 8rem)`，超出时目录自身滚动，并自动把当前条目滚到可见区域）。
- 实现方式：详情页外层容器在 `xl` 下变为三列网格 `[1fr_minmax(0,52rem)_1fr]`（52rem 即原来 `max-w-4xl` 减去 container 内边距后的正文宽度），正文在中列，目录在左列，右列留空——正文仍然是视觉居中的。目录在正文列之外，不会和正文里的“返回”链接、分类标签挤在一起。
- 顶部一个小标题“目录 / On this page”，右侧一个收起按钮。
- **收起状态**：变成一条很窄的“缩略轨道”（Notion 风格）——每个标题一根短横线，长度随层级递减，当前章节的横线是主题色。鼠标悬停轨道时临时向左展开完整目录（浮层，盖在左侧空白上，不遮挡正文、不推动布局；宽度随左侧空白收窄，144–256px）；点“展开”按钮恢复常驻。
- 收起/展开状态存在 `localStorage`（读写包 try/catch），跨文章保持。

**平板（`md` ~ `xl`，768–1279px）：左下角悬浮按钮 + 推开正文的左侧栏**

- 正文两侧没有足够空白，默认不常驻。
- 左下角一个圆形悬浮按钮（列表图标，外圈是阅读进度环，主题色），滚到第一个标题附近才淡入。
- 点击后目录从左边缘滑出（页头下方到屏幕底部，`w-72`，右侧细边框），**正文同时往右移**让出位置、在剩余宽度里居中；关闭后正文回到居中（`<article class="toc-shift">` + `html[data-toc-panel]`，仅在 md–xl 生效，过渡 300ms，reduced-motion 时无动画）。
- 正文变窄会重新排版：开关时锁定屏幕上第一个可见的段落级元素，过渡期间每帧校正滚动，阅读位置不漂移。
- 面板打开时悬浮按钮隐藏；用面板顶部的收起按钮或 `Esc` 关闭。点击条目跳转后面板保持打开（平板上读者常想连续跳几次）。

**手机（< `md`）：同一个悬浮按钮 + 底部抽屉**

- 按钮同上，尺寸更小，避开 iOS 底部安全区（`env(safe-area-inset-bottom)`）。
- 点击后从底部滑出抽屉（最大高度 70vh，顶部有拖拽把手样式、标题和关闭按钮，背后半透明遮罩），条目行高加大到触控友好（≥ 44px）。
- 点击条目后**自动关闭**抽屉，再滚动到目标。
- 打开时锁定页面滚动。

### 3. 条目与交互

- 缩进：每层 `pl-3`，左侧一条 `border-l border-gray-200 dark:border-gray-800` 的竖线作为层级轨道。
- 字号：第 1 层 `text-sm`，第 2、3 层 `text-[13px]`；长标题最多两行，超出省略（`line-clamp-2`），悬停 `title` 显示全文。
- 当前章节：`text-primary-600 dark:text-primary-400 font-medium`，加一个和 `SidebarFilter` 相同的滑动高亮块（复用 `useSlidingIndicator`，`axis: 'y'`），同时左侧竖线上有一段主题色短线跟着滑动。
- 当前章节的祖先条目：`text-gray-900 dark:text-gray-100`（比普通条目深一档，但不用主题色）。
- 子树折叠：有子章节的条目左边一个小箭头（旋转动画），点击箭头只折叠/展开，不跳转；点文字跳转。
  - **默认展开规则**：总条目 ≤ 15 时全部展开；超过时只展开第 1 层，以及**当前章节所在的那条分支**。滚动进入新分支时自动展开该分支；用户手动操作过的条目以用户为准，不再自动改变。
- 点击跳转：`scrollIntoView({ behavior: 'smooth' })`（reduced-motion 时为 `auto`），然后 `history.replaceState` 更新 hash，不产生新的历史记录。跳转过程中暂停滚动监听，高亮直接设到目标上，避免高亮在途中逐个闪过。
- 键盘：整个目录是 `<nav aria-label>`，条目是普通链接（`<a href="#id">`，无 JS 时也能跳），箭头按钮有 `aria-expanded`；当前条目带 `aria-current="location"`。

### 4. “当前章节”判定

- 一个客户端 hook `useActiveHeading(ids)`：滚动时（`requestAnimationFrame` 节流）找出**最后一个顶部位于视口上方 120px 线以上**的标题，即为当前章节。
- 还没滚到第一个标题时：不高亮任何条目。
- 滚到页面底部（最后几个章节太短、永远到不了那条线）时：高亮最后一个标题。
- 窗口尺寸变化、图片加载导致位置变化时重新计算（`ResizeObserver` 观察正文容器）。

### 5. 组件结构

- `lib/toc.ts`：`TocHeading` 类型、`buildTocTree`、默认展开规则的纯函数。单测覆盖：相对层级、跳级、超过 3 层合并、门槛、重复标题。
- `lib/rehype-collect-headings.ts`：收集插件。
- `components/shared/MDXContent.tsx`：改用 `compileMDX`，接收可选的 `headingsOut`，或改为导出一个 `renderMDX(source)` 返回 `{ content, headings }`，详情页调用后分别放进正文和目录。（实现时选其一，倾向后者，详情页更清楚。）
- `components/shared/toc/TableOfContents.tsx`（client）：根据宽度渲染 `TocSidebar` 或 `TocFloating`；两者共用 `TocTree`（条目列表 + 折叠 + 高亮）。宽度切换用 CSS（`hidden xl:block` / `xl:hidden`）而不是 JS 媒体查询，避免水合不一致。
- `useActiveHeading`、`useTocCollapse`（面板收起 + localStorage）两个 hook。
- 字典 `en.ts` / `zh.ts` 增加 `toc: { title, expand, collapse, open, close }`。
- 两个详情页：外层布局改为上述三列网格，并插入 `<TableOfContents headings={...} />`。

## 约束

- Next 14 App Router，静态导出（GitHub Pages 部署），所有标题提取必须在构建期完成——上述服务端方案满足。
- 不新增运行时依赖；`rehype-slug`、`github-slugger` 已在依赖中。
- 动画全部 `motion-safe:`；颜色只用现有 `primary` 色板和 gray，暗色模式用 `dark:` 变体。

## 由实现者决定

- 悬浮按钮的确切尺寸、进度环线宽、出现时机的阈值。
- 缩略轨道横线的具体长度和间距。
- 抽屉是否支持手势下拉关闭（有就更好，非必须）。
- `MDXContent` 的接口选哪种（见第 5 节），只要 id 生成和目录收集在同一管线里。

## 已确认的决定

用户确认：
1. 宽屏目录放在**左侧**。
2. 收起后保留缩略轨道。
3. 手机上不常驻，用悬浮按钮 + 底部抽屉。
4. **≥ 2 个标题**才显示目录。

我的决定（用户未提出异议）：
5. （用户调整）平板上目录从左侧打开，并把正文推向右侧，关闭后正文回到居中；悬浮按钮在左下角。手机仍是右下角按钮 + 底部抽屉。
6. 长目录（> 15 条）默认只展开第一层 + 当前分支。
7. 正文 `#` 也计入目录。
