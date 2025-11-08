import { NextResponse } from "next/server";
import { SubscriptionStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { subscribeSchema, unsubscribeSchema } from "@/lib/validators/newsletter";

export async function POST(request: Request) {
  const payload = await request.json();
  const data = subscribeSchema.safeParse(payload);

  if (!data.success) {
    return NextResponse.json({ errors: data.error.flatten() }, { status: 400 });
  }

  const { email } = data.data;

  const subscription = await prisma.newsletterSubscription.upsert({
    where: { email },
    update: {
      status: SubscriptionStatus.ACTIVE,
      unsubscribedAt: null,
    },
    create: {
      email,
    },
  });

  return NextResponse.json(subscription, { status: 201 });
}

export async function DELETE(request: Request) {
  const payload = await request.json();
  const data = unsubscribeSchema.safeParse(payload);

  if (!data.success) {
    return NextResponse.json({ errors: data.error.flatten() }, { status: 400 });
  }

  const { email } = data.data;

  const subscription = await prisma.newsletterSubscription.updateMany({
    where: { email },
    data: {
      status: SubscriptionStatus.UNSUBSCRIBED,
      unsubscribedAt: new Date(),
    },
  });

  if (subscription.count === 0) {
    return NextResponse.json({ message: "尚未订阅" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

