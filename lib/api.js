/**
 * API 客户端
 * 统一封装对 Express 后端的请求
 * 所有请求均支持通过 provider 参数动态切换 AI 模型
 */

const BASE = '';

export async function fetchStatus(provider) {
  const params = provider ? `?provider=${encodeURIComponent(provider)}` : '';
  const res = await fetch(`${BASE}/api/status${params}`);
  if (!res.ok) throw new Error('无法连接服务');
  return res.json();
}

export async function fetchProviders() {
  const res = await fetch(`${BASE}/api/providers`);
  if (!res.ok) throw new Error('无法获取模型列表');
  return res.json();
}

export async function coachPhoto(file, provider) {
  const form = new FormData();
  form.append('image', file);
  if (provider) form.append('provider', provider);

  const res = await fetch(`${BASE}/api/coach`, { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || '分析失败');
  }
  return res.json();
}

export async function editPhoto(file, instruction, provider) {
  const form = new FormData();
  form.append('image', file);
  form.append('instruction', instruction);
  if (provider) form.append('provider', provider);

  const res = await fetch(`${BASE}/api/edit`, { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || '编辑失败');
  }
  return res.json();
}

export async function optimizePrompt(prompt, provider) {
  const res = await fetch(`${BASE}/api/optimize-prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, provider }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || '优化失败');
  }
  return res.json();
}
