# Tooto Mega Menu 配置说明

现在这套超级菜单 **不再使用 Metaobject / 元对象**。

图片直接在 Theme Editor 的 Header 菜单 block 里配置。

## 1. 去哪里配置

进入：

- `Online Store -> Themes -> Customize`
- 打开 `Header`
- 找到两个菜单 block：
  - 左侧菜单 block（通常绑定 `left-menu`）
  - 右侧菜单 block（通常绑定 `right-menu`）

你会看到新增的配置项：

### Products Mega Menu
- `Products Image`
- `Products Image Link`
- `Shop By Material Image`
- `Shop By Material Image Link`
- `Shop By Style Image`
- `Shop By Style Image Link`

### Inspiration Mega Menu
- `Inspiration Image`
- `Inspiration Image Link`

### Custom Size Mega Menu
- `Custom Size Image`
- `Custom Size Image Link`

## 2. 菜单层级要求

### left-menu
- `Products`
  - `Shop By Material`
    - `Wool`
    - `Wool Blend`
    - `Synthetic`
    - `Jute`
    - `Indoor/outdoor`
  - `Shop By Style`
    - 二级子项...
  - `Custom Size`

### right-menu
- `Inspiration`
  - `Campaign`
  - `Our Stories`

### main-menu / right-menu
- `Custom Size`
  - 子项按你的菜单配置

## 3. 代码识别规则

代码按菜单 handle 固定识别三个一级菜单：

- `products`
- `inspiration`
- `custom-size`

以及 Products 下两个二层分组：

- `shop-by-material`
- `shop-by-style`

如果你的 Shopify Navigation 里的 handle 不是这些，需要把菜单项标题调整为能生成这些 handle，或者再改代码映射。

## 4. 图片使用规则

- `Products Image`：Products 第一层右图
- `Shop By Material Image`：进入 `Shop By Material` 第二层后的右图
- `Shop By Style Image`：进入 `Shop By Style` 第二层后的右图
- `Inspiration Image`：Inspiration 第一层右图
- `Custom Size Image`：Custom Size 第一层右图

如果二层图片没配置，会自动回退使用该一级菜单的图片。
如果一级图片也没配置，会显示 placeholder，不会白屏。

## 5. 链接规则

- `Products Image Link`：点击 Products 第一层右图跳转
- `Shop By Material Image Link`：点击 Material 第二层右图跳转
- `Shop By Style Image Link`：点击 Style 第二层右图跳转
- `Inspiration Image Link`：点击 Inspiration 右图跳转
- `Custom Size Image Link`：点击 Custom Size 右图跳转

如果图片链接留空，会回退到当前层级对应菜单链接。
