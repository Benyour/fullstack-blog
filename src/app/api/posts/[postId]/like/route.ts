import { NextResponse } from "next/server";
import { ReactionType } from "@prisma/client";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRequestFingerprint } from "@/lib/server-utils";

type Params = Promise<{
  postId: string;
}>;

async function resolvePostId(postId: string) {
  const post = await prisma.post.findFirst({
    where: {
      OR: [{ id: postId }, { slug: postId }],
    },
    select: { id: true },
  });

  return post?.id ?? null;
}

export async function POST(request: Request, { params }: { params: Params }) {
  const { postId } = await params;
  const realPostId = await resolvePostId(postId);

  if (!realPostId) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const session = await getAuthSession();

  const fingerprint = session?.user
    ? `user:${session.user.id}`
    : `anon:${getRequestFingerprint(request)}`;

  const existing = await prisma.postReaction.findUnique({
    where: {
      postId_fingerprint_type: {
        postId: realPostId,
        fingerprint,
        type: ReactionType.LIKE,
      },
    },
  });

  if (existing) {
    return NextResponse.json({ liked: true }, { status: 200 });
  }

  await prisma.postReaction.create({
    data: {
      postId: realPostId,
      fingerprint,
      type: ReactionType.LIKE,
      userId: session?.user?.id,
    },
  });

  return NextResponse.json({ liked: true }, { status: 201 });
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  const { postId } = await params;
  const realPostId = await resolvePostId(postId);

  if (!realPostId) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const session = await getAuthSession();

  const fingerprint = session?.user
    ? `user:${session.user.id}`
    : `anon:${getRequestFingerprint(request)}`;

  await prisma.postReaction.deleteMany({
    where: {
      postId: realPostId,
      fingerprint,
      type: ReactionType.LIKE,
    },
  });

  return new NextResponse(null, { status: 204 });
}

