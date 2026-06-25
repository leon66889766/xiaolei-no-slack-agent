'use client';

import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Category, ResourceType, ResourceQuery } from '@/lib/types';

interface SearchBarProps {
  query: ResourceQuery;
  categories: Category[];
  onSearch: (query: ResourceQuery) => void;
}

/** 资源类型筛选选项 */
const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: '全部类型' },
  { value: 'image', label: '图片' },
  { value: 'video', label: '视频' },
  { value: 'document', label: '文档' },
  { value: 'link', label: '链接' },
];

/**
 * 后台筛选栏
 * 关键词 / 类型 / 分类
 */
export function SearchBar({ query, categories, onSearch }: SearchBarProps) {
  const handleKeywordChange = (value: string) => {
    onSearch({ ...query, keyword: value || undefined });
  };

  const handleTypeChange = (value: string) => {
    onSearch({
      ...query,
      type: value === 'all' ? undefined : (value as ResourceType),
    });
  };

  const handleCategoryChange = (value: string) => {
    onSearch({
      ...query,
      categoryId: value === 'all' ? undefined : value,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 关键词搜索 */}
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="搜索资源标题或描述…"
          value={query.keyword || ''}
          onChange={(e) => handleKeywordChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* 类型筛选 */}
      <Select
        value={query.type || 'all'}
        onValueChange={handleTypeChange}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="类型" />
        </SelectTrigger>
        <SelectContent>
          {TYPE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 分类筛选 */}
      <Select
        value={query.categoryId || 'all'}
        onValueChange={handleCategoryChange}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="分类" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部分类</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
