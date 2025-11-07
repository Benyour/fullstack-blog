import Link from "next/link";

import { Container } from "@/components/layout/container";

const links = [
  { href: "https://github.com", label: "GitHub" },
  { href: "https://www.zhihu.com/", label: "知乎" },
  { href: "https://twitter.com/", label: "X" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-white/80 py-10 text-sm text-slate-500 backdrop-blur dark:border-white/10 dark:bg-black/60 dark:text-slate-400">
      <Container className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium text-slate-700 dark:text-slate-200">张亚斌 · 前端开发者</p>
          <p className="mt-1">专注 Next.js、React、可观测性与前端工程化。</p>
          <p className="mt-1 text-xs">© {new Date().getFullYear()} Zhang Yabin. 保留所有权利。</p>
        </div>
        <nav className="flex gap-4">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-slate-700 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}

