import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCommentSchema } from "@/lib/validators/comment";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");
  const moderation = searchParams.get("moderation") === "true";

  if (!postId) {
    return NextResponse.json({ message: "缺少 postId 参数" }, { status: 400 });
  }

  if (moderation) {
    const session = await getAuthSession();

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  }

  const comments = await prisma.comment.findMany({
    where: {
      postId,
      ...(moderation ? {} : { approved: true }),
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(comments);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const data = createCommentSchema.safeParse(payload);

  if (!data.success) {
    return NextResponse.json({ errors: data.error.flatten() }, { status: 400 });
  }

  const session = await getAuthSession();

  const { postId, body, email, name } = data.data;

  const post = await prisma.post.findFirst({
    where: { id: postId },
  });

  if (!post || !post.published) {
    return new NextResponse("文章不存在或未发布", { status: 404 });
  }

  const autoApprove = session?.user?.role === "ADMIN";

  const comment = await prisma.comment.create({
    data: {
      postId,
      body,
      approved: autoApprove,
      authorId: session?.user?.id,
      name: session?.user?.name ?? (name === "" ? null : name ?? null),
      email: session?.user?.email ?? (email === "" ? null : email ?? null),
    },
  });

  return NextResponse.json(comment, { status: 201 });
}

