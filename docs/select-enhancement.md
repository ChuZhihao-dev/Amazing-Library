# Tooto Select Enhancement System

## 概述

这个系统使用 Choices.js 库来自动增强网站上的所有 select 元素，特别是第三方 app 生成的 select。

## 功能特性

### 🎯 自动增强
- 自动检测并增强页面上的所有 select 元素
- 支持动态添加的 select（AJAX、app 生成）
- 保持原有功能和事件兼容性

### 🎨 统一样式
- 使用主题颜色变量
- 响应式设计
- 平滑动画和过渡效果
- 移动端优化

### ⚙️ 灵活配置
- 可选择性跳过特定 select
- 支持手动初始化和销毁
- App 特定样式覆盖

## 使用方法

### 自动增强（推荐）
无需任何配置，系统会自动增强所有 select：

```html
<!-- 这些 select 会被自动增强 -->
<select name="variant">
  <option value="1">选项 1</option>
  <option value="2">选项 2</option>
</select>
```

### 手动控制

```javascript
// 手动初始化特定 select
window.tootoSelect.initSelect('#my-select');

// 跳过增强（添加属性）
<select data-skip-enhancement>
  <option>保持原样</option>
</select>

// 销毁特定 select 的增强
window.tootoSelect.destroySelect('#my-select');
```

### CSS 类控制

```html
<!-- 特定样式类 -->
<select class="cart-select">        <!-- 购物车样式 -->
<select class="utility-select">     <!-- 工具类样式 -->
<select data-custom-select>        <!-- 自定义样式 -->
```

## 样式定制

### 基础样式变量
所有样式使用主题 CSS 变量，自动适配颜色方案：

- `var(--color-foreground)` - 主要文字颜色
- `var(--color-background)` - 背景颜色
- `var(--color-border-rgb, 0.2)` - 边框颜色

### App 特定覆盖

```scss
// 为特定 app 的 select 定制样式
.avpoptions-container__v2 {
  .choices.tooto-select {
    .choices__inner {
      padding: 14px 44px 14px 16px;
      font-weight: 500;
    }
  }
}
```

## 技术实现

### 文件结构
```
assets/
├── custom.scss              # 样式定义
├── tooto-selects.js         # 核心逻辑
layout/theme.liquid          # 库加载
```

### 核心逻辑
1. **DOM 就绪检测**：等待页面完全加载
2. **自动扫描**：查找所有未初始化的 select
3. **动态监听**：MutationObserver 监听新元素
4. **样式应用**：应用主题一致的样式
5. **事件保持**：保持原有 change 事件

### 性能优化
- 使用 `defer` 加载，不阻塞页面渲染
- 防抖处理，避免重复初始化
- 智能跳过已处理的元素
- 轻量级 CSS，不影响加载速度

## 故障排除

### 常见问题

**Q: 某些 select 没有被增强？**
A: 检查是否有 `data-skip-enhancement` 属性，或查看控制台错误信息。

**Q: 样式不正确？**
A: 确保 Choices.js 库正确加载，检查 CSS 变量是否定义。

**Q: 与第三方 app 冲突？**
A: 使用 `data-skip-enhancement` 跳过特定 select，或联系开发者调整选择器。

### 调试模式

```javascript
// 查看所有增强的 select
document.querySelectorAll('[data-choices-initialized]');

// 查看特定 select 的实例
const select = document.querySelector('#my-select');
console.log(select._choicesInstance);
```

## 更新日志

### v1.0.0
- 初始版本
- 自动增强所有 select
- 主题样式集成
- 移动端优化
- App 兼容性
