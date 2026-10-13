import assert from 'node:assert/strict';
import { assertSafeHtml } from './html-security.mjs';

for (const html of [
  '<p onclick="window.audit=1">Text</p>',
  '<img src=x onerror=window.audit=1>',
  '<p ONCLICK=window.audit=1>Text</p>',
  '<a href="javascript:window.audit=1">Link</a>',
  '<a href=JaVaScRiPt:window.audit=1>Link</a>',
  '<a href="java&#x73;cript:window.audit=1">Link</a>',
  '<a href="java&#x09;script:window.audit=1">Link</a>',
  '<a href="java\nscript:window.audit=1">Link</a>',
  '<a href=" &#x0d;javascript:window.audit=1">Link</a>',
  '<a href="data:text/html,test">Link</a>',
  '<a href=DaTa:text/html,test>Link</a>',
  '<a href="d&#x61;ta:text/html,test">Link</a>',
  '<a href="da&#x09;ta:text/html,test">Link</a>',
  '<a href="da\nta:text/html,test">Link</a>',
  '<a href="vbscript:window.audit=1">Link</a>',
  '<a href="file:///private/test">Link</a>',
  '<img src="data:image/svg+xml,test">',
  '<iframe srcdoc="&lt;p&gt;Other page&lt;/p&gt;"></iframe>',
  '<object data="https://example.org"></object>',
  '<embed src="https://example.org">',
  '<base href="https://example.org">',
  '<form action="https://example.org"></form>',
  '<meta http-equiv="ReFrEsH" content="0;url=https://example.org">',
  '<meta http-equiv=REF&#x52;ESH content="0;url=https://example.org">',
  '<iframe src="https://example.org"></iframe>',
  '<iframe src="https://player.vimeo.com/video/123?dnt=0"></iframe>',
  '<iframe src="https://player.vimeo.com.evil.test/video/123?dnt=1"></iframe>',
  '<svg><a xlink:href="javascript:window.audit=1">Link</a></svg>',
  '<svg><a href="#"><animate attributeName="href" to="javascript:window.audit=1"></animate></a></svg>',
  '<math><mtext>Text</mtext></math>',
  '<template><img src=x onerror=window.audit=1></template>',
]) assert.throws(() => assertSafeHtml(html, 'unsafe fixture'), assert.AssertionError);

assert.doesNotThrow(() => assertSafeHtml(`<!doctype html><html lang="en"><head>
  <meta charset="UTF-8"><meta name="description" content="Ordinary text">
  <meta http-equiv="content-security-policy" content="default-src 'self'">
  <link rel="stylesheet" href="/_astro/site.css"><title>Writing</title>
</head><body><h1>Writing</h1><p>Ordinary &amp; escaped &lt;script&gt; text.</p>
  <a href="/writing/example/">Article</a><a href="#main">Jump</a>
  <a href="https://example.org/?a=1&amp;b=2">Publication</a>
  <a href="http://example.org/">Older publication</a>
  <a href="mailto:writer@example.org">Email</a><a href="tel:+441234567890">Phone</a>
  <img src="./photo.jpg" alt="Photo"><script type="module" src="/_astro/archive.js"></script>
  <iframe src="https://player.vimeo.com/video/123?dnt=1" title="Video"></iframe>
</body></html>`, 'safe fixture'));

console.log('HTML security regression checks passed.');
