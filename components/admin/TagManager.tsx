'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Tags, Loader2 } from 'lucide-react';
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
  getAdminTags,
  createTag,
  deleteTag,
} from '@/lib/api/admin';
import { formatDate } from '@/lib/utils/format';
import type { Tag } from '@/lib/types';
import { toast } from 'sonner';

/**
 * 标签管理组件
 */
export function TagManager() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTags = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminTags();
      setTags(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '加载失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('标签名称不能为空');
      return;
    }
    setSubmitting(true);
    try {
      await createTag({ name: name.trim() });
      toast.success('创建成功');
      setName('');
      setDialogOpen(false);
      loadTags();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (tag: Tag) => {
    if (!confirm(`确定要删除标签「${tag.name}」吗？`)) return;
    try {
      await deleteTag(tag.id);
      toast.success('删除成功');
      loadTags();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除失败');
    }
  };

  return (
    <div className="space-y-4">
      {/* 顶部操作 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tags className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">标签管理</h2>
          <Badge variant="secondary">{tags.length}</Badge>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          新建标签
        </Button>
      </div>

      {/* 标签列表 */}
      {isLoading ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      ) : tags.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Tags className="mb-2 h-10 w-10 opacity-40" />
          <p>暂无标签，点击「新建标签」创建</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="group flex items-center gap-1.5 rounded-full border bg-card py-1.5 pl-3 pr-1.5 text-sm"
            >
              <span className="font-medium">{tag.name}</span>
              <Badge variant="outline" className="text-[10px]">
                {tag.resourceCount}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => handleDelete(tag)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* 新建对话框 */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!submitting) setDialogOpen(v); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>新建标签</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="tag-name">标签名称</Label>
            <Input
              id="tag-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：科技感"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
              }}
            />
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
