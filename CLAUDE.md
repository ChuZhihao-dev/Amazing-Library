# Woo Carpet — Claude 项目规范

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

- Section 文件统一前缀：`woo-`，例如 `sections/woo-hero-banner.liquid`
- Snippet 文件统一前缀：`woo-`，例如 `snippets/woo-card.liquid`
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
  <section class="woo-xxx color-{{ section.settings.color_scheme }}">
  ```

### 2.3 custom.scss 只写布局辅助
- 只允许写**布局工具类**，不写颜色、字体、具体组件样式
- 当前已有工具类：`.scrollbar-hide` / `.woo-img-zoom` / `.line-clamp-2` / `.woo-container` / `.woo-bento-grid`

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


### 3.6 Section 不能自行定义页面主宽度

所有新建 Section **禁止直接设置页面主宽度**，不能自己创建新的 container / max-width 布局体系。

**禁止写法包括但不限于：**
```css
max-width: 1200px;
margin-inline: auto;
padding-inline: 20px;
width: min(1200px, 100%);

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
    "name": "Woo Xxx",
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
  id="woo-xxx-{{ section.id }}"
  class="woo-xxx color-{{ section.settings.color_scheme }}"
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
  .woo-xxx { ... }
{% endstylesheet %}

{# 6. Schema #}
{% schema %}
{
  "name": "Woo Xxx",
  "tag": "section",
  "class": "woo-xxx-wrapper",
  "disabled_on": { "groups": ["header", "footer"] },
  "settings": [ ... ],
  "presets": [ ... ]
}
{% endschema %}
```

---

## 六、新建 Section 检查清单

每次生成新 Section 代码后，逐项检查：

- [ ] 文件名以 `woo-` 开头
- [ ] 顶部 `{%- liquid -%}` 块中声明了所有 `widths` / `sizes` 变量
- [ ] `image_tag` 的 `widths` 和 `sizes` 使用变量，不使用字符串字面量
- [ ] `alt` 参数不加 `| escape`
- [ ] `style` 属性使用单行写法
- [ ] 无图时有 `placeholder_svg_tag` 占位
- [ ] 颜色和字体不硬编码，通过 `color_scheme` 继承主题变量
- [ ] Schema 包含 `color_scheme` / `padding-block-start` / `padding-block-end`
- [ ] Schema 包含 `presets`
- [ ] Schema 包含 `disabled_on: { groups: ["header", "footer"] }`
- [ ] Section HTML 根元素带有 `id="woo-xxx-{{ section.id }}"`
- [ ] CSS class 命名使用 BEM：`.woo-xxx__element--modifier`

---

## 七、参考文件

| 文件 | 用途 |
|------|------|
| `docs/section-prompts.md` | 设计稿分析、Section 布局 Prompt、Liquid 编码规范 |
| `assets/custom.scss` | 全局辅助样式（只写布局工具类）|
| `templates/index.json` | 首页 Section 配置 |
| `sections/woo-hero-banner.liquid` | 参考实现：Hero Banner |
| `sections/woo-campaign.liquid` | 参考实现：多图卡片 |
| `sections/woo-brand-story.liquid` | 参考实现：Bento Grid |
