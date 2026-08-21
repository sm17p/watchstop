import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { ElapsedMath } from '@/components/elapsed-math';
import { ElapsedSystemCircle } from '@/components/elapsed-system-circle';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ElapsedMath,
    ElapsedSystemCircle,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
