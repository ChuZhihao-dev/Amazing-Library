# tooto — Claude 项目规范

> 本文件会在每次对话开始时自动读取。
> 开发任何 Section / Snippet / 功能前，必须完整遵守以下规范。

---

## 项目基本信息

- **项目名**: `shopify-woocarpet-tooto`
- **商店**: `woo-carpet.myshopify.com`
- **技术栈**: Shopify Liquid + Tailwind CSS + SCSS
- **开发文档**: `docs/section-prompts.md`（Section 设计稿分析与布局 Prompt）

---

## 一、文件命名规范

- Section 文件统一前缀：`tooto-`，例如 `sections/tooto-hero-banner.liquid`
- Snippet 文件统一前缀：`tooto-`，例如 `snippets/tooto-card.liquid`
- 文件名使用小写 + 连字符，不使用下划线或驼峰

---

## 二、样式规范

### 2.1 优先级
1. **优先使用** Section 内的 `{% stylesheet %}` 块写 CSS（作用域隔离）
2. **通用辅助类** 写入 `assets/custom.scss`（编译为 `assets/custom.css`）
3. Tailwind CSS 工具类可用于快速布局原型，但最终以 `{% stylesheet %}` 为主

### 2.2 颜色与字体
- **严禁硬编码**任何颜色值（如 `#1a1a1a`、`red`）或字体名（如 `Georgia`）
- 颜色统一通过 Shopify 主题 CSS 变量继承：
  ```css
  /* 可用的主题 CSS 变量 */
  var(--color-foreground)
  var(--color-background)
  var(--color-foreground-heading)
  var(--color-border-rgb)
  var(--font-body--family)
  var(--font-accent--family)
  ```
- Color Scheme 通过 class 继承：
  ```liquid
  <section class="tooto-xxx color-{{ section.settings.color_scheme }}">
  ```

### 2.3 custom.scss 只写布局辅助
- 只允许写**布局工具类**，不写颜色、字体、具体组件样式
- 当前已有工具类：`.scrollbar-hide` / `.tooto-img-zoom` / `.line-clamp-2` / `.tooto-container` / `.tooto-bento-grid`

---

## 三、Liquid 编码规范（重要）

### 3.1 ⚠️ image_tag 的 widths / sizes 必须用变量

**原因**：Liquid 解析 `image_tag` 参数时，会把值内的逗号误判为参数分隔符，导致语法错误。

**❌ 错误写法（会报语法错误）：**
```liquid
{{
  image
  | image_url: width: 800
  | image_tag:
    widths: '300, 400, 600, 800',
    sizes: '(min-width: 750px) 33vw, 100vw',
    alt: image.alt,
    loading: 'lazy'
}}
```

**✅ 正确写法（提前 assign 变量）：**
```liquid
{%- liquid
  assign img_widths = '300, 400, 600, 800'
  assign img_sizes = '(min-width: 750px) 33vw, 100vw'
-%}

{{
  image
  | image_url: width: 800
  | image_tag:
    widths: img_widths,
    sizes: img_sizes,
    alt: image.alt,
    loading: 'lazy'
}}
```

**规则：所有 widths / sizes 变量统一在 Section 文件顶部的 `{%- liquid -%}` 块中声明。**

### 3.2 常用 widths / sizes 参考值

| 使用场景 | widths 变量值 | sizes 变量值 |
|----------|--------------|-------------|
| 全宽背景图（Hero / Promo） | `'750, 1100, 1500, 2000, 3000, 3840'` | `'100vw'` |
| 半宽大图（两栏左侧） | `'400, 600, 900, 1200'` | `'(min-width: 750px) 50vw, 100vw'` |
| 产品卡片图（4列网格） | `'300, 400, 600, 800'` | `'(min-width: 990px) 25vw, (min-width: 750px) 33vw, 50vw'` |
| Campaign 卡片（3列） | `'400, 600, 900'` | `'(min-width: 990px) 33vw, (min-width: 750px) 50vw, 100vw'` |
| 小缩略图（品类/图案滑块） | `'200, 300, 400'` | `'(min-width: 750px) 160px, 128px'` |
| Bento 小图 | `'300, 500, 800'` | `'(min-width: 750px) 25vw, 50vw'` |

### 3.3 alt 参数不加 `| escape`

`image_tag` 内部已自动转义 alt，无需手动处理：

```liquid
{{- 错误 -}}
alt: image.alt | escape,

{{- 正确 -}}
alt: image.alt,
```

### 3.4 style 属性使用单行写法

```liquid
{{- 错误（多行可能引发解析问题）-}}
<section
  style="
    padding-block-start: {{ value }}px;
    padding-block-end: {{ value }}px;
  "
>

{{- 正确（单行）-}}
<section
  style="padding-block-start: {{ value }}px; padding-block-end: {{ value }}px;"
>
```

### 3.5 图片必须有 Placeholder

每个使用图片的地方，当图片未配置时必须显示占位图，不能白屏：

```liquid
{%- if section.settings.image != blank -%}
  {{ section.settings.image | image_url: width: 1200 | image_tag: ... }}
{%- else -%}
  {{ 'hero-apparel-1' | placeholder_svg_tag: 'your-class' }}
{%- endif -%}
```

常用 placeholder 名称：`hero-apparel-1` / `hero-apparel-2` / `product-1` ~ `product-6` / `collection-1` ~ `collection-6`


### 3.6 Section 宽度必须使用主题 section 体系

所有新建 Section **禁止自行定义页面主宽度**，不能自己创建新的 container / max-width 布局体系。

**❌ 禁止写法：**
```css
max-width: 1200px;
margin-inline: auto;
padding-inline: 20px;
width: min(1200px, 100%);
```

**✅ 正确做法**：根元素使用主题 `section--{{ section.settings.section_width }}` class，**所有内容必须包裹在一个 `__inner` 容器中**，并设置 `grid-column: 1 / -1`（full-width）脱离主题 grid 约束：

> ⚠️ **关键原因**：主题的 `.section` 是 `display: grid`，且 `.section > * { grid-column: 2 }` 会强制所有直接子元素进入中央列，导致内部 flex/grid 布局被破坏（Swiper 高度爆炸、两栏布局失效等）。必须用 `__inner` 包裹并设置 `grid-column` 来脱离这个约束。

```liquid
<div class="section-background color-{{ section.settings.color_scheme }}"></div>
<div
  id="tooto-xxx-{{ section.id }}"
  class="section section--{{ section.settings.section_width }} color-{{ section.settings.color_scheme }} tooto-xxx"
  style="padding-block-start: {{ section.settings.padding-block-start }}px; padding-block-end: {{ section.settings.padding-block-end }}px;"
>
  <div class="tooto-xxx__inner">
    ...
  </div>
</div>
```

对应的 CSS 必须包含：

```css
/* full-width 时占满所有列，page-width 时只占中央列 */
.tooto-xxx__inner {
  grid-column: 1 / -1;
  width: 100%;
  box-sizing: border-box;
}

.section--page-width .tooto-xxx__inner {
  grid-column: 2;
}
```

Schema 中必须加入 `section_width` 配置项：

```json
{
  "type": "select",
  "id": "section_width",
  "label": "Section Width",
  "options": [
    { "value": "page-width", "label": "Page width" },
    { "value": "full-width", "label": "Full width" }
  ],
  "default": "page-width"
}
```

主题 section 宽度 class 说明：

| Class | 效果 |
|-------|------|
| `section--page-width` | 内容限制在页面宽度内（居中）|
| `section--full-width` | 内容横跨全屏 |

---

### 3.7 ⚠️ Swiper.js 使用规范

本项目轮播组件统一使用 **Swiper.js**，通过 CDN 引入。

**❌ 错误写法（加 `defer` 导致内联 script 执行时 Swiper 未就绪，slides 垂直堆叠导致页面高度爆炸）：**
```html
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js" defer></script>
<script>
  new Swiper(...); // 此时 Swiper 未定义，初始化失败
</script>
```

**✅ 正确写法：Swiper 已在 `layout/theme.liquid` 全局加载，Section 内直接使用即可：**
```html
<script>
  (function () {
    const sectionEl = document.getElementById('tooto-xxx-{{ section.id }}');
    if (!sectionEl) return;
    new Swiper(sectionEl.querySelector('.swiper'), {
      // 配置...
    });
  })();
</script>
```

**✅ 每个使用 Swiper 的 Section，必须在 `{% stylesheet %}` 中显式声明以下核心布局 CSS**（Swiper bundle CSS 会被主题样式覆盖，必须在 Section 级别重新声明）：

```css
.tooto-xxx__swiper {
  overflow: hidden;
  width: 100%;
  min-width: 0;
  position: relative;
}

.tooto-xxx__swiper > .swiper-wrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: stretch;
  box-sizing: content-box;
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1;
  will-change: transform;
}

.tooto-xxx__swiper > .swiper-wrapper > .swiper-slide {
  flex-shrink: 0;
  width: 100%;
  height: auto;
  position: relative;
  display: block;
}
```

> ⚠️ 使用 `>` 直接子选择器而非空格，确保只作用于本 Section 的 Swiper，不污染其他 Section。

**Swiper 标准配置模板（含横线型 pagination）：**
```javascript
new Swiper(swiperEl, {
  slidesPerView: 1,
  spaceBetween: 20,
  loop: false,
  slidesPerGroup: 1,
  pagination: {
    el: paginationEl,
    clickable: true,
    renderBullet: function (index, className) {
      return '<button class="' + className + ' tooto-xxx__dot" aria-label="Go to page ' + (index + 1) + '"></button>';
    },
  },
  breakpoints: {
    768: { slidesPerView: 2, spaceBetween: 20, slidesPerGroup: 2 },
    1024: { slidesPerView: 3, spaceBetween: 20, slidesPerGroup: 3 },
  },
});
```

---

## 四、Schema 规范

每个 Section 的 Schema 必须包含以下标准配置项：

```json
{
  "type": "color_scheme",
  "id": "color_scheme",
  "label": "Color Scheme",
  "default": "scheme-1"
},
{
  "type": "range",
  "id": "padding-block-start",
  "label": "Top Padding",
  "min": 0,
  "max": 100,
  "step": 4,
  "unit": "px",
  "default": 48
},
{
  "type": "range",
  "id": "padding-block-end",
  "label": "Bottom Padding",
  "min": 0,
  "max": 100,
  "step": 4,
  "unit": "px",
  "default": 48
}
```

每个 Section 必须包含 `presets`，方便从主题编辑器直接添加：

```json
"presets": [
  {
    "name": "Tooto Xxx",
    "settings": {
      "color_scheme": "scheme-1"
    }
  }
]
```

Section 必须设置禁用组：
```json
"disabled_on": {
  "groups": ["header", "footer"]
}
```

---

## 五、Section 文件结构模板

每个新建 Section 按以下顺序组织代码：

```liquid
{%- liquid
  {# 1. 所有逻辑变量 #}
  {# 2. 所有图片 widths / sizes 变量（必须在此声明）#}
  assign img_widths = '300, 400, 600, 800'
  assign img_sizes = '(min-width: 750px) 33vw, 100vw'
-%}

{# 3. HTML 结构 #}
<section
  id="tooto-xxx-{{ section.id }}"
  class="tooto-xxx color-{{ section.settings.color_scheme }}"
  style="padding-block-start: {{ section.settings.padding-block-start }}px; padding-block-end: {{ section.settings.padding-block-end }}px;"
>
  ...
</section>

{# 4. JavaScript（如需要）#}
<script>
  (function () {
    ...
  })();
</script>

{# 5. 样式 #}
{% stylesheet %}
  .tooto-xxx { ... }
{% endstylesheet %}

{# 6. Schema #}
{% schema %}
{
  "name": "Tooto Xxx",
  "tag": "section",
  "class": "tooto-xxx-wrapper",
  "disabled_on": { "groups": ["header", "footer"] },
  "settings": [ ... ],
  "presets": [ ... ]
}
{% endschema %}
```

---

## 六、新建 Section 检查清单

每次生成新 Section 代码后，逐项检查：

- [ ] 文件名以 `tooto-` 开头
- [ ] 顶部 `{%- liquid -%}` 块中声明了所有 `widths` / `sizes` 变量
- [ ] `image_tag` 的 `widths` 和 `sizes` 使用变量，不使用字符串字面量
- [ ] `alt` 参数不加 `| escape`
- [ ] `style` 属性使用单行写法
- [ ] 无图时有 `placeholder_svg_tag` 占位
- [ ] 颜色和字体不硬编码，通过 `color_scheme` 继承主题变量
- [ ] 根元素使用 `section section--{{ section.settings.section_width }}` class 体系
- [ ] 所有内容包裹在 `__inner` 容器中，CSS 设置 `grid-column: 1 / -1`（full-width）/ `grid-column: 2`（page-width）脱离主题 grid 约束
- [ ] Schema 包含 `section_width` select 配置项，默认 `page-width`
- [ ] Schema 包含 `color_scheme` / `padding-block-start` / `padding-block-end`
- [ ] Schema 包含 `presets`
- [ ] Schema 包含 `disabled_on: { groups: ["header", "footer"] }`
- [ ] Section HTML 根元素带有 `id="tooto-xxx-{{ section.id }}"`
- [ ] CSS class 命名使用 BEM：`.tooto-xxx__element--modifier`
- [ ] 使用 Swiper 时：**不在 Section 内引入 CDN**，Swiper 已在 `layout/theme.liquid` 全局加载
- [ ] 使用 Swiper 时：Swiper 容器加 `min-width: 0` 防止外层 grid 压缩导致高度异常

---

## 七、截图 → Section 还原规范

> 每次接收截图并需要生成 Section 时，必须遵守本章节。跳过分析直接写代码会导致还原精度严重下降。

### 7.1 五层拆解法（必须按顺序执行）

拿到截图后，按以下顺序逐层分析，不能跳步：

```
第一层：Section 边界识别
第二层：宏观布局骨架
第三层：组件级结构
第四层：元素级样式
第五层：交互行为推断
```

**第一层：Section 边界识别**
- 判断截图中有几个独立 Section（背景色切换、间距明显增大为分隔线）
- 识别背景色：纯白 / 米白 / 深色 / 图片背景
- 识别上下内边距（视觉感知，换算为 px）

**第二层：宏观布局骨架**

| 布局类型 | 判断特征 | 对应 CSS |
|----------|----------|----------|
| 单列全宽 | 内容横贯全屏，无左右分区 | `width: 100%` |
| 两栏等分 | 左右各占 ~50% | `grid-cols-2` |
| 两栏非等分 | 左右比例悬殊，如 40:60 | `grid-cols-[2fr_3fr]` |
| 三栏等分 | 三组内容横向等宽 | `grid-cols-3` |
| 四栏等分 | 产品网格常见 | `grid-cols-4` |
| Bento Grid | 左侧大图跨行 + 右侧多小图 | `grid` + `row-span-2` |
| 叠层（Stack） | 内容绝对定位叠在背景图上 | `relative` + `absolute` |

识别要点：
- 看内容「重心」→ 判断对齐方式（左对齐 / 居中 / 两端对齐）
- 看列间距 → 判断 `gap` 大小
- 看是否有最大宽度限制（正文区有 `max-width`，背景图通常没有）

**第三层：组件级结构**

| 组件类型 | 典型视觉特征 |
|----------|--------------|
| Hero Banner | 全宽背景图 + 文字叠加 |
| 标题区（Header Block） | 大号标题 + 描述 + 可选 CTA |
| 卡片组（Card Grid） | 多个等尺寸图文单元横向排列 |
| 标签（Badge/Tag） | 叠加在图片角落的小型胶囊文字 |
| 进度指示器 | 轮播页码，细横线或圆点 |
| CTA 链接 | 带箭头「→」或下划线的文字按钮 |

**第四层：元素级样式**

文字类：
- 字号：正文约 14-16px，大标题约 32-56px
- 字重：细 300 / 常规 400 / 中等 500 / 粗 700-800
- 行高：紧凑 1.1-1.2 / 舒适 1.5-1.7
- 小标签通常带 `letter-spacing: 0.1em` + `text-transform: uppercase`

图片类：
- 宽高比：正方形 1:1 / 竖向 4:5 或 3:4 / 横向 4:3 或 16:9
- 图片被裁切 → `object-fit: cover`
- 圆角：无 / 小（4-8px）/ 大（16px+）

常见间距参考：

| 位置 | 常见值 |
|------|--------|
| Section 上下内边距 | 48-80px（桌面端）|
| 卡片间距（gap） | 16-24px |
| 标题与内容间距 | 24-40px |
| 图片与文字间距 | 12-16px |

**第五层：交互行为推断**

| 视觉线索 | 推断的交互行为 |
|----------|--------------|
| 底部有细横线进度条（多段） | 轮播，每段代表一页 |
| 底部有圆点 Dots | Carousel |
| 图片超出容器边缘被截断 | 横向滚动（`overflow-x: scroll`）|
| 箭头按钮（← →）在卡片组两侧 | 手动翻页轮播 |
| "See More →" / "View All →" 文字 | 跳转链接，非按钮 |

---

### 7.2 截图分析报告模板（写代码前必须先输出）

```
### 截图分析报告
1. Section 背景：[颜色描述]
2. 布局骨架：[如「两栏：左40%标题 + 右60%描述」]
3. 组件清单：[逐一列出]
4. 元素样式：标题 ~Xpx 字重X / 图片比例 X:X / 卡片间距 ~Xpx
5. 交互行为：[轮播/滑动/点击等]
6. 响应式推断：Desktop [布局] / Mobile [布局]
7. Schema 参数规划：[列出可配置项]
```

---

### 7.3 常见 Section 模式识别

**模式 A：两栏 Header + 卡片轮播**
- 上半：左侧大标题（~40-50% 宽）+ 右侧描述文字和 CTA 链接
- 下半：3 张等宽卡片横向排列
- 底部：细横线进度条居中
- 卡片结构：图片（竖向比例约 1:1.2）+ 左上角 Tag 标签 + 图片下方标题
- 进度条段数 = 总页数，深色段 = 当前页

**模式 B：全宽 Hero Banner**
- `relative` 容器 + `absolute` 背景图 + `absolute` overlay + `relative` 文字层
- overlay 透明度由 Schema `overlay_opacity` 控制，不硬编码

**模式 C：产品网格（带标题行）**
- 标题行：`flex justify-between items-baseline`（基线对齐）
- 4列 → desktop: `grid-cols-4` / mobile: `grid-cols-2`
- 3列 → desktop: `grid-cols-3` / mobile: `grid-cols-1`

**模式 D：Bento Grid**
- `grid-template-columns: repeat(2, 1fr)` + `grid-template-rows: repeat(2, 1fr)`
- 大图：`grid-row: span 2`

**模式 E：横向滚动展示**
- 末尾图片被截断 = 设计意图是可滚动，必须实现 `overflow-x: auto` + `.scrollbar-hide`
- 每张图 `flex-shrink: 0` 防止压缩

---

### 7.4 进度条 / 轮播指示器规范

| 外观 | 类型 | 实现 |
|------|------|------|
| 多段细横线（矩形，~40px 宽） | 横线型 | `div` 列表，激活项加深色类 |
| 多个圆点（~8px） | 圆点型 | `button` 列表，激活项加深色类 |

横线型进度条 CSS 规范：
```css
.tooto-slider__pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 32px;
}
.tooto-slider__dot {
  width: 40px;
  height: 2px;
  background-color: var(--color-foreground);
  opacity: 0.2;
  cursor: pointer;
  transition: opacity 0.3s ease;
}
.tooto-slider__dot--active {
  opacity: 1;
}
```

每页显示数量与进度段数关系：

| 断点 | 每页卡片数 | 进度段数（共6张卡为例）|
|------|-----------|------------------------|
| Desktop ≥ 1024px | 3 | 2 段 |
| Tablet 768-1023px | 2 | 3 段 |
| Mobile < 768px | 1 | 6 段 |

> ⚠️ 进度条必须实现 JS 联动，不能只写静态样式。

---

### 7.5 Badge 标签叠加图片规范

```css
/* 图片容器必须有 position: relative */
.tooto-card__badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background-color: rgba(var(--color-foreground-rgb), 0.5);
  color: var(--color-background);
}
```

---

### 7.6 还原精度自检清单

生成代码后，对照截图逐项检查：

- [ ] **整体比例**：Section 高度、内边距与设计稿视觉一致
- [ ] **布局骨架**：列数、列宽比例正确
- [ ] **图片比例**：`aspect-ratio` 与设计稿一致，不写死 `height`
- [ ] **字号层级**：标题 >> 副标题 >> 正文 >> 标签，层级清晰
- [ ] **间距节奏**：标题与内容、卡片、图文间距合理
- [ ] **标签位置**：叠加在图片正确位置，父容器有 `position: relative`
- [ ] **进度条**：段数正确、居中、有 JS 联动交互
- [ ] **CTA 链接**：文字链接样式（非实心按钮），带箭头或下划线
- [ ] **响应式**：移动端布局不错位，图片不变形
- [ ] **空状态**：无图时有 `placeholder_svg_tag`，不白屏

---

### 7.7 典型还原错误

- ❌ **图片比例写死高度**：用 `height: 300px` → 应改用 `aspect-ratio: 4/5`
- ❌ **两栏用 flex 而非 grid**：有明确比例关系时优先用 `grid`，比例更可控
- ❌ **Badge 父容器忘记 `position: relative`**：标签会跑到错误位置
- ❌ **截断暗示被忽略**：图片被边缘截断 = 可滚动区域，必须实现横向滚动
- ❌ **进度条只写样式不写交互**：进度条必须与轮播状态联动

---

## 八、性能规范

### 8.1 Web Vitals 指标目标（75th percentile）

| 指标 | 目标值 | 说明 |
|------|--------|------|
| LCP | ≤ 2.5s | Largest Contentful Paint（最大内容渲染）|
| CLS | ≤ 0.1 | Cumulative Layout Shift（累计布局偏移）|
| INP | ≤ 200ms | Interaction to Next Paint（交互响应）|

> 每次新增 Section 上线后，必须在 Lighthouse 检测，确保整页分数**不下降超过 10 分**。

---

### 8.2 图片性能规范

- **所有图片必须懒加载**：`image_tag` 统一加 `loading: 'lazy'`，首屏主图例外（用 `loading: 'eager'` + `fetchpriority: 'high'`）
- **图片必须声明尺寸**：通过 `aspect-ratio` 或固定容器尺寸预留空间，防止 CLS
- **禁止用 JS 动态插入首屏图片**：会阻塞 LCP
- **响应式图片**：通过 `widths` + `sizes` 参数输出 `srcset`，让浏览器按视口选择最合适尺寸

```liquid
{%- liquid
  assign img_widths = '750, 1100, 1500, 2000'
  assign img_sizes = '100vw'
-%}

{{- section.settings.image
  | image_url: width: 1500
  | image_tag:
    widths: img_widths,
    sizes: img_sizes,
    loading: 'eager',
    fetchpriority: 'high',
    alt: section.settings.image.alt
-}}
```

---

### 8.3 CLS（布局偏移）防护规范

- **图片容器必须预留空间**：用 `aspect-ratio` 而非写死 `height`，确保图片加载前不占位为 0
- **字体加载**：使用主题继承的字体变量，不额外引入第三方字体（避免 FOUT/FOIT）
- **禁止在 DOMContentLoaded 后改变元素尺寸**：JS 初始化轮播、Tabs 等组件时，不能改变容器高度
- **Skeleton 占位**：当内容依赖异步数据时，必须用等高占位元素（可用 `placeholder_svg_tag`）

```css
/* 正确：用 aspect-ratio 预留空间，防止 CLS */
.tooto-card__image-wrapper {
  aspect-ratio: 4 / 5;
  overflow: hidden;
}

/* 错误：不预留空间，图片加载时产生布局偏移 */
.tooto-card__image-wrapper {
  /* 无尺寸声明 */
}
```

---

### 8.4 JavaScript 性能规范

- **Section JS 用 IIFE 包裹**：`(function() { ... })()` 避免污染全局作用域
- **事件监听用事件委托**：不对每个卡片单独绑定事件，统一在父容器监听
- **JS 只在 Section 存在时执行**：用 `document.getElementById` 判断节点存在再初始化

```javascript
(function () {
  const slider = document.getElementById('tooto-slider-{{ section.id }}');
  if (!slider) return; // Section 不存在则跳出，不报错

  // 用 IntersectionObserver 替代 scroll 事件监听，性能更好
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 进入视口才执行动画 / 加载
      }
    });
  }, { threshold: 0.1 });

  observer.observe(slider);
})();
```

---

### 8.5 CSS 性能规范

- **用 `{% stylesheet %}` 块而非外链 CSS 文件**：Shopify 会自动合并，减少请求数
- **不使用 `@import`**：会产生额外网络请求，阻塞渲染
- **动画只操作 `transform` 和 `opacity`**：这两个属性不触发 Layout / Paint，只触发 Composite
- **图片 hover 缩放用 `transform: scale()`**：不用改变 `width` / `height`

```css
/* 正确：只触发 Composite，不影响性能 */
.tooto-card__image {
  transition: transform 0.5s ease;
}
.tooto-card:hover .tooto-card__image {
  transform: scale(1.05);
}

/* 错误：触发 Layout，性能差 */
.tooto-card:hover .tooto-card__image {
  width: 110%;
  height: 110%;
}
```

---

### 8.6 Storefront 请求性能目标

| 场景 | 目标 |
|------|------|
| Checkout 请求响应时间 | p95 ≤ 500ms |
| Checkout 失败率 | ≤ 0.1% |
| Section 渲染（Liquid） | 不做额外同步 API 请求 |

- **禁止在 Section Liquid 中发起同步外部请求**：会阻塞整页 TTFB
- **动态内容用 Section Rendering API**：异步加载，不阻塞首屏

---

## 九、参考文件

| 文件 | 用途 |
|------|------|
| `docs/section-prompts.md` | 各 Section 设计稿分析与布局 Prompt |
| `assets/custom.scss` | 全局辅助样式（只写布局工具类）|
| `templates/index.json` | 首页 Section 配置 |
