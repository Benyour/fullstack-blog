import { compileMDX } from "next-mdx-remote/rsc";
import { Fragment, type ReactElement } from "react";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrism from "rehype-prism-plus";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { mdxComponents } from "@/components/mdx/mdx-components";

type RenderMDXOptions = {
  scope?: Record<string, unknown>;
};

export async function renderMDX(source: string, options: RenderMDXOptions = {}): Promise<ReactElement> {
  const { content } = await compileMDX<{ scope?: Record<string, unknown> }>({
    source,
    options: {
      scope: options.scope,
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug, rehypePrism, [rehypeAutolinkHeadings, { behavior: "wrap" }]],
      },
    },
    components: mdxComponents,
  });

  return content;
}

export async function renderMDXToString(source: string, options: RenderMDXOptions = {}): Promise<string> {
  const element = await renderMDX(source, options);
  const { renderToString } = await import("react-dom/server");
  return renderToString(<Fragment>{element}</Fragment>);
}

