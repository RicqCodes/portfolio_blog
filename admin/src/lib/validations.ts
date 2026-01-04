import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Tag validation schema
export const tagSchema = z.object({
  name: z
    .string()
    .min(1, 'Tag name is required')
    .min(2, 'Tag name must be at least 2 characters')
    .max(50, 'Tag name must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Tag name can only contain letters, numbers, spaces, and hyphens'),
});

export type TagFormData = z.infer<typeof tagSchema>;

// Content block validation schemas
const titleSchema = z.object({
  type: z.enum(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p']),
  text: z.string().min(1, 'Heading text is required'),
});

const listSchema = z.object({
  type: z.enum(['ordered', 'unordered']),
  content: z.array(z.string().min(1)).min(1, 'At least one list item is required'),
});

const baseBlockSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['text', 'heading', 'image', 'code', 'list', 'divider']),
});

export const contentBlockSchema = z.discriminatedUnion('type', [
  baseBlockSchema.extend({
    type: z.literal('text'),
    content: z.string().min(1, 'Text content is required'),
  }),
  baseBlockSchema.extend({
    type: z.literal('heading'),
    title: titleSchema,
  }),
  baseBlockSchema.extend({
    type: z.literal('image'),
    imageUrl: z.string().url('Must be a valid URL').min(1, 'Image URL is required'),
    content: z.string().optional(),
  }),
  baseBlockSchema.extend({
    type: z.literal('code'),
    content: z.string().min(1, 'Code content is required'),
  }),
  baseBlockSchema.extend({
    type: z.literal('list'),
    list: listSchema,
  }),
  baseBlockSchema.extend({
    type: z.literal('divider'),
  }),
]);

// Post validation schema (simplified for form fields only)
// Content blocks and tags are validated separately
export const postSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must not exceed 200 characters'),
  coverImage: z.string().optional(),
  contentBlocks: z.array(z.any()).optional(),
  tags: z.array(z.any()).optional(),
});

export type PostFormData = z.infer<typeof postSchema>;
