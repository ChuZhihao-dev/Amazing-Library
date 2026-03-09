# Woo Carpet — Shopify 主题 Section 开发 Prompts

> 基于设计稿分析生成，共 7 个内容 Section（不含 Header / Footer）
> 技术栈：Shopify Liquid + Tailwind CSS + SCSS (assets/custom.scss)

---

## 项目约定

- 样式优先使用 **Tailwind CSS** 工具类
- 补充/特殊样式写入 `assets/custom.scss`（编译为 `assets/custom.css`）
- **颜色与字体** 统一由 Shopify 主题的 Color Scheme / Typography 设置管理，使用主题 CSS 变量继承，Section 代码中不硬编码任何颜色值或字体名
- Section 文件统一命名前缀：`woo-`
- 图片统一使用 Shopify `image_url` + `image_tag` 输出，支持懒加载

---

## Section 1: `woo-hero-banner` — 顶部大图 Hero Banner

**文件路径：** `sections/woo-hero-banner.liquid`

### 视觉描述
- 全宽背景大图（地毯质感纹理图），覆盖整个区域
- 左下方有大标题文字
- 右下角有一个 CTA 按钮
- 图片高度约占视口 80~90%
- 整体叠加半透明深色 overlay，使文字清晰可读

### 布局结构
```
┌─────────────────────────────────────────────────┐
│                                                 │
│                  [背景大图]                      │  min-h-[80vh]
│                                                 │
│ [大标题 H1]                      [CTA 按钮]     │  ← 左下 + 右下
└─────────────────────────────────────────────────┘
```

### Tailwind 布局规范
| 元素 | Tailwind 类 |
|------|-------------|
| section 容器 | `relative w-full min-h-[80vh] overflow-hidden` |
| 背景图 | `absolute inset-0 w-full h-full object-cover` |
| Overlay | `absolute inset-0`（透明度由 schema overlay_opacity 内联控制） |
| 内容层 | `relative z-10 flex flex-col justify-between p-8 md:p-16 min-h-[80vh]` |
| 底部行（标题+按钮） | `flex items-end justify-between gap-4` |
| 标题 | `text-4xl md:text-6xl leading-tight max-w-lg` |
| 按钮 | `border px-6 py-3 text-sm transition shrink-0` |

### Shopify Schema 配置项
| 设置项 | 类型 | 说明 |
|--------|------|------|
| `image` | image_picker | 背景图片 |
| `title` | richtext | 主标题文字 |
| `button_label` | text | 按钮文字 |
| `button_link` | url | 按钮链接 |
| `overlay_opacity` | range (0-100) | 遮罩透明度，默认 40 |
| `section_height` | select | 区域高度：`60vh` / `80vh` / `100vh` |

---

## Section 2: `woo-category-showcase` — 品类展示区

**文件路径：** `sections/woo-category-showcase.liquid`

### 视觉描述
- 上半部分：左侧占 1/4 宽度的标题文字区 + 右侧 3 张产品缩略图横排（各占 1/4）
- 下半部分：横跨全宽的大尺寸特色展示图
- 整体为深色背景（使用 color_scheme 控制），图片和文字反白显示

### 布局结构
```
┌──────────┬──────────┬──────────┬──────────┐
│          │ [小图1]  │ [小图2]  │ [小图3]  │
│  [标题]  │  标签    │  标签    │  标签    │
├──────────┴──────────┴──────────┴──────────┤
│              [大展示图]                    │
└────────────────────────────────────────────┘
```

### Tailwind 布局规范
| 元素 | Tailwind 类 |
|------|-------------|
| section 容器 | `w-full` |
| 上半网格 | `grid grid-cols-4` |
| 标题块 | `col-span-1 flex items-center justify-center p-8` |
| 标题文字 | `text-2xl md:text-3xl leading-snug` |
| 小图区 | `col-span-3 grid grid-cols-3 gap-3 p-4` |
| 每个小图容器 | `aspect-square overflow-hidden cursor-pointer group` |
| 小图 | `w-full h-full object-cover group-hover:scale-105 transition-transform duration-500` |
| 图片标签文字 | `text-xs mt-1 truncate` |
| 大图行 | `col-span-4 h-64 md:h-[480px] overflow-hidden` |
| 大图 | `w-full h-full object-cover` |

### Shopify Schema 配置项
| 设置项 | 类型 | 说明 |
|--------|------|------|
| `heading` | text | 左侧标题文字 |
| `collection` | collection | 关联集合（自动取前 3 个产品作为小图） |
| `featured_image` | image_picker | 底部大展示图 |
| `color_scheme` | color_scheme | 主题配色方案选择器 |

---

## Section 3: `woo-product-grid-showcase` — 产品网格展示区

**文件路径：** `sections/woo-product-grid-showcase.liquid`

### 视觉描述
- 顶部：左侧小标签（细字 uppercase）+ 主标题，右侧 "View All" 文字链接
- 下方是 4 列产品卡片网格
- 每张卡片：产品图（正方形比例）+ 产品名称 + 价格
- 卡片无边框，背景继承 section 配色，干净简洁
- 移动端变为 2 列

### 布局结构
```
┌──────────────────────────────────────────────────┐
│ [小标签 uppercase]                               │
│ [主标题]                          [View All →]   │
├───────────┬───────────┬───────────┬──────────────┤
│ [产品图]  │ [产品图]  │ [产品图]  │  [产品图]    │
│  产品名   │  产品名   │  产品名   │   产品名     │
│   价格    │   价格    │   价格    │    价格      │
└───────────┴───────────┴───────────┴──────────────┘
```

### Tailwind 布局规范
| 元素 | Tailwind 类 |
|------|-------------|
| section 容器 | `py-12 md:py-16` |
| 内容宽度 | `max-w-screen-xl mx-auto px-4` |
| 标题行 | `flex items-end justify-between gap-4 mb-8` |
| 小标签 | `text-xs uppercase tracking-widest mb-1` |
| 主标题 | `text-2xl md:text-3xl` |
| View All 链接 | `text-sm underline shrink-0 transition` |
| 产品网格 | `grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6` |
| 产品卡片 | `flex flex-col gap-2 cursor-pointer group` |
| 产品图容器 | `aspect-square overflow-hidden` |
| 产品图 | `w-full h-full object-cover group-hover:scale-105 transition-transform duration-500` |
| 产品名 | `text-sm mt-2` |
| 价格 | `text-sm font-medium` |

### Shopify Schema 配置项
| 设置项 | 类型 | 说明 |
|--------|------|------|
| `section_label` | text | 小标签文字（如 "New Arrival"） |
| `heading` | text | 主标题 |
| `collection` | collection | 关联集合 |
| `products_count` | range (2-8) | 显示产品数量，默认 4 |
| `show_view_all` | checkbox | 是否显示 View All，默认 true |
| `view_all_label` | text | View All 按钮文字 |
| `color_scheme` | color_scheme | 主题配色方案选择器 |

---

## Section 4: `woo-pattern-slider` — 纹理图案轮播区

**文件路径：** `sections/woo-pattern-slider.liquid`

### 视觉描述
- 左右两栏布局
- 左侧：大字号标题 + 描述文字 + CTA 按钮，垂直居中排列
- 右侧：多张纹理/图案方形缩略图横向排列，超出部分可横向滚动
- 右侧图片下方有轮播进度指示点（dots）
- 整体为浅色背景

### 布局结构
```
┌──────────────────────┬────────────────────────────┐
│                      │  [图1] [图2] [图3] [图4→]  │
│  [大标题]            │  ←  可横向滚动  →          │
│  [描述文字]          │                            │
│  [CTA 按钮]          │       ● ○ ○ ○              │
└──────────────────────┴────────────────────────────┘
```

### Tailwind 布局规范
| 元素 | Tailwind 类 |
|------|-------------|
| section 容器 | `py-16` |
| 内容宽度 | `max-w-screen-xl mx-auto px-4` |
| 两栏网格 | `grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center` |
| 左列标题 | `text-3xl md:text-5xl leading-tight` |
| 描述文字 | `text-sm mt-4 max-w-xs leading-relaxed` |
| CTA 按钮 | `mt-6 inline-block px-8 py-3 text-sm transition` |
| 右列滚动容器 | `flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2` |
| 每张图片 | `w-32 h-32 md:w-40 md:h-40 flex-shrink-0 overflow-hidden` |
| 图片 | `w-full h-full object-cover hover:scale-105 transition-transform duration-300` |
| Dots 容器 | `flex gap-2 mt-4` |
| Dot 激活 | `w-4 h-1 rounded-full` |
| Dot 未激活 | `w-1 h-1 rounded-full opacity-40` |

### Shopify Schema 配置项
| 设置项 | 类型 | 说明 |
|--------|------|------|
| `heading` | richtext | 左侧标题 |
| `description` | textarea | 描述文字 |
| `button_label` | text | 按钮文字 |
| `button_link` | url | 按钮链接 |
| `color_scheme` | color_scheme | 主题配色方案选择器 |
| blocks (type: `image`) | — | 每个图案图片 block，最多 8 个 |
| block.`image` | image_picker | 图案图片 |
| block.`label` | text | 图片下方标签文字 |

---

## Section 5: `woo-promo-banner` — 促销全宽 Banner

**文件路径：** `sections/woo-promo-banner.liquid`

### 视觉描述
- 全宽背景图，高度固定
- 叠加半透明 overlay
- 画面垂直水平居中显示大标题文字
- 标题正下方有一个 CTA 按钮（outline 风格）

### 布局结构
```
┌──────────────────────────────────────────────┐
│                                              │
│       [大标题文字（水平垂直居中）]            │
│            [CTA 按钮（居中）]                │
│                                              │
└──────────────────────────────────────────────┘
```

### Tailwind 布局规范
| 元素 | Tailwind 类 |
|------|-------------|
| section 容器 | `relative w-full h-64 md:h-[480px] overflow-hidden` |
| 背景图 | `absolute inset-0 w-full h-full object-cover` |
| Overlay | `absolute inset-0`（透明度由 schema overlay_opacity 内联控制） |
| 内容层 | `relative z-10 flex flex-col items-center justify-center h-full text-center px-4 gap-6` |
| 标题 | `text-3xl md:text-5xl leading-tight` |
| 按钮 | `border-2 px-8 py-3 text-sm tracking-wider transition` |

### Shopify Schema 配置项
| 设置项 | 类型 | 说明 |
|--------|------|------|
| `background_image` | image_picker | 背景图片 |
| `heading` | text | 主标题 |
| `button_label` | text | 按钮文字 |
| `button_link` | url | 按钮链接 |
| `overlay_opacity` | range (0-100) | 遮罩透明度，默认 50 |

---

## Section 6: `woo-campaign` — Woo Campaign 多图展示区

**文件路径：** `sections/woo-campaign.liquid`

### 视觉描述
- 顶部：左侧主标题 "Woo Campaign"，右侧可选 "View All" 链接
- 下方 3 张横向矩形图片卡片（landscape 4:3 比例）并排展示
- 每张卡片图片下方有小标题 + 简短描述文字
- 整体偏 editorial / 杂志风排版
- 移动端变为单列堆叠

### 布局结构
```
┌──────────────────────────────────────────────────┐
│ [Woo Campaign 标题]               [View All →]   │
├────────────────┬────────────────┬────────────────┤
│   [图片 4:3]   │   [图片 4:3]   │   [图片 4:3]   │
│   小标题       │   小标题       │   小标题       │
│   描述文字     │   描述文字     │   描述文字     │
└────────────────┴────────────────┴────────────────┘
```

### Tailwind 布局规范
| 元素 | Tailwind 类 |
|------|-------------|
| section 容器 | `py-12 md:py-16` |
| 内容宽度 | `max-w-screen-xl mx-auto px-4` |
| 标题行 | `flex justify-between items-baseline mb-8` |
| 主标题 | `text-2xl md:text-3xl` |
| View All 链接 | `text-sm underline transition` |
| 图片网格 | `grid grid-cols-1 md:grid-cols-3 gap-6` |
| 图片容器 | `aspect-[4/3] overflow-hidden` |
| 图片 | `w-full h-full object-cover hover:scale-105 transition-transform duration-500` |
| 卡片文字区 | `mt-3 flex flex-col gap-1` |
| 小标题 | `text-sm font-medium` |
| 描述 | `text-xs leading-relaxed line-clamp-2` |

### Shopify Schema 配置项
| 设置项 | 类型 | 说明 |
|--------|------|------|
| `heading` | text | 区块标题，默认 "Woo Campaign" |
| `show_view_all` | checkbox | 是否显示 View All |
| `view_all_label` | text | View All 文字 |
| `view_all_link` | url | View All 链接 |
| `color_scheme` | color_scheme | 主题配色方案选择器 |
| blocks (type: `card`) | — | 每个卡片 block，最多 4 个 |
| block.`image` | image_picker | 卡片图片 |
| block.`title` | text | 卡片标题 |
| block.`description` | textarea | 卡片描述（建议控制在 2 行内） |
| block.`link` | url | 卡片整体跳转链接 |

---

## Section 7: `woo-brand-story` — Woo Story 品牌故事区

**文件路径：** `sections/woo-brand-story.liquid`

### 视觉描述
- 顶部居中：小标签 + 主标题 "Woo Story"
- 主体为 Bento Grid 图片布局：左侧一张高大图（跨 2 行）+ 右侧上下两张小图
- 底部：描述文字（居左）+ 查看更多按钮（居右）
- 整体为浅色背景，与相邻深色 section 形成对比

### 布局结构
```
┌──────────────────────────────────────────────┐
│         [小标签]  [Woo Story 标题]           │  ← 居中
├───────────────────────┬──────────────────────┤
│                       │      [小图 1]        │
│       [大图]          ├──────────────────────┤
│     (row-span-2)      │      [小图 2]        │
├───────────────────────┴──────────────────────┤
│  [描述文字]                    [查看更多 →]  │
└──────────────────────────────────────────────┘
```

### Tailwind 布局规范
| 元素 | Tailwind 类 |
|------|-------------|
| section 容器 | `py-16` |
| 内容宽度 | `max-w-screen-xl mx-auto px-4` |
| 标题区 | `text-center mb-10 flex flex-col items-center gap-2` |
| 小标签 | `text-xs uppercase tracking-widest` |
| 主标题 | `text-3xl md:text-4xl` |
| Bento 图片网格 | `grid grid-cols-2 grid-rows-2 gap-3 md:gap-4` |
| 大图容器 | `row-span-2 overflow-hidden` |
| 大图 | `w-full h-full object-cover` |
| 小图容器 | `aspect-square overflow-hidden` |
| 小图 | `w-full h-full object-cover` |
| 底部内容行 | `mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4` |
| 描述文字 | `text-sm leading-relaxed max-w-xl` |
| 查看更多按钮 | `text-sm underline shrink-0 transition` |

### Shopify Schema 配置项
| 设置项 | 类型 | 说明 |
|--------|------|------|
| `label` | text | 小标签文字 |
| `heading` | text | 标题，默认 "Woo Story" |
| `description` | textarea | 底部描述文字 |
| `button_label` | text | 按钮文字 |
| `button_link` | url | 按钮链接 |
| `image_main` | image_picker | 左侧大图（跨两行） |
| `image_1` | image_picker | 右上小图 |
| `image_2` | image_picker | 右下小图 |
| `color_scheme` | color_scheme | 主题配色方案选择器 |

---

## 通用 custom.scss 规范

> 只写**布局辅助**和 Tailwind 无法覆盖的样式，不写任何颜色或字体

```scss
// assets/custom.scss

// 隐藏滚动条（横向滑动区用）
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}

// 图片 hover 缩放（统一封装）
.woo-img-zoom {
  overflow: hidden;
  img {
    transition: transform 0.5s ease;
    will-change: transform;
  }
  &:hover img { transform: scale(1.05); }
}

// Bento Grid（品牌故事区）
.woo-bento-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 0.75rem;
  .bento-main { grid-row: span 2; }
}

// 文字行数截断
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

## 开发顺序建议

| 优先级 | Section | 原因 |
|--------|---------|------|
| 1 | `woo-hero-banner` | 首屏曝光，最重要 |
| 2 | `woo-product-grid-showcase` | 核心产品转化入口 |
| 3 | `woo-category-showcase` | 品类导航入口 |
| 4 | `woo-promo-banner` | 结构简单，快速完成 |
| 5 | `woo-campaign` | Editorial 内容区 |
| 6 | `woo-pattern-slider` | 需要横向滚动 JS 交互 |
| 7 | `woo-brand-story` | 品牌故事，Bento Grid 布局 |

---

## Liquid 编码规范 & 常见陷阱

### ⚠️ image_tag 的 widths / sizes 参数必须用变量传入

**问题原因：**  
Shopify Liquid 解析 `image_tag` 过滤器的参数时，会把参数值中的逗号误判为参数分隔符。  
因此 `widths` 和 `sizes` 如果直接写含逗号的字符串，会触发语法错误：

```
Liquid syntax error: Expected end_of_string but found comma in "..."
```

**❌ 错误写法（会报错）：**
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

**✅ 正确写法（用 assign 预定义变量）：**
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

**规则：每个 section 文件顶部的 `{%- liquid -%}` 块中统一声明所有图片尺寸变量。**

---

### 常用 widths / sizes 参考值

| 使用场景 | widths | sizes |
|----------|--------|-------|
| 全宽背景图（Hero / Promo Banner） | `'750, 1100, 1500, 2000, 3000, 3840'` | `'100vw'` |
| 半宽大图（两栏布局左侧） | `'400, 600, 900, 1200'` | `'(min-width: 750px) 50vw, 100vw'` |
| 产品卡片图（4列网格） | `'300, 400, 600, 800'` | `'(min-width: 990px) 25vw, (min-width: 750px) 33vw, 50vw'` |
| Campaign 卡片图（3列网格） | `'400, 600, 900'` | `'(min-width: 990px) 33vw, (min-width: 750px) 50vw, 100vw'` |
| 小缩略图（品类展示/图案滑块） | `'200, 300, 400'` | `'(min-width: 750px) 160px, 128px'` |
| Bento 小图（右侧两张） | `'300, 500, 800'` | `'(min-width: 750px) 25vw, 50vw'` |

---

### ⚠️ alt 参数不需要加 `| escape`

`image_tag` 内部已自动对 `alt` 做 HTML 转义处理，无需手动添加 `| escape`：

**❌ 多余写法：**
```liquid
alt: image.alt | escape,
```

**✅ 正确写法：**
```liquid
alt: image.alt,
```

---

### ⚠️ style 属性内避免多行换行写法

Section 标签的 `style` 属性如果写多行，在某些 Shopify 版本中会引发解析问题：

**❌ 可能有问题：**
```liquid
<section
  style="
    padding-block-start: {{ section.settings.padding-block-start }}px;
    padding-block-end: {{ section.settings.padding-block-end }}px;
  "
>
```

**✅ 推荐写法（单行）：**
```liquid
<section
  style="padding-block-start: {{ section.settings.padding-block-start }}px; padding-block-end: {{ section.settings.padding-block-end }}px;"
>
```

---

### ✅ 新建 Section 检查清单

开发每个新 Section 前，确认以下几点：

- [ ] 顶部 `{%- liquid -%}` 块中已声明所有 `widths` / `sizes` 变量
- [ ] `image_tag` 的 `widths` 和 `sizes` 参数使用变量而非字符串字面量
- [ ] `alt` 参数不加 `| escape`
- [ ] `style` 属性使用单行写法
- [ ] 颜色和字体不硬编码，使用 `color-{{ section.settings.color_scheme }}` 继承主题变量
- [ ] 无图时有 `placeholder_svg_tag` 占位，编辑器不会白屏
- [ ] Schema 中包含 `color_scheme`、`padding-block-start`、`padding-block-end` 设置项
- [ ] Schema 中包含 `presets` 方便从主题编辑器直接添加

---

*项目：woo-carpet.myshopify.com*
