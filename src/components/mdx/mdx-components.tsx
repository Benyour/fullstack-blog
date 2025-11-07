"use client";

import Link from "next/link";
import type { HTMLAttributes, AnchorHTMLAttributes, ImgHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const Pre = ({ className, ...props }: HTMLAttributes<HTMLPreElement>) => {
  return (
    <pre
      className={cn(
        "mb-6 overflow-x-auto rounded-lg bg-slate-950/95 p-4 text-sm text-slate-100",
        className,
      )}
      {...props}
    />
  );
};

const Code = ({ className, ...props }: HTMLAttributes<HTMLElement>) => {
  return <code className={cn("font-mono", className)} {...props} />;
};

const Anchor = ({ className, href = "", ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const isInternal = href.startsWith("/") || href.startsWith("#");

  if (isInternal) {
    return (
      <Link
        className={cn("font-medium text-sky-600 transition hover:text-sky-700", className)}
        href={href}
        {...props}
      />
    );
  }

  return (
    <a
      className={cn("font-medium text-sky-600 transition hover:text-sky-700", className)}
      target="_blank"
      rel="noopener noreferrer"
      href={href}
      {...props}
    />
  );
};

const Blockquote = ({ className, ...props }: HTMLAttributes<HTMLQuoteElement>) => (
  <blockquote
    className={cn(
      "my-6 border-l-4 border-sky-400/60 bg-sky-100/50 px-5 py-3 text-sky-900 dark:border-sky-500/60 dark:bg-sky-400/10 dark:text-sky-100",
      className,
    )}
    {...props}
  />
);

const Img = ({ className, alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) => (
  <span className="block">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img className={cn("rounded-lg", className)} alt={alt ?? ""} {...props} />
  </span>
);

export const mdxComponents = {
  pre: Pre,
  code: Code,
  a: Anchor,
  blockquote: Blockquote,
  img: Img,
  ul: ({ className, ...props }: HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn("my-4 ml-5 list-disc space-y-2", className)} {...props} />
  ),
  ol: ({ className, ...props }: HTMLAttributes<HTMLOListElement>) => (
    <ol className={cn("my-4 ml-5 list-decimal space-y-2", className)} {...props} />
  ),
  li: ({ className, ...props }: HTMLAttributes<HTMLLIElement>) => (
    <li className={cn("leading-relaxed", className)} {...props} />
  ),
};

