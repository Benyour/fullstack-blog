import { createHash } from "crypto";

export function getRequestFingerprint(request: Request): string {
  const ip =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "0.0.0.0";
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  return createHash("sha256").update(`${ip}:${userAgent}`).digest("hex");
}

export function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  const wordsPerMinute = 200;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

