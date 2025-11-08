import { NextRequest, NextResponse } from "next/server";

import type { Prisma } from "@prisma/client";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { upsertPostSchema } from "@/lib/validators/post";

function postWhere(postId: string): Prisma.PostWhereInput {
  return {
    OR: [{ id: postId }, { slug: postId }],
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;

  const post = await prisma.post.findFirst({
    where: postWhere(postId),
    include: {
      tags: { include: { tag: true } },
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: true,
        },
      },
      revisions: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          editor: {
            select: { id: true, name: true, email: true },
          },
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

  if (!post) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return NextResponse.json({
    ...post,
    tags: post.tags.map(({ tag }) => tag),
    stats: {
      comments: post._count.comments,
      likes: post._count.reactions,
    },
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;

  const session = await getAuthSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const payload = await request.json();
  const data = upsertPostSchema.safeParse(payload);

  if (!data.success) {
    return NextResponse.json({ errors: data.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.post.findFirst({ where: postWhere(postId) });

  if (!existing) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const { title, slug, summary, content, coverImage, tags, published, scheduledAt } = data.data;

  if (slug !== existing.slug) {
    const slugExists = await prisma.post.findUnique({ where: { slug } });
    if (slugExists) {
      return NextResponse.json({ message: "Slug 已存在" }, { status: 409 });
    }
  }

  if (tags.length > 0) {
    await Promise.all(
      tags.map((tag) =>
        prisma.tag.upsert({
          where: { slug: tag },
          update: {},
          create: { slug: tag, name: tag },
        }),
      ),
    );
  }

  const scheduledAtDate = scheduledAt && scheduledAt !== "" ? new Date(scheduledAt) : null;
  const shouldPublish = Boolean(published) || (scheduledAtDate && scheduledAtDate <= new Date());

  const hasContentChanges =
    existing.title !== title ||
    existing.summary !== summary ||
    existing.content !== content ||
    existing.coverImage !== (coverImage || null);

  if (hasContentChanges) {
    await prisma.postRevision.create({
      data: {
        postId: existing.id,
        editorId: session.user.id,
        title: existing.title,
        summary: existing.summary,
        content: existing.content,
      },
    });
  }

  const post = await prisma.post.update({
    where: { id: existing.id },
    data: {
      title,
      slug,
      summary,
      content,
      coverImage: coverImage || null,
      published: shouldPublish,
      publishedAt: shouldPublish ? existing.publishedAt ?? new Date() : null,
      scheduledAt: scheduledAtDate,
      tags: {
        deleteMany: {},
        create: tags.map((tag) => ({
          tag: {
            connect: { slug: tag },
          },
        })),
      },
    },
    include: {
      tags: { include: { tag: true } },
      revisions: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          editor: {
            select: { id: true, name: true, email: true },
          },
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

  return NextResponse.json({
    ...post,
    tags: post.tags.map(({ tag }) => tag),
    stats: {
      comments: post._count.comments,
      likes: post._count.reactions,
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;

  const session = await getAuthSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const existing = await prisma.post.findFirst({ where: postWhere(postId) });

  if (!existing) {
    return new NextResponse("Not Found", { status: 404 });
  }

  await prisma.post.delete({ where: { id: existing.id } });

  return new NextResponse(null, { status: 204 });
}

