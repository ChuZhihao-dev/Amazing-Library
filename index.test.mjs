import fs from 'fs';
import path from 'path';

// ============================================================
// Figma 导出文件解析器
// 用途：读取 temp/ 目录下的 HTML/CSS 文件，提取设计数值
//       供 AI 分析并还原为 Shopify Liquid Section
// ============================================================

const TEMP_DIR = './temp';

// ── 1. 扫描 temp/ 目录，列出所有文件 ──────────────────────────
function scanTempDir() {
  const files = fs.readdirSync(TEMP_DIR, { recursive: true });
  console.log('\n📁 temp/ 目录文件清单：');
  files.forEach(f => console.log('  -', f));
  return files;
}

// ── 2. 读取 HTML 文件并提取关键信息 ───────────────────────────
function parseHTML(filename) {
  const filepath = path.join(TEMP_DIR, filename);
  if (!fs.existsSync(filepath)) return null;

  const content = fs.readFileSync(filepath, 'utf-8');
  console.log(`\n📄 HTML 文件：${filename}`);
  console.log(`   大小：${(content.length / 1024).toFixed(1)} KB`);
  console.log(`   行数：${content.split('\n').length}`);

  // 提取 inline style 中的数值
  const styleMatches = content.match(/style="([^"]+)"/g) || [];
  const allStyles = styleMatches.map(s => s.replace(/style="|"/g, ''));

  // 提取颜色值
  const colors = new Set();
  const colorRegex = /#([0-9a-fA-F]{3,8})|rgba?\([^)]+\)/g;
  content.match(colorRegex)?.forEach(c => colors.add(c));

  // 提取字体大小
  const fontSizes = new Set();
  const fontSizeRegex = /font-size:\s*([\d.]+px)/g;
  let match;
  while ((match = fontSizeRegex.exec(content)) !== null) {
    fontSizes.add(match[1]);
  }

  // 提取宽高
  const dimensions = new Set();
  const dimRegex = /(?:width|height):\s*([\d.]+px)/g;
  while ((match = dimRegex.exec(content)) !== null) {
    dimensions.add(match[1]);
  }

  // 提取文字内容
  const textRegex = />([^<]{2,100})</g;
  const texts = [];
  while ((match = textRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (text && !text.includes('{') && !text.includes(':')) {
      texts.push(text);
    }
  }

  console.log(`\n   🎨 颜色值（${colors.size} 个）：`);
  [...colors].slice(0, 20).forEach(c => console.log(`      ${c}`));

  console.log(`\n   🔤 字体大小（${fontSizes.size} 个）：`);
  [...fontSizes].forEach(f => console.log(`      ${f}`));

  console.log(`\n   📐 尺寸值（${dimensions.size} 个）：`);
  [...dimensions].slice(0, 20).forEach(d => console.log(`      ${d}`));

  console.log(`\n   📝 文字内容（前 20 条）：`);
  texts.slice(0, 20).forEach(t => console.log(`      "${t}"`));

  return { content, colors, fontSizes, dimensions, texts };
}

// ── 3. 读取 CSS 文件并提取设计 token ──────────────────────────
function parseCSS(filename) {
  const filepath = path.join(TEMP_DIR, filename);
  if (!fs.existsSync(filepath)) return null;

  const content = fs.readFileSync(filepath, 'utf-8');
  console.log(`\n🎨 CSS 文件：${filename}`);
  console.log(`   大小：${(content.length / 1024).toFixed(1)} KB`);

  // 提取 CSS 变量
  const cssVars = [];
  const varRegex = /--([\w-]+):\s*([^;]+);/g;
  let match;
  while ((match = varRegex.exec(content)) !== null) {
    cssVars.push({ name: `--${match[1]}`, value: match[2].trim() });
  }

  // 提取字体声明
  const fontFamilies = new Set();
  const fontRegex = /font-family:\s*([^;]+);/g;
  while ((match = fontRegex.exec(content)) !== null) {
    fontFamilies.add(match[1].trim());
  }

  if (cssVars.length > 0) {
    console.log(`\n   📦 CSS 变量（${cssVars.length} 个）：`);
    cssVars.slice(0, 30).forEach(v => console.log(`      ${v.name}: ${v.value}`));
  }

  if (fontFamilies.size > 0) {
    console.log(`\n   🔤 字体（${fontFamilies.size} 个）：`);
    [...fontFamilies].forEach(f => console.log(`      ${f}`));
  }

  return { content, cssVars, fontFamilies };
}

// ── 4. 生成 AI 分析摘要（给我读的） ───────────────────────────
function generateSummary(htmlData, cssData) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 AI 分析摘要（供还原 Shopify Section 使用）');
  console.log('='.repeat(60));

  if (htmlData) {
    console.log('\n【结构信息】');
    console.log(`  文字内容条数：${htmlData.texts.length}`);
    console.log(`  颜色种类：${htmlData.colors.size}`);
    console.log(`  字号种类：${htmlData.fontSizes.size}`);
  }

  if (cssData && cssData.cssVars.length > 0) {
    console.log('\n【设计 Token】');
    cssData.cssVars.forEach(v => console.log(`  ${v.name}: ${v.value}`));
  }

  console.log('\n【下一步】');
  console.log('  将以上数据 + 截图一起提供给 AI');
  console.log('  AI 将生成对应的 Shopify Liquid Section');
  console.log('='.repeat(60));
}

// ── 主流程 ─────────────────────────────────────────────────────
function main() {
  console.log('🚀 Figma 导出解析器启动...');

  const files = scanTempDir();

  let htmlData = null;
  let cssData = null;

  // 找 HTML 文件
  const htmlFile = files.find(f => String(f).endsWith('.html'));
  if (htmlFile) {
    htmlData = parseHTML(String(htmlFile));
  } else {
    console.log('\n⚠️  未找到 HTML 文件，请将 Figma 导出的 HTML 放入 temp/ 目录');
  }

  // 找 CSS 文件
  const cssFile = files.find(f => String(f).endsWith('.css'));
  if (cssFile) {
    cssData = parseCSS(String(cssFile));
  } else {
    console.log('\n⚠️  未找到 CSS 文件，请将 Figma 导出的 CSS 放入 temp/ 目录');
  }

  // 生成摘要
  generateSummary(htmlData, cssData);
}

main();