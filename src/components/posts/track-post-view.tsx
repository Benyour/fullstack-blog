"use client";

import { useEffect } from "react";

type TrackPostViewProps = {
  slug: string;
};

export function TrackPostView({ slug }: TrackPostViewProps) {
  useEffect(() => {
    const controller = new AbortController();

    async function track() {
      try {
        await fetch("/api/analytics/page-view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ slug }),
          signal: controller.signal,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Track view failed", error);
        }
      }
    }

    track();

    return () => {
      controller.abort();
    };
  }, [slug]);

  return null;
}

