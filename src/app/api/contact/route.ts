import { NextResponse } from "next/server";
import { Resend } from "resend";

import { prisma } from "@/lib/prisma";
import { contactFormSchema } from "@/lib/validators/contact";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

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
    const to = process.env.CONTACT_FORWARD_TO.split(",").map((entry) =>
      entry.trim(),
    );
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "no-reply@your-domain.com",
      to,
      subject: `新的站内联系：${name}`,
      html: `
        <div style="font-family: sans-serif;">
          <p><strong>姓名：</strong> ${name}</p>
          <p><strong>邮箱：</strong> ${email}</p>
          <p><strong>留言：</strong></p>
          <p>${message.replace(/\n/g, "<br />")}</p>
        </div>
      `,
    });
  }

  return NextResponse.json({ id: record.id }, { status: 201 });
}

