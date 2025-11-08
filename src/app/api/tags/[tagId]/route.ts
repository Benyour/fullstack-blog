import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { upsertTagSchema } from "@/lib/validators/tag";
import { slugify } from "@/lib/utils";

type Params = Promise<{
  tagId: string;
}>;

export async function PUT(request: Request, { params }: { params: Params }) {
  const session = await getAuthSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { tagId } = await params;
  const payload = await request.json();
  const data = upsertTagSchema.safeParse(payload);

  if (!data.success) {
    return NextResponse.json({ errors: data.error.flatten() }, { status: 400 });
  }

  const { name, slug } = data.data;
  const targetSlug = slug ? slugify(slug) : slugify(name);

  const existing = await prisma.tag.findFirst({
    where: {
      slug: targetSlug,
      NOT: { id: tagId },
    },
  });

  if (existing) {
    return NextResponse.json({ message: "Slug 已存在" }, { status: 409 });
  }

  const updated = await prisma.tag.update({
    where: { id: tagId },
    data: {
      name,
      slug: targetSlug,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Params }) {
  const session = await getAuthSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { tagId } = await params;

  await prisma.tag.delete({
    where: { id: tagId },
  });

  return new NextResponse(null, { status: 204 });
}

