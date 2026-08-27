import { useMemo } from 'react';

/**
 * 轻量 Markdown 渲染器（仅支持本项目用到的子集：标题、段落、列表、加粗、链接）。
 * 安全说明：内容来自可信后端 site_configs / news.content，渲染前先做 HTML 转义消毒，
 * 因此即使正文混入原始 HTML 也不会被执行。
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inline(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
}

export function renderMarkdown(md: string): string {
  const lines = escapeHtml(md ?? '').split('\n');
  let html = '';
  let inList = false;
  let para: string[] = [];

  const closeList = () => {
    if (inList) {
      html += '</ul>';
      inList = false;
    }
  };
  const flushPara = () => {
    if (para.length) {
      html += `<p>${inline(para.join(' '))}</p>`;
      para = [];
    }
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (/^###\s+/.test(line)) {
      flushPara();
      closeList();
      html += `<h3>${inline(line.replace(/^###\s+/, ''))}</h3>`;
    } else if (/^##\s+/.test(line)) {
      flushPara();
      closeList();
      html += `<h2>${inline(line.replace(/^##\s+/, ''))}</h2>`;
    } else if (/^#\s+/.test(line)) {
      flushPara();
      closeList();
      html += `<h1>${inline(line.replace(/^#\s+/, ''))}</h1>`;
    } else if (/^[-*]\s+/.test(line)) {
      flushPara();
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += `<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`;
    } else if (line === '') {
      flushPara();
      closeList();
    } else {
      if (inList) closeList();
      para.push(line);
    }
  }
  flushPara();
  closeList();
  return html;
}

export default function Markdown({
  content,
  className = '',
}: {
  content: string;
  className?: string;
}) {
  const html = useMemo(() => renderMarkdown(content), [content]);
  return (
    <div
      className={`prose ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
