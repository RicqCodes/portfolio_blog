import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { BlogPost } from '../entity/post.entity';

const TARGET_TITLES = [
  'Indexing Blockchain Data to CSV Files with Subsquid: A Comprehensive Tutorial',
  'PART 1: Lifetimes In Rust',
  'Understanding Client-side Rendering and Server-side Rendering',
];

const randomViews = () => Math.floor(1000 + Math.random() * 4000);

async function run() {
  await AppDataSource.initialize();

  const repo = AppDataSource.getRepository(BlogPost);
  const posts = await repo.find({
    where: TARGET_TITLES.map((title) => ({ title })),
  });

  if (!posts.length) {
    console.log('No matching posts found.');
    await AppDataSource.destroy();
    return;
  }

  for (const post of posts) {
    const views = randomViews();
    await repo.update({ id: post.id }, { views });
    console.log(`Updated "${post.title}" -> ${views} views`);
  }

  await AppDataSource.destroy();
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
