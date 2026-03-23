# Tooto Product Features Metafield

这个功能使用 **产品 metafield + metaobject 列表** 渲染重复的图文结构。

## 1. 创建 Metaobject Definition

- **Name**: `Tooto Product Feature`
- **Type**: `tooto_product_feature`

### 字段

1. `feature_image`
   - 类型：File
   - 用途：左/右侧图片

2. `heading`
   - 类型：Single line text
   - 用途：标题

3. `body`
   - 类型：Multi-line text
   - 用途：描述正文

## 2. 创建 Product Metafield Definition

- **Namespace and key**: `custom.tooto_product_features`
- **Type**: `List of metaobject references`
- **Reference type**: `tooto_product_feature`

## 3. Theme Editor 使用方式

- 打开产品页模板
- 新增一个通用自定义分区：`Section`
- 在该 `Section` 下新增 block：`Tooto Product Features Metafield`
- 这个 block 会读取当前产品页的 `custom.tooto_product_features`

## 4. 渲染规则

- 每个 metaobject entry 渲染成一组图文
- 第 1 组：左图右文
- 第 2 组：左文右图
- 第 3 组开始继续交替
- Mobile 自动改为单列堆叠

## 5. 代码位置

- Block: `blocks/tooto-product-features-metafield.liquid`
- Section 接入: `sections/section.liquid`
