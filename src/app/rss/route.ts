import { NextResponse } from "next/server";
import { Feed } from "feed";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

  const feed = new Feed({
    title: "张亚斌 · 技术博客",
    description: "记录 Next.js、React、工程化与产品思考。",
    id: baseUrl,
    link: baseUrl,
    language: "zh-CN",
    favicon: `${baseUrl}/favicon.ico`,
    generator: "feed",
  });

  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  posts.forEach((post) => {
    feed.addItem({
      id: `${baseUrl}/blog/${post.slug}`,
      link: `${baseUrl}/blog/${post.slug}`,
      title: post.title,
      description: post.summary,
      date: post.publishedAt ?? post.createdAt,
    });
  });

  const rss = feed.rss2();

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}

