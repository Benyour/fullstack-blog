import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { moderateCommentSchema } from "@/lib/validators/comment";

type Params = Promise<{
  commentId: string;
}>;

export async function PATCH(request: Request, { params }: { params: Params }) {
  const session = await getAuthSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { commentId } = await params;
  const payload = await request.json();

  const data = moderateCommentSchema.safeParse(payload);

  if (!data.success) {
    return NextResponse.json({ errors: data.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: {
      approved: data.data.approved ?? undefined,
      body: data.data.body ?? undefined,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Params }) {
  const session = await getAuthSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { commentId } = await params;

  await prisma.comment.delete({
    where: { id: commentId },
  });

  return new NextResponse(null, { status: 204 });
}

