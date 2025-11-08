import { NextResponse } from "next/server";
import { renderToString } from "react-dom/server";

import { renderMDX } from "@/lib/mdx";

export async function POST(request: Request) {
  const payload = await request.json();
  const content = (payload as { content?: string }).content;

  if (!content || typeof content !== "string") {
    return NextResponse.json({ message: "内容不能为空" }, { status: 400 });
  }

  try {
    const element = await renderMDX(content);
    const html = renderToString(element);
    return NextResponse.json({ html });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "渲染失败" }, { status: 400 });
  }
}

