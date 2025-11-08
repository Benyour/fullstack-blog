import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { upsertPostSchema } from "@/lib/validators/post";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publishedParam = searchParams.get("published");
  const take = Number(searchParams.get("take") ?? 20);
  const includeDraftFlag = publishedParam === null;

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
      _count: {
        select: {
          comments: {
            where: { approved: true },
          },
          reactions: true,
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
      scheduledAt: post.scheduledAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      isDraft: includeDraftFlag ? !post.published : undefined,
      tags: post.tags.map(({ tag }) => tag),
      author: post.author,
      stats: {
        comments: post._count.comments,
        likes: post._count.reactions,
      },
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

  const { title, slug, summary, content, coverImage, tags, published, scheduledAt } = data.data;

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

  const scheduledAtDate = scheduledAt && scheduledAt !== "" ? new Date(scheduledAt) : null;
  const shouldPublish = Boolean(published) || (scheduledAtDate && scheduledAtDate <= new Date());

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      summary,
      content,
      coverImage: coverImage || null,
      published: shouldPublish || Boolean(published),
      publishedAt: shouldPublish ? new Date() : null,
      scheduledAt: scheduledAtDate,
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

  await prisma.postRevision.create({
    data: {
      postId: post.id,
      editorId: session.user.id,
      title,
      summary,
      content,
      coverImage: coverImage || null,
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

