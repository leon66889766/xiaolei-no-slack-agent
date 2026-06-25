'use client';

import { useState, useRef } from 'react';
import { UploadCloud, X, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { uploadResource } from '@/lib/api/admin';
import { formatFileSize } from '@/lib/utils/format';
import type { Category } from '@/lib/types';
import { toast } from 'sonner';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onSuccess: () => void;
}

/**
 * 上传资源弹窗
 * 拖拽 + 点击选择文件 + 元信息表单
 */
export function UploadDialog({
  open,
  onOpenChange,
  categories,
  onSuccess,
}: UploadDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('none');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFiles([]);
    setTitle('');
    setDescription('');
    setCategoryId('none');
    setTags([]);
    setTagInput('');
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const fileArray = Array.from(selectedFiles);
    setFiles(fileArray);
    // 自动填充标题
    if (!title && fileArray.length > 0) {
      const name = fileArray[0].name;
      setTitle(name.replace(/\.[^.]+$/, ''));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('请选择要上传的文件');
      return;
    }
    if (!title.trim()) {
      toast.error('请输入资源标题');
      return;
    }

    setUploading(true);
    try {
      // 逐个上传
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileTitle = files.length > 1 ? `${title}_${i + 1}` : title;
        await uploadResource(
          file,
          fileTitle,
          description,
          categoryId === 'none' ? null : categoryId,
          tags
        );
      }

      toast.success(`成功上传 ${files.length} 个资源`);
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!uploading) { onOpenChange(v); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>上传资源</DialogTitle>
          <DialogDescription>
            支持图片、视频、文档，单文件最大 100MB
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 文件拖拽区 */}
          <div
            className={`
              flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6
              ${dragging ? 'border-primary bg-primary/5' : 'border-border'}
              ${files.length > 0 ? 'hidden' : 'cursor-pointer'}
            `}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <UploadCloud className="mb-2 h-10 w-10 text-muted-foreground/60" />
            <p className="text-sm font-medium">点击或拖拽文件到此处</p>
            <p className="mt-1 text-xs text-muted-foreground">
              支持图片/视频/文档格式
            </p>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          {/* 已选文件列表 */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">已选文件 ({files.length})</span>
                <Button variant="ghost" size="sm" onClick={() => setFiles([])}>
                  清空
                </Button>
              </div>
              <div className="max-h-32 space-y-1 overflow-auto">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-medium">{file.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatFileSize(file.size)} · {file.type || '未知类型'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 标题 */}
          <div className="space-y-1.5">
            <Label htmlFor="upload-title">资源标题</Label>
            <Input
              id="upload-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入资源标题"
            />
          </div>

          {/* 描述 */}
          <div className="space-y-1.5">
            <Label htmlFor="upload-desc">描述（可选）</Label>
            <Textarea
              id="upload-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简要描述资源内容"
              rows={2}
            />
          </div>

          {/* 分类 */}
          <div className="space-y-1.5">
            <Label>分类</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">不分类</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 标签 */}
          <div className="space-y-1.5">
            <Label>标签</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="输入标签后按 Enter"
              />
              <Button variant="outline" onClick={handleAddTag} type="button">
                添加
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            取消
          </Button>
          <Button onClick={handleUpload} disabled={uploading || files.length === 0}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                上传中…
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" />
                上传
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
