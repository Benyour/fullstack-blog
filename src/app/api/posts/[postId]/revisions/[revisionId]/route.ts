import { NextRequest, NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string; revisionId: string }> },
) {
  const { postId, revisionId } = await params;

  const session = await getAuthSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const [post, revision] = await Promise.all([
    prisma.post.findFirst({
      where: {
        OR: [{ id: postId }, { slug: postId }],
      },
    }),
    prisma.postRevision.findFirst({
      where: {
        id: revisionId,
        post: {
          OR: [{ id: postId }, { slug: postId }],
        },
      },
    }),
  ]);

  if (!post || !revision) {
    return new NextResponse("Not Found", { status: 404 });
  }

  await prisma.postRevision.create({
    data: {
      postId: post.id,
      editorId: session.user.id,
      title: post.title,
      summary: post.summary,
      content: post.content,
      coverImage: post.coverImage,
    },
  });

  await prisma.post.update({
    where: { id: post.id },
    data: {
      title: revision.title,
      summary: revision.summary,
      content: revision.content,
      coverImage: revision.coverImage ?? null,
    },
  });

  return new NextResponse(null, { status: 204 });
}
