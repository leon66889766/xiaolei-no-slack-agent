import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// 测试数据使用唯一后缀，便于识别与清理
const SUFFIX = `测试-${Date.now()}`;
const CATEGORY_NAME = `中文分类-${SUFFIX}`;
const CATEGORY_DESC = `分类描述：这是一个用于回归测试的中文分类，验证编码是否正常的符号：中文测试`;
const TAG_NAME = `中文标签-${SUFFIX}`;
const RESOURCE_TITLE_IMG = `中文图片资源-${SUFFIX}`;
const RESOURCE_DESC_IMG = `图片描述：科技蓝紫渐变背景，包含中文符号「测试」`;
const RESOURCE_TAGS_IMG = ['科技', '背景', '蓝色', '测试'];
const RESOURCE_TITLE_LINK = `中文链接资源-${SUFFIX}`;
const RESOURCE_DESC_LINK = `链接描述：项目文档入口，中文关键词测试`;
const RESOURCE_TAGS_LINK = ['文档', '项目', '测试'];
const CHAT_KEYWORD = RESOURCE_TITLE_IMG.slice(0, 8);

const results = [];
let cookie = null;
let categoryId = null;
let tagId = null;
let uploadedResourceId = null;
let linkResourceId = null;
let chatResourceFound = false;

function assert(condition, name, detail = '') {
  if (condition) {
    results.push({ name, status: 'PASS', detail });
    console.log(`  ✅ PASS: ${name}`);
  } else {
    results.push({ name, status: 'FAIL', detail });
    console.error(`  ❌ FAIL: ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = { _raw: text, _parseError: e.message };
  }
  return { res, data };
}

async function runTests() {
  console.log('\n========================================');
  console.log('  回归测试：登录与会话 + 中文乱码');
  console.log(`  目标服务: ${BASE}`);
  console.log(`  测试后缀: ${SUFFIX}`);
  console.log('========================================\n');

  // ---------- 1. 登录与会话 ----------
  console.log('【1. 登录与会话】');

  // 1.1 未登录访问 /api/admin/resources 应返回 401
  {
    const { res, data } = await fetchJson(`${BASE}/api/admin/resources`);
    assert(res.status === 401, '未登录访问 /api/admin/resources 返回 401',
      `状态码=${res.status}, code=${data?.code}`);
  }

  // 1.2 登录接口使用 admin/admin123
  {
    const { res, data } = await fetchJson(`${BASE}/api/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }),
    });
    cookie = res.headers.get('set-cookie');
    assert(res.status === 200 && data?.code === 0 && data?.data?.username === ADMIN_USERNAME,
      '管理员登录成功并返回会话信息',
      `状态码=${res.status}, code=${data?.code}, message=${data?.message}, set-cookie=${cookie ? '存在' : '缺失'}`);
  }

  // 1.3 携带 Cookie 访问 /api/auth/me 验证会话保持
  {
    const { res, data } = await fetchJson(`${BASE}/api/auth/me`, {
      credentials: 'include',
      headers: cookie ? { Cookie: cookie } : {},
    });
    assert(res.status === 200 && data?.code === 0 && data?.data?.role === 'admin',
      '刷新 /api/auth/me 仍保持登录状态',
      `状态码=${res.status}, code=${data?.code}, data=${JSON.stringify(data?.data)}`);
  }

  // 1.4 登录后访问 /api/admin/resources 应返回 200
  {
    const { res, data } = await fetchJson(`${BASE}/api/admin/resources`, {
      credentials: 'include',
      headers: cookie ? { Cookie: cookie } : {},
    });
    assert(res.status === 200 && data?.code === 0 && Array.isArray(data?.data?.items),
      '登录后访问 /api/admin/resources 成功',
      `状态码=${res.status}, code=${data?.code}`);
  }

  // 1.5 登录页可访问
  {
    const res = await fetch(`${BASE}/admin/login`);
    const text = await res.text();
    assert(res.status === 200 && text.includes('admin'),
      '后台登录页 /admin/login 可正常访问',
      `状态码=${res.status}, length=${text.length}`);
  }

  // 1.6 未登录访问 /admin 被重定向到 /admin/login
  {
    const res = await fetch(`${BASE}/admin`, { redirect: 'manual' });
    const location = res.headers.get('location') || '';
    assert(res.status >= 300 && res.status < 400 && location.includes('/admin/login'),
      '未登录访问 /admin 重定向到 /admin/login',
      `状态码=${res.status}, location=${location}`);
  }

  // 1.7 登录后 /admin 可访问（模拟浏览器携带 Cookie）
  {
    const res = await fetch(`${BASE}/admin`, {
      credentials: 'include',
      headers: cookie ? { Cookie: cookie } : {},
      redirect: 'manual',
    });
    assert(res.status === 200,
      '登录后访问 /admin 不再重定向',
      `状态码=${res.status}`);
  }

  // ---------- 2. 中文乱码：分类 / 标签 / 资源 ----------
  console.log('\n【2. 中文分类、标签、资源创建与读取】');

  // 2.1 创建中文分类
  {
    const { res, data } = await fetchJson(`${BASE}/api/admin/categories`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
      body: JSON.stringify({ name: CATEGORY_NAME, description: CATEGORY_DESC }),
    });
    categoryId = data?.data?.id;
    assert(res.status === 201 && data?.code === 0 && data?.data?.name === CATEGORY_NAME,
      '创建中文分类成功且名称无乱码',
      `状态码=${res.status}, code=${data?.code}, message=${data?.message}, data=${JSON.stringify(data?.data)}`);
  }

  // 2.2 创建中文标签
  {
    const { res, data } = await fetchJson(`${BASE}/api/admin/tags`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
      body: JSON.stringify({ name: TAG_NAME }),
    });
    tagId = data?.data?.id;
    assert(res.status === 201 && data?.code === 0 && data?.data?.name === TAG_NAME,
      '创建中文标签成功且名称无乱码',
      `状态码=${res.status}, code=${data?.code}, message=${data?.message}, data=${JSON.stringify(data?.data)}`);
  }

  // 2.3 上传带中文标题/描述/标签的图片资源
  {
    const buf = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const blob = new Blob([buf], { type: 'image/png' });
    const form = new FormData();
    form.append('file', blob, 'test.png');
    form.append('title', RESOURCE_TITLE_IMG);
    form.append('description', RESOURCE_DESC_IMG);
    form.append('categoryId', categoryId || '');
    form.append('tags', JSON.stringify(RESOURCE_TAGS_IMG));

    const { res, data } = await fetchJson(`${BASE}/api/admin/resources`, {
      method: 'POST',
      credentials: 'include',
      headers: cookie ? { Cookie: cookie } : {},
      body: form,
    });
    uploadedResourceId = data?.data?.id;
    const tagsMatch = data?.data?.tags &&
      RESOURCE_TAGS_IMG.every(t => data.data.tags.some(rt => rt.name === t));
    assert(res.status === 201 && data?.code === 0 &&
      data?.data?.title === RESOURCE_TITLE_IMG &&
      data?.data?.description === RESOURCE_DESC_IMG &&
      data?.data?.category?.name === CATEGORY_NAME &&
      tagsMatch,
      '上传中文图片资源成功，标题/描述/分类/标签均无乱码',
      `状态码=${res.status}, code=${data?.code}, message=${data?.message}, data=${JSON.stringify(data?.data)}`);
  }

  // 2.4 添加带中文标题/描述/标签的外部链接资源
  {
    const { res, data } = await fetchJson(`${BASE}/api/admin/resources`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
      body: JSON.stringify({
        url: 'https://example.com/中文测试',
        title: RESOURCE_TITLE_LINK,
        description: RESOURCE_DESC_LINK,
        categoryId,
        tags: RESOURCE_TAGS_LINK,
      }),
    });
    linkResourceId = data?.data?.id;
    const tagsMatch = data?.data?.tags &&
      RESOURCE_TAGS_LINK.every(t => data.data.tags.some(rt => rt.name === t));
    assert(res.status === 201 && data?.code === 0 &&
      data?.data?.title === RESOURCE_TITLE_LINK &&
      data?.data?.description === RESOURCE_DESC_LINK &&
      data?.data?.category?.name === CATEGORY_NAME &&
      tagsMatch,
      '添加中文外部链接资源成功，标题/描述/分类/标签均无乱码',
      `状态码=${res.status}, code=${data?.code}, message=${data?.message}, data=${JSON.stringify(data?.data)}`);
  }

  // 2.5 后台资源列表中文显示正常
  {
    const { res, data } = await fetchJson(`${BASE}/api/admin/resources?keyword=${encodeURIComponent(SUFFIX)}`, {
      credentials: 'include',
      headers: cookie ? { Cookie: cookie } : {},
    });
    const items = data?.data?.items || [];
    const imgOk = items.some(r => r.title === RESOURCE_TITLE_IMG && r.description === RESOURCE_DESC_IMG);
    const linkOk = items.some(r => r.title === RESOURCE_TITLE_LINK && r.description === RESOURCE_DESC_LINK);
    assert(res.status === 200 && data?.code === 0 && items.length >= 2 && imgOk && linkOk,
      '后台资源列表返回中文资源且无乱码',
      `状态码=${res.status}, code=${data?.code}, items.length=${items.length}, imgOk=${imgOk}, linkOk=${linkOk}`);
  }

  // 2.6 公共 /api/resources 中文正常
  {
    const { res, data } = await fetchJson(`${BASE}/api/resources?keyword=${encodeURIComponent(SUFFIX)}`);
    const items = data?.data?.items || [];
    const imgOk = items.some(r => r.title === RESOURCE_TITLE_IMG);
    assert(res.status === 200 && data?.code === 0 && items.length >= 2 && imgOk,
      '公共 /api/resources 返回中文资源且无乱码',
      `状态码=${res.status}, code=${data?.code}, items.length=${items.length}`);
  }

  // 2.7 公共 /api/categories 中文正常
  {
    const { res, data } = await fetchJson(`${BASE}/api/categories`);
    const found = (data?.data || []).some(c => c.name === CATEGORY_NAME && c.description === CATEGORY_DESC);
    assert(res.status === 200 && data?.code === 0 && found,
      '公共 /api/categories 返回中文分类且无乱码',
      `状态码=${res.status}, code=${data?.code}, found=${found}`);
  }

  // 2.8 公共 /api/tags 中文正常
  {
    const { res, data } = await fetchJson(`${BASE}/api/tags`);
    const found = (data?.data || []).some(t => t.name === TAG_NAME);
    assert(res.status === 200 && data?.code === 0 && found,
      '公共 /api/tags 返回中文标签且无乱码',
      `状态码=${res.status}, code=${data?.code}, found=${found}`);
  }

  // ---------- 3. 前台对话检索 ----------
  console.log('\n【3. 前台对话检索】');

  {
    const { res, data } = await fetchJson(`${BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: CHAT_KEYWORD }),
    });
    const resources = data?.data?.resources || [];
    chatResourceFound = resources.some(r => r.title === RESOURCE_TITLE_IMG);
    assert(res.status === 200 && data?.code === 0 && chatResourceFound,
      '前台对话输入中文关键词能检索到中文资源',
      `状态码=${res.status}, code=${data?.code}, resources.length=${resources.length}, found=${chatResourceFound}, reply=${data?.data?.reply}`);
  }

  // ---------- 4. 核心功能回归：删除 ----------
  console.log('\n【4. 核心功能回归：删除】');

  // 4.1 删除图片资源
  {
    const { res, data } = await fetchJson(`${BASE}/api/admin/resources/${uploadedResourceId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: cookie ? { Cookie: cookie } : {},
    });
    assert(res.status === 200 && data?.code === 0,
      '删除图片资源成功',
      `状态码=${res.status}, code=${data?.code}, message=${data?.message}`);
  }

  // 4.2 删除链接资源
  {
    const { res, data } = await fetchJson(`${BASE}/api/admin/resources/${linkResourceId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: cookie ? { Cookie: cookie } : {},
    });
    assert(res.status === 200 && data?.code === 0,
      '删除链接资源成功',
      `状态码=${res.status}, code=${data?.code}, message=${data?.message}`);
  }

  // 4.3 删除分类
  {
    const { res, data } = await fetchJson(`${BASE}/api/admin/categories/${categoryId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: cookie ? { Cookie: cookie } : {},
    });
    assert(res.status === 200 && data?.code === 0,
      '删除中文分类成功',
      `状态码=${res.status}, code=${data?.code}, message=${data?.message}`);
  }

  // 4.4 删除标签
  {
    const { res, data } = await fetchJson(`${BASE}/api/admin/tags/${tagId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: cookie ? { Cookie: cookie } : {},
    });
    assert(res.status === 200 && data?.code === 0,
      '删除中文标签成功',
      `状态码=${res.status}, code=${data?.code}, message=${data?.message}`);
  }

  // ---------- 5. 登出与会话失效 ----------
  console.log('\n【5. 登出与会话失效】');

  {
    const { res, data } = await fetchJson(`${BASE}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: cookie ? { Cookie: cookie } : {},
    });
    assert(res.status === 200 && data?.code === 0,
      '调用 /api/auth/logout 登出成功',
      `状态码=${res.status}, code=${data?.code}, message=${data?.message}`);
    // 清除本地保存的 cookie，模拟浏览器不再发送旧 token
    cookie = null;
  }

  {
    const { res, data } = await fetchJson(`${BASE}/api/admin/resources`);
    assert(res.status === 401,
      '登出后 /api/admin/resources 返回 401',
      `状态码=${res.status}, code=${data?.code}`);
  }

  // ---------- 报告 ----------
  console.log('\n========================================');
  console.log('  测试报告');
  console.log('========================================');
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`总计: ${results.length} | 通过: ${passed} | 失败: ${failed}`);
  if (failed > 0) {
    console.log('\n失败用例：');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  - ${r.name}: ${r.detail}`);
    });
  }
  console.log('');
  return { passed, failed, total: results.length, results };
}

runTests().then(({ passed, failed }) => {
  process.exit(failed > 0 ? 1 : 0);
}).catch(err => {
  console.error('测试脚本异常:', err);
  process.exit(1);
});
