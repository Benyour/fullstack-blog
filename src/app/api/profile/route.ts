import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validators/profile";

export async function GET() {
  const profile = await prisma.profile.findFirst({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!profile) {
    return NextResponse.json(null);
  }

  return NextResponse.json({
    id: profile.id,
    headline: profile.headline,
    bio: profile.bio,
    location: profile.location,
    avatarUrl: profile.avatarUrl,
    heroImage: profile.heroImage,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    user: profile.user,
  });
}

export async function PUT(request: Request) {
  const session = await getAuthSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const payload = await request.json();
  const data = updateProfileSchema.safeParse(payload);

  if (!data.success) {
    return NextResponse.json({ errors: data.error.flatten() }, { status: 400 });
  }

  const { userName, userEmail, ...profileInput } = data.data;

  const profile = await prisma.profile.findFirst();

  let userId = session.user.id;

  if (!profile) {
    const created = await prisma.profile.create({
      data: {
        userId: session.user.id,
        ...normalizeProfileInput(profileInput),
      },
    });

    if (userName || userEmail) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: userName ?? undefined,
          email: userEmail ?? undefined,
        },
      });
    }

    return NextResponse.json(created);
  }

  userId = profile.userId;

  const updated = await prisma.profile.update({
    where: { id: profile.id },
    data: {
      ...normalizeProfileInput(profileInput),
    },
  });

  if (userName || userEmail) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: userName ?? undefined,
        email: userEmail ?? undefined,
      },
    });
  }

  return NextResponse.json(updated);
}

function normalizeProfileInput(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, value === "" ? null : value]),
  );
}

