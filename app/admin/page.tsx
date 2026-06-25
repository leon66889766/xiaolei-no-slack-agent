'use client';

import { useState, useEffect, useCallback } from 'react';
import { UploadCloud, Link as LinkIcon, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/admin/SearchBar';
import { ResourceGrid } from '@/components/admin/ResourceGrid';
import { UploadDialog } from '@/components/admin/UploadDialog';
import { AddLinkDialog } from '@/components/admin/AddLinkDialog';
import { useAdminResources } from '@/hooks/useAdminResources';
import { getAdminCategories } from '@/lib/api/admin';
import type { Category, ResourceQuery } from '@/lib/types';

/**
 * 后台资源管理主页
 */
export default function AdminHomePage() {
  const {
    resources,
    isLoading,
    page,
    totalPages,
    query,
    search,
    changePage,
    remove,
    refresh,
  } = useAdminResources();

  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const data = await getAdminCategories();
      setCategories(data);
    } catch (err) {
      console.error('加载分类失败:', err);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleSearch = (newQuery: ResourceQuery) => {
    search(newQuery);
  };

  const handleUploadSuccess = () => {
    refresh();
    loadCategories();
  };

  return (
    <div className="space-y-4">
      {/* 顶部操作栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-bold">资源管理</h1>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setLinkOpen(true)}>
            <LinkIcon className="mr-1.5 h-4 w-4" />
            添加链接
          </Button>
          <Button variant="gradient" size="sm" onClick={() => setUploadOpen(true)}>
            <UploadCloud className="mr-1.5 h-4 w-4" />
            上传资源
          </Button>
        </div>
      </div>

      {/* 筛选栏 */}
      <SearchBar query={query} categories={categories} onSearch={handleSearch} />

      {/* 资源网格 */}
      <ResourceGrid
        resources={resources}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={changePage}
        onRefresh={refresh}
        onDelete={remove}
      />

      {/* 弹窗 */}
      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        categories={categories}
        onSuccess={handleUploadSuccess}
      />
      <AddLinkDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        categories={categories}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}
