import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const branches = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/branches' }),
  schema: z.object({
    title: z.string(),
    emoji: z.string(),
    hook: z.string(),
    status: z.enum(['live', 'placeholder']),
    tone: z.enum(['standard', 'soft']).default('standard'),
    order: z.number(),
  }),
});

const pillars = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pillars' }),
  schema: z.object({
    title: z.string(),
    emoji: z.string(),
    tagline: z.string(),
    status: z.enum(['live', 'placeholder']),
    order: z.number(),
  }),
});

const stepSchema = z.object({
  title: z.string(),
  text: z.string(),
});

const practiceRowSchema = z.object({
  science: z.string(),
  sacred: z.string(),
  soul: z.string(),
});

const toolRowSchema = z.object({
  tool: z.string(),
  purpose: z.string(),
  sacred: z.string(),
});

const nodes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/nodes' }),
  schema: z.object({
    title: z.string(),
    nodeId: z.number(),
    subHeader: z.string().optional(),
    intention: z.string().optional(),
    steps: z.array(stepSchema).optional(),
    practiceTable: z.array(practiceRowSchema).optional(),
    toolsTable: z.array(toolRowSchema).optional(),
    reflectionPrompts: z.array(z.string()).optional(),
    closingLine: z.string().optional(),
  }),
});

export const collections = { branches, pillars, nodes };
