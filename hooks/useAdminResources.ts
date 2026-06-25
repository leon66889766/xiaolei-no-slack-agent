'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getAdminResources,
  deleteResource,
} from '@/lib/api/admin';
import type { Resource, ResourceQuery } from '@/lib/types';

/**
 * 后台资源列表管理 Hook
 * - 分页查询
 * - 筛选（关键词/类型/分类/标签）
 * - 删除
 */
export function useAdminResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState<ResourceQuery>({});

  const totalPages = Math.ceil(total / limit) || 1;

  /**
   * 加载资源列表
   */
  const loadResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getAdminResources({
        ...query,
        page,
        limit,
      });
      setResources(result.items);
      setTotal(result.total);
    } catch (err) {
      console.error('加载资源失败:', err);
      setResources([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [query, page, limit]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  /**
   * 搜索（重置到第一页）
   */
  const search = useCallback((newQuery: ResourceQuery) => {
    setQuery(newQuery);
    setPage(1);
  }, []);

  /**
   * 翻页
   */
  const changePage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  /**
   * 删除资源
   */
  const remove = useCallback(async (id: string) => {
    await deleteResource(id);
    await loadResources();
  }, [loadResources]);

  /**
   * 刷新列表
   */
  const refresh = useCallback(() => {
    loadResources();
  }, [loadResources]);

  return {
    resources,
    total,
    page,
    limit,
    totalPages,
    isLoading,
    query,
    search,
    changePage,
    remove,
    refresh,
  };
}
