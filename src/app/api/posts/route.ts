import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { upsertPostSchema } from "@/lib/validators/post";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publishedParam = searchParams.get("published");
  const take = Number(searchParams.get("take") ?? 20);

  const posts = await prisma.post.findMany({
    where: {
      published:
        publishedParam === null ? undefined : publishedParam === "true",
    },
    take,
    orderBy: { publishedAt: "desc" },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: true,
        },
      },
    },
  });

  return NextResponse.json(
    posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      content: post.content,
      coverImage: post.coverImage,
      published: post.published,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      tags: post.tags.map(({ tag }) => tag),
      author: post.author,
    })),
  );
}

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const payload = await request.json();

  const data = upsertPostSchema.safeParse(payload);

  if (!data.success) {
    return NextResponse.json({ errors: data.error.flatten() }, { status: 400 });
  }

  const { title, slug, summary, content, coverImage, tags, published } = data.data;

  const exists = await prisma.post.findUnique({ where: { slug } });

  if (exists) {
    return NextResponse.json({ message: "Slug 已存在" }, { status: 409 });
  }

  if (tags.length > 0) {
    await Promise.all(
      tags.map((tag) =>
        prisma.tag.upsert({
          where: { slug: tag },
          update: {},
          create: {
            slug: tag,
            name: tag,
          },
        }),
      ),
    );
  }

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      summary,
      content,
      coverImage: coverImage || null,
      published: Boolean(published),
      publishedAt: published ? new Date() : null,
      authorId: session.user.id,
      tags: {
        create: tags.map((tag) => ({
          tag: {
            connect: { slug: tag },
          },
        })),
      },
    },
    include: {
      tags: {
        include: { tag: true },
      },
    },
  });

  return NextResponse.json(
    {
      ...post,
      tags: post.tags.map(({ tag }) => tag),
    },
    { status: 201 },
  );
}

