"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import type { PropsWithChildren } from "react";

export function AuthProvider({ children, session }: PropsWithChildren<{ session: Session | null }>) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}

