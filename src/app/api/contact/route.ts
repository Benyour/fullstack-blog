import { NextResponse } from "next/server";
import { Resend } from "resend";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { contactFormSchema } from "@/lib/validators/contact";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function GET(request: Request) {
  const session = await getAuthSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const take = Number(searchParams.get("take") ?? 50);

  const messages = await prisma.contactMessage.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take,
  });

  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const data = contactFormSchema.safeParse(payload);

  if (!data.success) {
    return NextResponse.json({ errors: data.error.flatten() }, { status: 400 });
  }

  const { name, email, message } = data.data;

  const record = await prisma.contactMessage.create({
    data: { name, email, message },
  });

  if (resend && process.env.CONTACT_FORWARD_TO) {
    const to = process.env.CONTACT_FORWARD_TO.split(",").map((entry) => entry.trim());
    const formattedMessage = message.replace(/\n/g, "<br />");
    const html = [
      '<div style="font-family: sans-serif;">',
      `<p><strong>姓名：</strong> ${name}</p>`,
      `<p><strong>邮箱：</strong> ${email}</p>`,
      "<p><strong>留言：</strong></p>",
      `<p>${formattedMessage}</p>`,
      "</div>",
    ].join("");

    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "no-reply@your-domain.com",
      to,
      subject: `新的站内联系：${name}`,
      html,
    });
  }

  return NextResponse.json({ id: record.id }, { status: 201 });
}