/** Render the common Markdown constructs used in assistant replies. Angular sanitizes the result at the [innerHTML] binding. */
export function renderMarkdown(markdown: string): string {
  const inline = (value: string): string => escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const output: string[] = [];
  let paragraph: string[] = [];
  let list: 'ul' | 'ol' | undefined;
  let code: string[] | undefined;

  const flushParagraph = () => {
    if (paragraph.length) output.push(`<p>${paragraph.map(inline).join('<br>')}</p>`);
    paragraph = [];
  };
  const closeList = () => {
    if (list) output.push(`</${list}>`);
    list = undefined;
  };

  for (const line of lines) {
    if (line.trimStart().startsWith('```')) {
      flushParagraph(); closeList();
      if (code) { output.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`); code = undefined; }
      else code = [];
      continue;
    }
    if (code) { code.push(line); continue; }
    if (!line.trim()) { flushParagraph(); closeList(); continue; }

    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph(); closeList();
      const level = heading[1].length;
      output.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }
    const item = /^\s*([-+*]|\d+[.)])\s+(.+)$/.exec(line);
    if (item) {
      flushParagraph();
      const nextList = /^\d/.test(item[1]) ? 'ol' : 'ul';
      if (list !== nextList) { closeList(); output.push(`<${nextList}>`); list = nextList; }
      output.push(`<li>${inline(item[2])}</li>`);
      continue;
    }
    const quote = /^>\s?(.*)$/.exec(line);
    if (quote) { flushParagraph(); closeList(); output.push(`<blockquote>${inline(quote[1])}</blockquote>`); continue; }
    if (/^\s*([-*_]\s*){3,}$/.test(line)) { flushParagraph(); closeList(); output.push('<hr>'); continue; }
    closeList(); paragraph.push(line);
  }

  if (code) output.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
  flushParagraph(); closeList();
  return output.join('');
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
