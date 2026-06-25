import { NextRequest, NextResponse } from 'next/server';
import { resourceRepository } from '@/lib/repositories/resourceRepository';
import { fileService } from '@/lib/services/fileService';
import fs from 'fs';

/**
 * 文件下载 API
 * GET /api/resources/:id/download
 * 返回文件流，自增下载计数
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resource = resourceRepository.findById(params.id);

    if (!resource) {
      return NextResponse.json(
        { code: 404, data: null, message: '资源不存在' },
        { status: 404 }
      );
    }

    // 链接类型直接重定向
    if (resource.type === 'link') {
      return NextResponse.redirect(resource.fileUrl);
    }

    if (!resource.filePath) {
      return NextResponse.json(
        { code: 404, data: null, message: '文件路径不存在' },
        { status: 404 }
      );
    }

    // 获取文件绝对路径
    const absolutePath = fileService.getAbsolutePath(resource.filePath);

    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json(
        { code: 404, data: null, message: '文件不存在' },
        { status: 404 }
      );
    }

    // 读取文件
    const fileBuffer = fs.readFileSync(absolutePath);
    const fileName = resource.title + (resource.fileFormat ? '.' + resource.fileFormat : '');

    // 自增下载计数
    resourceRepository.incrementDownload(params.id);

    // 返回文件流
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('[Download API] Error:', error);
    return NextResponse.json(
      { code: 500, data: null, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
