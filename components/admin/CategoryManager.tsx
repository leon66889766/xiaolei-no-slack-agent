'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, FolderTree, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  getAdminCategories,
  createCategory,
  deleteCategory,
} from '@/lib/api/admin';
import { formatDate } from '@/lib/utils/format';
import type { Category } from '@/lib/types';
import { toast } from 'sonner';

/**
 * 分类管理组件
 */
export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminCategories();
      setCategories(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '加载失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('分类名称不能为空');
      return;
    }
    setSubmitting(true);
    try {
      await createCategory({ name: name.trim(), description: description.trim() });
      toast.success('创建成功');
      setName('');
      setDescription('');
      setDialogOpen(false);
      loadCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`确定要删除分类「${category.name}」吗？关联资源将变为未分类。`)) return;
    try {
      await deleteCategory(category.id);
      toast.success('删除成功');
      loadCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除失败');
    }
  };

  return (
    <div className="space-y-4">
      {/* 顶部操作 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderTree className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">分类管理</h2>
          <Badge variant="secondary">{categories.length}</Badge>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          新建分类
        </Button>
      </div>

      {/* 分类列表 */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <FolderTree className="mb-2 h-10 w-10 opacity-40" />
          <p>暂无分类，点击「新建分类」创建</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-lg border bg-card p-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{category.name}</span>
                  <Badge variant="outline">{category.resourceCount} 资源</Badge>
                </div>
                {category.description && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {category.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground/60">
                  创建于 {formatDate(category.createdAt)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDelete(category)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* 新建对话框 */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!submitting) setDialogOpen(v); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>新建分类</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">分类名称</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="如：设计素材"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-desc">描述（可选）</Label>
              <Input
                id="cat-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="分类描述"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              取消
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  创建中…
                </>
              ) : (
                '创建'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
