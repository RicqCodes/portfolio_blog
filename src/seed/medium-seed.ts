import 'dotenv/config';
import * as https from 'node:https';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AppDataSource } from '../data-source';
import { BlogPost } from '../entity/post.entity';
import { ContentBlock } from '../entity/block.entity';
import { Tag } from '../entity/tag.entity';
import { Helper } from '../helperClass';
import { ContentBlockDto } from '../dto/content.dto';

type MediumSeedInput = {
  url: string;
  publishedAt: string;
};

type MediumPost = {
  title: string;
  coverImage: string;
  articleBody: string;
  keywords: string[];
};

const postsToSeed: MediumSeedInput[] = [
  {
    url: 'https://medium.com/stackademic/understanding-client-side-rendering-and-server-side-rendering-44fe6e3d2811',
    publishedAt: '2023-11-07',
  },
  {
    url: 'https://medium.com/stackademic/part-1-lifetimes-in-rust-0e4b2fba8bc0',
    publishedAt: '2024-07-09',
  },
];

type LocalSeedPost = {
  title: string;
  coverImage?: string;
  cover_image?: string;
  articleBody?: string;
  contentBlocks?: ContentBlockDto[];
  keywords?: string[];
  tags?: { name: string }[];
  publishedAt: string;
};
const localSeedPath = resolve(__dirname, 'medium-posts.json');

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

const buildMediumJsonUrl = (url: string): string =>
  url.includes('?') ? `${url}&format=json` : `${url}?format=json`;

const buildMediumFeedUrl = (url: string): string => {
  const parsed = new URL(url);
  const [segment] = parsed.pathname.split('/').filter(Boolean);
  if (!segment) {
    throw new Error(`Unable to derive feed URL for ${url}`);
  }
  const feedSegment = segment.startsWith('@') ? segment : segment;
  return `https://medium.com/feed/${feedSegment}`;
};

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

const extractRssPost = async (url: string): Promise<MediumPost> => {
  const feedUrl = buildMediumFeedUrl(url);
  const rss = await fetchText(feedUrl);

  const items = rss
    .split('<item>')
    .slice(1)
    .map((item) => item.split('</item>')[0]);
  const target = items.find((item) => {
    const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
    if (!linkMatch) return false;
    const link = linkMatch[1].trim();
    return link.includes(url);
  });

  if (!target) {
    throw new Error(`Post not found in feed ${feedUrl}`);
  }

  const titleMatch = target.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/);
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled';

  const contentMatch =
    target.match(
      /<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/,
    ) || target.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/);
  const contentHtml = contentMatch ? contentMatch[1].trim() : '';

  const imageMatch = contentHtml.match(/<img[^>]+src="([^"]+)"/i);
  const coverImage = imageMatch ? imageMatch[1] : '';

  const categoryMatches = [
    ...target.matchAll(/<category>([\s\S]*?)<\/category>/g),
  ];
  const keywords = categoryMatches.map((match) =>
    decodeHtmlEntities(match[1].trim()),
  );

  const articleBody = stripHtml(contentHtml);

  return {
    title,
    coverImage,
    articleBody,
    keywords,
  };
};

const parseMediumJson = (raw: string): MediumPost => {
  const jsonStart = raw.indexOf('{');
  if (jsonStart === -1) {
    throw new Error('Invalid Medium JSON response');
  }

  const parsed = JSON.parse(raw.slice(jsonStart));
  const value = parsed?.payload?.value;

  if (!value) {
    throw new Error('Missing Medium payload');
  }

  const title = String(value.title || 'Untitled').trim();
  const coverImageId =
    value?.virtuals?.previewImage?.imageId || value?.coverImage?.id || '';
  const coverImage = coverImageId
    ? `https://miro.medium.com/v2/resize:fit:1200/${coverImageId}`
    : '';
  const keywords = Array.isArray(value.tags)
    ? value.tags.map((tag: { name: string }) => tag.name)
    : [];

  const paragraphs = Array.isArray(value?.content?.bodyModel?.paragraphs)
    ? value.content.bodyModel.paragraphs
    : [];
  const articleBody = paragraphs
    .map((paragraph: { text?: string }) => paragraph.text?.trim())
    .filter(Boolean)
    .join('\n');

  return {
    title,
    coverImage,
    articleBody,
    keywords,
  };
};

const extractJsonLd = (html: string): Record<string, unknown> | null => {
  const scriptRegex =
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let match: RegExpExecArray | null;

  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      const article = candidates.find((item) => {
        const type = item['@type'];
        if (!type) return false;
        if (Array.isArray(type)) {
          return type.includes('Article') || type.includes('BlogPosting');
        }
        return type === 'Article' || type === 'BlogPosting';
      });
      if (article) return article;
    } catch {
      continue;
    }
  }

  return null;
};

const normalizeKeywords = (keywords: unknown): string[] => {
  if (!keywords) return [];
  if (Array.isArray(keywords)) {
    return keywords.map((value) => String(value).trim()).filter(Boolean);
  }
  if (typeof keywords === 'string') {
    return keywords
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }
  return [];
};

const extractMediumPost = async (url: string): Promise<MediumPost> => {
  try {
    const raw = await fetchText(buildMediumJsonUrl(url));
    return parseMediumJson(raw);
  } catch {
    // Fallback to HTML parsing if Medium JSON isn't available.
  }

  try {
    return await extractRssPost(url);
  } catch {
    // Fallback to HTML parsing if RSS doesn't include the post.
  }

  const html = await fetchText(url);
  const jsonLd = extractJsonLd(html);

  if (!jsonLd) {
    throw new Error(`Unable to parse metadata for ${url}`);
  }

  const title = String(jsonLd.headline || jsonLd.name || 'Untitled').trim();
  const articleBody = String(jsonLd.articleBody || jsonLd.description || '')
    .replace(/\r/g, '')
    .trim();

  const image = jsonLd.image;
  const coverImage = Array.isArray(image)
    ? String(image[0] || '')
    : String(image || '');

  const keywords = normalizeKeywords(jsonLd.keywords);

  return {
    title,
    coverImage,
    articleBody,
    keywords,
  };
};

const buildContentBlocks = (articleBody: string): ContentBlock[] => {
  const paragraphs = articleBody
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return [];
  }

  return paragraphs.map((content, index) => {
    const block = new ContentBlock();
    block.type = 'text';
    block.content = content;
    block.order = index + 1;
    return block;
  });
};

const buildContentBlockDtos = (articleBody: string): ContentBlockDto[] =>
  articleBody
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((content) => ({ type: 'text', content }));

const seedPost = async (
  postData: MediumPost,
  publishedAt: string,
): Promise<void> => {
  const publishedDate = new Date(publishedAt);

  await AppDataSource.manager.transaction(async (manager) => {
    const postRepository = manager.getRepository(BlogPost);
    const tagRepository = manager.getRepository(Tag);
    const contentBlockRepository = manager.getRepository(ContentBlock);

    const existingPost = await postRepository.findOne({
      where: { title: postData.title },
    });

    if (existingPost) {
      return;
    }

    if (!postData.coverImage) {
      throw new Error(`Missing cover image for ${postData.title}`);
    }

    if (!postData.articleBody) {
      throw new Error(`Missing article body for ${postData.title}`);
    }

    const blogPost = new BlogPost();
    blogPost.title = postData.title;
    blogPost.coverImage = postData.coverImage;
    blogPost.readTime = Helper.calculateReadingTime(
      buildContentBlockDtos(postData.articleBody),
    );
    blogPost.createdAt = publishedDate;
    blogPost.updatedAt = publishedDate;

    const savedPost = await postRepository.save(blogPost);

    const contentBlocks = buildContentBlocks(postData.articleBody);
    contentBlocks.forEach((block) => {
      block.blogPost = savedPost;
    });

    await contentBlockRepository.save(contentBlocks);

    const tagNames = (postData.keywords.length ? postData.keywords : ['medium'])
      .map((name) => name.trim())
      .filter(Boolean);
    const uniqueTagNames = [...new Set(tagNames)];

    const tagEntities: Tag[] = [];
    for (const name of uniqueTagNames) {
      let tag = await tagRepository.findOne({
        where: { name },
        relations: ['blogPosts'],
      });

      if (!tag) {
        tag = new Tag();
        tag.name = name;
        tag.blogPosts = [];
      }

      if (!tag.blogPosts.find((post) => post.id === savedPost.id)) {
        tag.blogPosts = [...tag.blogPosts, savedPost];
      }
      await tagRepository.save(tag);
      tagEntities.push(tag);
    }

    savedPost.contentBlocks = contentBlocks;
    savedPost.tags = tagEntities;

    await postRepository.save(savedPost);
  });
};

const seedLocalPost = async (postData: LocalSeedPost): Promise<void> => {
  const publishedDate = new Date(postData.publishedAt);
  const coverImage = postData.coverImage || postData.cover_image || '';
  const keywordTags = postData.keywords ?? [];
  const explicitTags = postData.tags?.map((tag) => tag.name) ?? [];
  const tagNames = [...keywordTags, ...explicitTags, 'medium']
    .map((name) => name.trim())
    .filter(Boolean);
  const uniqueTagNames = [...new Set(tagNames)];

  await AppDataSource.manager.transaction(async (manager) => {
    const postRepository = manager.getRepository(BlogPost);
    const tagRepository = manager.getRepository(Tag);
    const contentBlockRepository = manager.getRepository(ContentBlock);

    const existingPost = await postRepository.findOne({
      where: { title: postData.title },
    });

    if (existingPost) {
      return;
    }

    if (!coverImage) {
      throw new Error(`Missing cover image for ${postData.title}`);
    }

    const blocks =
      postData.contentBlocks ??
      buildContentBlockDtos(postData.articleBody ?? '');
    if (blocks.length === 0) {
      throw new Error(`Missing content blocks for ${postData.title}`);
    }

    const blogPost = new BlogPost();
    blogPost.title = postData.title;
    blogPost.coverImage = coverImage;
    blogPost.readTime = Helper.calculateReadingTime(blocks);
    blogPost.createdAt = publishedDate;
    blogPost.updatedAt = publishedDate;

    const savedPost = await postRepository.save(blogPost);

    const contentBlockEntities = blocks.map((blockDto, index) => {
      const block = new ContentBlock();
      block.type = blockDto.type;
      block.order = index + 1;
      block.title = blockDto.title;
      block.content = blockDto.content;
      block.list = blockDto.list;
      block.links = blockDto.links;
      block.imageUrl = blockDto.imageUrl;
      block.codeType = blockDto.codeType;
      block.blogPost = savedPost;
      return block;
    });

    await contentBlockRepository.save(contentBlockEntities);

    const tagEntities: Tag[] = [];
    for (const name of uniqueTagNames) {
      let tag = await tagRepository.findOne({
        where: { name },
        relations: ['blogPosts'],
      });

      if (!tag) {
        tag = new Tag();
        tag.name = name;
        tag.blogPosts = [];
      }

      if (!tag.blogPosts.find((post) => post.id === savedPost.id)) {
        tag.blogPosts = [...tag.blogPosts, savedPost];
      }
      await tagRepository.save(tag);
      tagEntities.push(tag);
    }

    savedPost.contentBlocks = contentBlockEntities;
    savedPost.tags = tagEntities;

    await postRepository.save(savedPost);
  });
};

const run = async () => {
  await AppDataSource.initialize();

  try {
    if (existsSync(localSeedPath)) {
      const raw = readFileSync(localSeedPath, 'utf-8');
      const posts: LocalSeedPost[] = JSON.parse(raw);
      for (const post of posts) {
        await seedLocalPost(post);
        console.log(`Seeded ${post.title}`);
      }
      return;
    }

    for (const postInput of postsToSeed) {
      const postData = await extractMediumPost(postInput.url);
      await seedPost(postData, postInput.publishedAt);
      console.log(`Seeded ${postData.title}`);
    }
  } finally {
    await AppDataSource.destroy();
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
