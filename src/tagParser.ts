/**
 * JSX/TSX/HTML 标签解析器
 */

export interface TagInfo {
  tagName: string;
  startPos: number;
  endPos: number;
  fullMatch: string;
  hasTestId: boolean;
  testIdValue?: string;
}

/**
 * 生成 testid 值
 */
export function generateTestId(tagName: string, defaultTestId: string): string {
  // 将标签名转换为小写，并用连字符连接
  const normalizedTag = tagName.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase();
  return `${normalizedTag}-${defaultTestId}`;
}

/**
 * 解析选中文本或整个文档中的标签
 */
export function parseTags(text: string, config: { attributeKeyword: string; ignoreElements: string[]; onlyElements?: string[]; defaultTestId: string }): TagInfo[] {
  const tags: TagInfo[] = [];
  
  // 匹配 JSX/TSX 标签：<TagName ...> 或 <tagName ...>
  // 也匹配自闭合标签：<TagName ... />
  // 支持组件名（大写开头）和 HTML 标签（小写）
  const tagRegex = /<([A-Z][a-zA-Z0-9]*|[a-z][a-zA-Z0-9]*)\s*([^>]*?)(\/?)>/g;
  
  let match;
  while ((match = tagRegex.exec(text)) !== null) {
    const tagName = match[1];
    const attributes = match[2];
    const isSelfClosing = match[3] === '/';
    const fullMatch = match[0];
    const startPos = match.index;
    const endPos = startPos + fullMatch.length;
    
    // 检查是否已有 testid 属性
    const testIdRegex = new RegExp(`${config.attributeKeyword}\\s*=\\s*["']([^"']+)["']`, 'i');
    const testIdMatch = attributes.match(testIdRegex);
    const hasTestId = !!testIdMatch;
    const testIdValue = testIdMatch ? testIdMatch[1] : undefined;
    
    tags.push({
      tagName,
      startPos,
      endPos,
      fullMatch,
      hasTestId,
      testIdValue,
    });
  }
  
  return tags;
}

/**
 * 为标签添加或更新 testid 属性
 */
function ensureUniqueTestId(baseTestId: string, existingCounts: Map<string, number>): string {
  let candidate = baseTestId;
  let index = 1;
  while ((existingCounts.get(candidate) ?? 0) > 0) {
    candidate = `${baseTestId}-${index}`;
    index += 1;
  }
  existingCounts.set(candidate, (existingCounts.get(candidate) ?? 0) + 1);
  return candidate;
}

/**
 * 为标签添加或更新 testid 属性（确保唯一）
 */
export function addTestIdToTag(
  tagInfo: TagInfo,
  config: { attributeKeyword: string; defaultTestId: string },
  existingCounts: Map<string, number>
): string {
  const { fullMatch, tagName, hasTestId, testIdValue } = tagInfo;
  const baseTestId = testIdValue && testIdValue.trim().length > 0
    ? testIdValue
    : generateTestId(tagName, config.defaultTestId);
  const uniqueTestId = ensureUniqueTestId(baseTestId, existingCounts);
  const testIdAttr = `${config.attributeKeyword}="${uniqueTestId}"`;
  
  if (hasTestId) {
    // 更新现有的 testid
    const testIdRegex = new RegExp(`${config.attributeKeyword}\\s*=\\s*["'][^"']+["']`, 'i');
    return fullMatch.replace(testIdRegex, testIdAttr);
  }

  // 添加新的 testid
  // 匹配标签结构：<tagName attributes />
  const tagMatch = fullMatch.match(/^<([a-zA-Z][a-zA-Z0-9]*)(\s*)([^>]*?)(\s*)(\/?)>$/);
  
  if (tagMatch) {
    const [, matchedTagName, spaceAfterTag, attributes, spaceBeforeClose, selfClose] = tagMatch;
    
    // 如果标签有属性，在属性前添加 testid（用空格分隔）
    if (attributes.trim()) {
      return `<${matchedTagName}${spaceAfterTag}${testIdAttr} ${attributes.trim()}${spaceBeforeClose}${selfClose}>`;
    } else {
      // 如果标签没有属性，直接在标签名后添加 testid
      return `<${matchedTagName} ${testIdAttr}${spaceBeforeClose}${selfClose}>`;
    }
  }
  
  return fullMatch;
}


