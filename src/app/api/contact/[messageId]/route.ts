import { NextResponse } from "next/server";
import { ContactStatus } from "@prisma/client";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = Promise<{
  messageId: string;
}>;

const updateMessageSchema = z.object({
  status: z.nativeEnum(ContactStatus).optional(),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export async function PATCH(request: Request, { params }: { params: Params }) {
  const session = await getAuthSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { messageId } = await params;
  const payload = await request.json();
  const data = updateMessageSchema.safeParse(payload);

  if (!data.success) {
    return NextResponse.json({ errors: data.error.flatten() }, { status: 400 });
  }

  const { status, notes } = data.data;

  const updated = await prisma.contactMessage.update({
    where: { id: messageId },
    data: {
      status: status ?? undefined,
      notes: notes === "" ? null : notes,
      resolvedAt: status === ContactStatus.RESOLVED ? new Date() : undefined,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Params }) {
  const session = await getAuthSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { messageId } = await params;

  await prisma.contactMessage.delete({
    where: { id: messageId },
  });

  return new NextResponse(null, { status: 204 });
}

