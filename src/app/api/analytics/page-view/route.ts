import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function startOfDay(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

export async function POST(request: Request) {
  const payload = await request.json();
  const { slug } = payload as { slug?: string };

  if (!slug) {
    return NextResponse.json({ message: "缺少 slug 参数" }, { status: 400 });
  }

  const today = startOfDay(new Date());

  const record = await prisma.pageView.upsert({
    where: {
      slug_date: {
        slug,
        date: today,
      },
    },
    update: {
      views: { increment: 1 },
    },
    create: {
      slug,
      date: today,
      views: 1,
    },
  });

  return NextResponse.json(record);
}

