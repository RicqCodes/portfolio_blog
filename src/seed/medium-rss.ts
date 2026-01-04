import 'dotenv/config';
import * as https from 'node:https';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ContentBlockDto } from '../dto/content.dto';

type LocalSeedPost = {
  title: string;
  coverImage?: string;
  cover_image?: string;
  contentBlocks: ContentBlockDto[];
  keywords?: string[];
  tags?: { name: string }[];
  publishedAt: string;
};

const DEFAULT_FEED_URL = 'https://medium.com/feed/@ricqcodes';
const OUTPUT_PATH = resolve(__dirname, 'medium-posts.json');
const DEFAULT_AUTHOR = 'Princewill Nwakanma';
const DEFAULT_ALLOWED_URLS = new Set([
  'https://blog.stackademic.com/part-1-lifetimes-in-rust-0e4b2fba8bc0',
  'https://blog.stackademic.com/understanding-client-side-rendering-and-server-side-rendering-44fe6e3d2811',
]);

const fetchText = (url: string): Promise<string> =>
  new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });

const decodeHtmlEntities = (text: string): string =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");

const stripHtml = (html: string): string => {
  const withoutTags = html
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '');
  return decodeHtmlEntities(withoutTags).trim();
};

const extractImageUrl = (html: string): string => {
  const match = html.match(/<img[^>]+src="([^"]+)"/i);
  return match ? match[1] : '';
};

const extractAltText = (html: string): string => {
  const match = html.match(/<img[^>]+alt="([^"]*)"/i);
  return match ? decodeHtmlEntities(match[1]) : '';
};

const extractCode = (html: string): string => {
  const codeMatch = html.match(/<code[^>]*>([\s\S]*?)<\/code>/i);
  if (!codeMatch) return '';
  return decodeHtmlEntities(codeMatch[1]).trim();
};

const extractListItems = (html: string): string[] => {
  const matches = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
  return matches.map((match) => stripHtml(match[1])).filter(Boolean);
};

const parseContentBlocksFromHtml = (html: string): ContentBlockDto[] => {
  const blocks: ContentBlockDto[] = [];
  const blockRegex =
    /<figure[\s\S]*?<\/figure>|<pre[\s\S]*?<\/pre>|<h[1-6][\s\S]*?<\/h[1-6]>|<p[\s\S]*?<\/p>|<ul[\s\S]*?<\/ul>|<ol[\s\S]*?<\/ol>|<img[^>]*>/gi;

  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(html)) !== null) {
    const snippet = match[0];

    if (snippet.startsWith('<figure')) {
      const imageUrl = extractImageUrl(snippet);
      if (imageUrl) {
        blocks.push({
          type: 'image',
          imageUrl,
          content: extractAltText(snippet) || 'image',
        });
      }
      const captionMatch = snippet.match(
        /<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i,
      );
      if (captionMatch) {
        const caption = stripHtml(captionMatch[1]);
        if (caption) {
          blocks.push({ type: 'text', content: caption });
        }
      }
      continue;
    }

    if (snippet.startsWith('<img')) {
      const imageUrl = extractImageUrl(snippet);
      if (imageUrl) {
        blocks.push({
          type: 'image',
          imageUrl,
          content: extractAltText(snippet) || 'image',
        });
      }
      continue;
    }

    if (snippet.startsWith('<pre')) {
      const code = extractCode(snippet);
      if (code) {
        blocks.push({
          type: 'code',
          codeType: 'text',
          content: code,
        });
      }
      continue;
    }

    const headingMatch = snippet.match(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/i);
    if (headingMatch) {
      const level = headingMatch[1];
      const text = stripHtml(headingMatch[2]);
      if (text) {
        blocks.push({
          type: 'heading',
          title: {
            type: `h${level}` as ContentBlockDto['title']['type'],
            text,
          },
        });
      }
      continue;
    }

    if (snippet.startsWith('<ul') || snippet.startsWith('<ol')) {
      const items = extractListItems(snippet);
      if (items.length) {
        blocks.push({
          type: 'list',
          list: {
            type: snippet.startsWith('<ol') ? 'ordered' : 'unordered',
            content: items,
          },
        });
      }
      continue;
    }

    if (snippet.startsWith('<p')) {
      const text = stripHtml(snippet);
      if (text) {
        blocks.push({ type: 'text', content: text });
      }
    }
  }

  return blocks;
};

const extractCdata = (item: string, tag: string): string => {
  const cdataMatch = item.match(
    new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'),
  );
  if (cdataMatch) return cdataMatch[1].trim();
  const plainMatch = item.match(
    new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'),
  );
  return plainMatch ? plainMatch[1].trim() : '';
};

const toDateOnly = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  const day = String(parsed.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizeUrl = (value: string): string => {
  const withoutQuery = value.split('?')[0].trim();
  return withoutQuery.replace(/\/+$/, '');
};

const buildPostFromItem = (
  item: string,
  allowedUrls: Set<string>,
  authorName: string,
): LocalSeedPost | null => {
  const title = extractCdata(item, 'title');
  if (!title) return null;

  const creator = extractCdata(item, 'dc:creator');
  if (
    authorName &&
    creator &&
    creator.trim().toLowerCase() !== authorName.toLowerCase()
  ) {
    return null;
  }

  const link = extractCdata(item, 'link');
  const normalizedLink = normalizeUrl(link);
  if (
    allowedUrls.size > 0 &&
    normalizedLink &&
    !allowedUrls.has(normalizedLink)
  ) {
    return null;
  }

  const contentHtml = extractCdata(item, 'content:encoded');
  const coverImage = extractImageUrl(contentHtml);
  const pubDate = extractCdata(item, 'pubDate');
  const categories = [
    ...item.matchAll(/<category>([\s\S]*?)<\/category>/gi),
  ].map((match) => {
    const raw = decodeHtmlEntities(match[1].trim());
    return raw
      .replace(/^<!\[CDATA\[/i, '')
      .replace(/\]\]>$/i, '')
      .trim();
  });

  const contentBlocks = parseContentBlocksFromHtml(contentHtml);
  if (contentBlocks.length === 0) return null;

  return {
    title,
    coverImage,
    contentBlocks,
    keywords: categories,
    publishedAt: toDateOnly(pubDate),
  };
};

const mergePosts = (existing: LocalSeedPost[], incoming: LocalSeedPost[]) => {
  const map = new Map(existing.map((post) => [post.title, post]));
  for (const post of incoming) {
    if (!map.has(post.title)) {
      map.set(post.title, post);
    }
  }
  return [...map.values()];
};

const parseAllowedUrls = (value: string | undefined) => {
  if (!value) return new Set([...DEFAULT_ALLOWED_URLS].map(normalizeUrl));
  const urls = value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  return new Set(urls.map(normalizeUrl));
};

const run = async () => {
  const feedUrl = process.env.MEDIUM_FEED_URL || DEFAULT_FEED_URL;
  const authorName = process.env.MEDIUM_AUTHOR || DEFAULT_AUTHOR;
  const allowedUrls = parseAllowedUrls(process.env.MEDIUM_ALLOWED_URLS);
  const rss = await fetchText(feedUrl);
  const items = rss
    .split('<item>')
    .slice(1)
    .map((item) => item.split('</item>')[0]);

  const posts = items
    .map((item) => buildPostFromItem(item, allowedUrls, authorName))
    .filter((post): post is LocalSeedPost => Boolean(post));

  const existing = existsSync(OUTPUT_PATH)
    ? (JSON.parse(readFileSync(OUTPUT_PATH, 'utf-8')) as LocalSeedPost[])
    : [];

  const merged = mergePosts(existing, posts);
  writeFileSync(OUTPUT_PATH, JSON.stringify(merged, null, 2));

  console.log(`Wrote ${posts.length} posts from RSS to ${OUTPUT_PATH}`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
