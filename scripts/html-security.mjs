import assert from 'node:assert/strict';
import { htmlToHast } from 'satteri';

const blockedTags = new Set(['object', 'embed', 'base', 'form', 'frame', 'frameset', 'svg', 'math']);
const urlAttributes = new Set(['href', 'src', 'xlinkhref', 'poster', 'action', 'formaction']);

export function assertSafeHtml(html, file) {
  function check(node) {
    if (node.type === 'element') {
      const { tagName, properties = {} } = node;
      assert(!blockedTags.has(tagName), `Unsafe HTML element <${tagName}>: ${file}`);
      for (const [name, value] of Object.entries(properties)) {
        const attribute = name.toLowerCase();
        assert(!attribute.startsWith('on') && attribute !== 'srcdoc', `Unsafe HTML attribute ${name}: ${file}`);
        if (urlAttributes.has(attribute)) {
          assert(URL.canParse(String(value), 'https://site.invalid/'), `Invalid HTML URL in ${name}: ${file}`);
          const protocol = new URL(String(value), 'https://site.invalid/').protocol;
          assert(['http:', 'https:'].includes(protocol) || (attribute === 'href' && ['mailto:', 'tel:'].includes(protocol)), `Unsafe HTML URL scheme in ${name}: ${file}`);
        }
      }
      assert(tagName !== 'meta' || String(properties.httpEquiv ?? '').trim().toLowerCase() !== 'refresh', `Unsafe HTML refresh: ${file}`);
      if (tagName === 'iframe') {
        assert(/^https:\/\/player\.vimeo\.com\/video\/\d+\?dnt=1$/.test(properties.src ?? ''), `Unexpected iframe source: ${file}`);
      }
    }
    node.children?.forEach(check);
    if (node.content) check(node.content);
  }
  check(htmlToHast(html));
}
