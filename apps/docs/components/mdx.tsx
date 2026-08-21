import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { ElapsedMath } from '@/components/elapsed-math';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ElapsedMath,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
