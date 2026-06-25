/**
 * 中英文分词工具
 * 中文走字符 bigram 切分，英文/数字按词切分（小写化）
 */

/**
 * 对文本进行分词
 * - 中文：字符 bigram（二元）切分，如"科技感" → ["科技", "技感"]
 * - 英文/数字：按非字母数字字符切分，小写化，如 "Hello World" → ["hello", "world"]
 * - 单字符中文也作为 token 保留（增强召回）
 *
 * @param text 待分分的文本
 * @returns token 数组
 */
export function tokenize(text: string): string[] {
  if (!text || typeof text !== 'string') return [];

  const tokens: string[] = [];
  // 将文本按中文字符段和非中文字符段分离
  // 中文字符范围：\u4e00-\u9fff（基本汉字）、\u3400-\u4dbf（扩展A）、\uf900-\ufaff（兼容汉字）
  const segments = text.split(/([\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]+)/);

  for (const segment of segments) {
    if (!segment) continue;

    // 判断是否为中文字符段
    if (/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(segment)) {
      // 中文段：bigram 切分 + 单字
      const chars = segment.split('');
      // 单字 token（增强召回）
      for (const ch of chars) {
        if (ch.trim()) tokens.push(ch);
      }
      // bigram token
      for (let i = 0; i < chars.length - 1; i++) {
        const bigram = chars[i] + chars[i + 1];
        tokens.push(bigram);
      }
    } else {
      // 非中文段：按非字母数字字符切分
      const words = segment
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length > 0);
      tokens.push(...words);
    }
  }

  return tokens;
}

/**
 * 对文本进行分词并返回 token 频率表
 * @param text 待分词的文本
 * @returns Map<token, frequency>
 */
export function tokenizeWithFreq(text: string): Map<string, number> {
  const tokens = tokenize(text);
  const freq = new Map<string, number>();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) || 0) + 1);
  }
  return freq;
}
