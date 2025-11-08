import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = formData.get("folder")?.toString() ?? "uploads";

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "请上传合法的文件" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ message: "目前仅支持图片上传" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseClient();
    const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "media";
    const fileExt = file.name.split(".").pop();
    const timestamp = Date.now();
    const path = `${folder}/${timestamp}-${Math.random().toString(36).slice(2)}.${fileExt ?? "png"}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

    if (error) {
      throw error;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);

    return NextResponse.json({ url: publicUrl, path });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "上传失败" }, { status: 500 });
  }
}

