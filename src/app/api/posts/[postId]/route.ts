import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { upsertPostSchema } from "@/lib/validators/post";

function postWhere(postId: string) {
  return {
    OR: [{ id: postId }, { slug: postId }],
  } as const;
}

export async function GET(
  _request: Request,
  { params }: { params: { postId: string } },
) {
  const post = await prisma.post.findFirst({
    where: postWhere(params.postId),
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
    },
  });

  if (!post) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return NextResponse.json({
    ...post,
    tags: post.tags.map(({ tag }) => tag),
  });
}

export async function PUT(
  request: Request,
  { params }: { params: { postId: string } },
) {
  const session = await getAuthSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const payload = await request.json();
  const data = upsertPostSchema.safeParse(payload);

  if (!data.success) {
    return NextResponse.json({ errors: data.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.post.findFirst({ where: postWhere(params.postId) });

  if (!existing) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const { title, slug, summary, content, coverImage, tags, published } = data.data;

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

  const post = await prisma.post.update({
    where: { id: existing.id },
    data: {
      title,
      slug,
      summary,
      content,
      coverImage: coverImage || null,
      published: Boolean(published),
      publishedAt: published ? existing.publishedAt ?? new Date() : null,
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
    },
  });

  return NextResponse.json({
    ...post,
    tags: post.tags.map(({ tag }) => tag),
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { postId: string } },
) {
  const session = await getAuthSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const existing = await prisma.post.findFirst({ where: postWhere(params.postId) });

  if (!existing) {
    return new NextResponse("Not Found", { status: 404 });
  }

  await prisma.post.delete({ where: { id: existing.id } });

  return new NextResponse(null, { status: 204 });
}

