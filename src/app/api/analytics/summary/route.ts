import { NextResponse } from "next/server";
import { ContactStatus, SubscriptionStatus } from "@prisma/client";
import { subDays } from "date-fns";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAuthSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const last7Days = subDays(now, 6);
  const last30Days = subDays(now, 29);

  const [viewsSum, viewsLastWeek, topPages, totalSubscribers, newSubscribers, pendingMessages, totalComments, pendingComments] =
    await Promise.all([
      prisma.pageView.aggregate({
        _sum: { views: true },
      }),
      prisma.pageView.findMany({
        where: { date: { gte: last7Days } },
        orderBy: { date: "asc" },
      }),
      prisma.pageView.groupBy({
        by: ["slug"],
        _sum: { views: true },
        orderBy: { _sum: { views: "desc" } },
        take: 5,
      }),
      prisma.newsletterSubscription.count({
        where: { status: SubscriptionStatus.ACTIVE },
      }),
      prisma.newsletterSubscription.count({
        where: {
          status: SubscriptionStatus.ACTIVE,
          createdAt: { gte: last30Days },
        },
      }),
      prisma.contactMessage.count({
        where: {
          status: {
            in: [ContactStatus.NEW, ContactStatus.IN_PROGRESS],
          },
        },
      }),
      prisma.comment.count({
        where: { approved: true },
      }),
      prisma.comment.count({
        where: { approved: false },
      }),
    ]);

  return NextResponse.json({
    totals: {
      views: viewsSum._sum.views ?? 0,
      subscribers: totalSubscribers,
      comments: totalComments,
      pendingComments,
      pendingMessages,
      newSubscribersLast30Days: newSubscribers,
    },
    viewsLast7Days: viewsLastWeek.map((entry) => ({
      date: entry.date,
      views: entry.views,
    })),
    topPages: topPages.map((page) => ({
      slug: page.slug,
      views: page._sum.views ?? 0,
    })),
  });
}

