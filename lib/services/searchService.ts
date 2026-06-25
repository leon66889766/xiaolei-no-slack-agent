import { resourceRepository } from '@/lib/repositories/resourceRepository';
import { tokenize, tokenizeWithFreq } from '@/lib/utils/tokenizer';
import type { Resource, SearchResult } from '@/lib/types';

/**
 * 文档向量：token → TF-IDF 权重
 */
type DocVector = Map<string, number>;

interface IndexedDoc {
  resourceId: string;
  vector: DocVector;
  norm: number;
  resource: Resource;
  tagNames: string[];
  titleLower: string;
}

/**
 * 自研 TF-IDF + 余弦相似度检索引擎
 *
 * 特性：
 * - 中文字符 bigram 分词 + 英文按词切分
 * - TF-IDF 权重 + 余弦相似度计算
 * - 标签精确匹配加权
 * - 标题精确包含加分
 * - 内存缓存，写操作后 invalidate
 */
class SearchService {
  private index: Map<string, IndexedDoc> = new Map();
  private idf: Map<string, number> = new Map();
  private dirty: boolean = true;
  private readonly SCORE_THRESHOLD = 0.05;
  private readonly TAG_BOOST = 0.5;
  private readonly TITLE_BOOST = 0.3;

  /**
   * 搜索资源
   * @param query 用户查询文本
   * @param limit 返回上限，默认 10
   * @returns 按相关度排序的搜索结果
   */
  search(query: string, limit: number = 10): SearchResult[] {
    if (!query || !query.trim()) return [];

    // 如果索引脏，重建
    if (this.dirty) {
      this.buildIndex();
    }

    // 无索引数据，返回空
    if (this.index.size === 0) return [];

    // 查询向量化
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) return [];

    const queryFreq = tokenizeWithFreq(query);
    const queryVector: DocVector = new Map();
    let queryNorm = 0;

    for (const [token, freq] of queryFreq) {
      const idf = this.idf.get(token) || 0;
      const tf = freq / queryTokens.length;
      const weight = tf * idf;
      if (weight > 0) {
        queryVector.set(token, weight);
        queryNorm += weight * weight;
      }
    }
    queryNorm = Math.sqrt(queryNorm);

    if (queryNorm === 0) return [];

    // 计算余弦相似度
    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();

    for (const doc of this.index.values()) {
      // 余弦相似度
      let dotProduct = 0;
      for (const [token, queryWeight] of queryVector) {
        const docWeight = doc.vector.get(token);
        if (docWeight) {
          dotProduct += queryWeight * docWeight;
        }
      }

      let score = doc.norm > 0 ? dotProduct / (queryNorm * doc.norm) : 0;

      // 标签精确匹配加权
      if (doc.tagNames.length > 0) {
        for (const tagName of doc.tagNames) {
          if (queryLower.includes(tagName.toLowerCase())) {
            score += this.TAG_BOOST;
          }
        }
      }

      // 标题精确包含加分
      if (doc.titleLower.includes(queryLower)) {
        score += this.TITLE_BOOST;
      }

      if (score >= this.SCORE_THRESHOLD) {
        results.push({ resource: doc.resource, score });
      }
    }

    // 按分数降序排序
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, limit);
  }

  /**
   * 构建索引
   * 遍历全量资源，计算 TF-IDF 向量
   */
  private buildIndex(): void {
    const resources = resourceRepository.findAllForIndex();
    const docCount = resources.length;

    // 第一遍：收集文档频率（DF）
    const df: Map<string, number> = new Map();

    const docTokens: Array<{
      resource: Resource;
      tokens: string[];
      tagNames: string[];
    }> = [];

    for (const resource of resources) {
      // 组合文本：标题 + 描述 + 标签名 + 分类名
      const tagText = resource.tags.map((t) => t.name).join(' ');
      const categoryText = resource.category?.name || '';
      const fullText = `${resource.title} ${resource.description} ${tagText} ${categoryText}`;
      const tokens = tokenize(fullText);

      docTokens.push({
        resource,
        tokens,
        tagNames: resource.tags.map((t) => t.name),
      });

      // 统计 DF（每个 token 在多少文档中出现）
      const uniqueTokens = new Set(tokens);
      for (const token of uniqueTokens) {
        df.set(token, (df.get(token) || 0) + 1);
      }
    }

    // 计算 IDF
    this.idf = new Map();
    for (const [token, freq] of df) {
      // IDF = log(N / df) + 1，加 1 避免 IDF 为 0
      const idf = Math.log((docCount + 1) / (freq + 1)) + 1;
      this.idf.set(token, idf);
    }

    // 第二遍：计算 TF-IDF 向量
    this.index = new Map();
    for (const { resource, tokens, tagNames } of docTokens) {
      const vector: DocVector = new Map();
      const tokenCount = tokens.length;

      // 计算 TF
      const tf: Map<string, number> = new Map();
      for (const token of tokens) {
        tf.set(token, (tf.get(token) || 0) + 1);
      }

      // 计算 TF-IDF
      let norm = 0;
      for (const [token, freq] of tf) {
        const tfVal = freq / tokenCount;
        const idfVal = this.idf.get(token) || 0;
        const weight = tfVal * idfVal;
        vector.set(token, weight);
        norm += weight * weight;
      }
      norm = Math.sqrt(norm);

      this.index.set(resource.id, {
        resourceId: resource.id,
        vector,
        norm,
        resource,
        tagNames,
        titleLower: resource.title.toLowerCase(),
      });
    }

    this.dirty = false;
  }

  /**
   * 标记索引为脏，下次搜索时重建
   */
  invalidate(): void {
    this.dirty = true;
  }

  /**
   * 获取索引文档数（用于调试）
   */
  get indexSize(): number {
    return this.index.size;
  }
}

/** 搜索服务单例（使用 globalThis 防 Next.js dev 模式热重载丢失实例） */
const globalForSearch = globalThis as unknown as { __searchService?: SearchService };

export const searchService =
  globalForSearch.__searchService ?? new SearchService();

if (process.env.NODE_ENV !== 'production') {
  globalForSearch.__searchService = searchService;
}
