import { ContentConfig, FinalContent, GeneratedImage } from '../types';

/**
 * Assembles the pipeline's output into one self-contained HTML document.
 *
 * Generated images arrive as data: URIs, so the file needs no companion
 * assets -- it can be mailed, dropped in a folder or opened offline and
 * still look the same.
 */

const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

/** Inline markdown: **bold**, *italic*, `code`, [text](href). */
const formatInline = (text: string): string => {
    let out = escapeHtml(text);
    out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    // Only http(s) and mailto links survive, so a model-authored href cannot
    // smuggle in javascript:.
    out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|mailto:[^)\s]+)\)/g,
        '<a href="$2" rel="noreferrer noopener">$1</a>');
    return out;
};

/** Block-level markdown, matching what the in-app viewer renders. */
const blocksToHtml = (markdown: string): string[] => {
    const html: string[] = [];
    // Normalise line endings first: blocks are split on a blank line, so
    // CRLF input would collapse the whole article into a single block.
    const parts = markdown.replace(/\r\n?/g, '\n')
        .split(/(```(?:[\w-]*)\s*[\s\S]*?```)/g);

    for (const part of parts) {
        const code = part.match(/^```([\w-]*)\s*([\s\S]*?)```$/);
        if (code) {
            html.push(`<pre><code>${escapeHtml(code[2].trim())}</code></pre>`);
            continue;
        }
        if (!part.trim()) continue;

        for (const block of part.split('\n\n')) {
            const t = block.trim();
            if (!t) continue;

            if (t.startsWith('### ')) { html.push(`<h3>${formatInline(t.slice(4))}</h3>`); continue; }
            if (t.startsWith('## '))  { html.push(`<h2>${formatInline(t.slice(3))}</h2>`); continue; }
            if (t.startsWith('# '))   { html.push(`<h1>${formatInline(t.slice(2))}</h1>`); continue; }

            if (t.startsWith('> ')) {
                html.push(`<blockquote>${formatInline(t.replace(/^> /gm, ''))}</blockquote>`);
                continue;
            }
            if (/^[-*] /.test(t)) {
                const items = t.split('\n')
                    .map(l => l.replace(/^[-*]\s*/, ''))
                    .filter(Boolean)
                    .map(l => `<li>${formatInline(l)}</li>`).join('');
                html.push(`<ul>${items}</ul>`);
                continue;
            }
            if (/^\d+\./.test(t)) {
                const items = t.split('\n')
                    .map(l => l.replace(/^\d+\.\s*/, ''))
                    .filter(Boolean)
                    .map(l => `<li>${formatInline(l)}</li>`).join('');
                html.push(`<ol>${items}</ol>`);
                continue;
            }
            html.push(`<p>${formatInline(t)}</p>`);
        }
    }
    return html;
};

const figure = (img: GeneratedImage, hero = false) =>
    `<figure${hero ? ' class="hero"' : ''}>` +
    `<img src="${img.url}" alt="${escapeHtml(img.prompt)}" loading="lazy">` +
    `<figcaption>${escapeHtml(img.prompt)}</figcaption>` +
    `</figure>`;

/**
 * Places images through the article rather than piling them at the end: the
 * first runs as a hero under the title, and the rest are spread over the
 * section headings so each one sits with the text it illustrates.
 */
const interleave = (blocks: string[], images: GeneratedImage[]): string[] => {
    if (images.length === 0) return blocks;

    const out: string[] = [];
    const [hero, ...rest] = images;
    let heroPlaced = false;

    const headingIdx = blocks
        .map((b, i) => (b.startsWith('<h2') ? i : -1))
        .filter(i => i >= 0);

    // Spread the remaining images evenly over the available headings. Placing
    // them at (n+1)/(count+1) of the way through keeps the first one clear of
    // the hero instead of stacking two images in the opening screen.
    const targets = new Map<number, GeneratedImage>();
    if (rest.length > 0 && headingIdx.length > 0) {
        rest.forEach((img, n) => {
            const slot = Math.floor(((n + 1) * headingIdx.length) / (rest.length + 1));
            const at = headingIdx[Math.min(slot, headingIdx.length - 1)];
            if (!targets.has(at)) targets.set(at, img);
        });
    }

    blocks.forEach((block, i) => {
        if (targets.has(i)) out.push(figure(targets.get(i)!));
        out.push(block);
        if (!heroPlaced && block.startsWith('<h1')) {
            out.push(figure(hero, true));
            heroPlaced = true;
        }
    });

    // No H1 in the markdown, so the hero has nowhere to anchor: lead with it.
    if (!heroPlaced) out.unshift(figure(hero, true));

    // Anything that found no heading still belongs in the document.
    const placed = new Set(targets.values());
    const leftover = rest.filter(img => !placed.has(img));
    leftover.forEach(img => out.push(figure(img)));

    return out;
};

export const buildDocumentHtml = (
    config: ContentConfig,
    final: FinalContent,
    images: GeneratedImage[],
): string => {
    const body = interleave(blocksToHtml(final.full_markdown), images).join('\n');
    const tags = final.tags?.length
        ? `<ul class="tags">${final.tags.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`
        : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(final.title)}</title>
<meta name="description" content="${escapeHtml(final.meta_description ?? '')}">
<style>
  :root {
    --bench: #e9e7e0;
    --sheet: #f8f7f4;
    --ink: #1e2420;
    --ink-soft: #6a706a;
    --rule: #d2cfc6;
    --signal: #1b3fd8;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 2rem 1rem;
    background: var(--bench);
    color: var(--ink);
    font: 16px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  }
  .doc {
    max-width: 44rem;
    margin: 0 auto;
    background: var(--sheet);
    border: 1px solid var(--rule);
    border-radius: 4px;
    padding: 3rem;
  }
  .meta { color: var(--ink-soft); font-size: .8125rem; margin-bottom: 2rem; }
  h1 { font-size: 2.125rem; line-height: 1.15; letter-spacing: -.021em; margin: 0 0 .5rem; }
  h2 { font-size: 1.375rem; letter-spacing: -.017em; margin: 2.5rem 0 .75rem; }
  h3 { font-size: 1.0625rem; margin: 1.75rem 0 .5rem; }
  p { margin: 0 0 1rem; }
  ul, ol { margin: 0 0 1rem; padding-left: 1.25rem; }
  li + li { margin-top: .25rem; }
  a { color: var(--signal); }
  blockquote {
    margin: 1.5rem 0; padding: .25rem 0 .25rem 1rem;
    border-left: 2px solid var(--rule); color: var(--ink-soft); font-style: italic;
  }
  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: .9em; background: var(--bench); padding: .1em .3em; border-radius: 3px;
  }
  pre {
    background: var(--bench); border: 1px solid var(--rule); border-radius: 4px;
    padding: 1rem; overflow-x: auto;
  }
  pre code { background: none; padding: 0; }
  figure { margin: 2rem 0; }
  figure.hero { margin: 1.5rem 0 2.5rem; }
  img { width: 100%; height: auto; display: block; border-radius: 4px; border: 1px solid var(--rule); }
  figcaption { color: var(--ink-soft); font-size: .75rem; margin-top: .5rem; }
  .tags { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: .5rem; }
  .tags li {
    font-size: .75rem; color: var(--ink-soft);
    border: 1px solid var(--rule); border-radius: 99px; padding: .125rem .5rem;
  }
  footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--rule);
           color: var(--ink-soft); font-size: .75rem; }
  @media (max-width: 640px) { .doc { padding: 1.5rem; } h1 { font-size: 1.625rem; } }
  @media print {
    body { background: #fff; padding: 0; }
    .doc { border: 0; padding: 0; max-width: none; }
    figure, pre, blockquote { break-inside: avoid; }
  }
</style>
</head>
<body>
<article class="doc">
  <div class="meta">${escapeHtml(config.targetAudience)} &middot; ${escapeHtml(String(config.tone))}</div>
  ${body}
  ${tags ? `<footer>${tags}</footer>` : ''}
</article>
</body>
</html>`;
};

export const documentFilename = (title: string) =>
    (title || 'document')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) + '.html';

export const downloadDocument = (html: string, filename: string) => {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
