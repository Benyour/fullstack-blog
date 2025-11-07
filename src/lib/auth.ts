import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { UserRole } from "@prisma/client";
import { NextAuthOptions, getServerSession } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";
import { Resend } from "resend";

import { prisma } from "./prisma";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    EmailProvider({
      from: process.env.EMAIL_FROM,
      maxAge: 60 * 60, // 1 hour
      sendVerificationRequest: async ({ identifier, url }) => {
        if (!resend) {
          console.warn("RESEND_API_KEY is not set. Magic link:", url);
          return;
        }

        await resend.emails.send({
          from: process.env.EMAIL_FROM ?? "no-reply@your-domain.com",
          to: identifier,
          subject: "Sign in to your dashboard",
          html: `
            <div style="font-family: sans-serif;">
              <p>Hi there,</p>
              <p>Click the button below to sign in. This link will expire in 60 minutes.</p>
              <p><a href="${url}" style="padding: 12px 20px; background: #0f172a; color: #ffffff; border-radius: 6px; display: inline-block;">Sign in</a></p>
              <p>If you did not request this email, you can safely ignore it.</p>
            </div>
          `,
          text: `Sign in to your dashboard: ${url}`,
        });
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role as UserRole;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      const totalUsers = await prisma.user.count();

      if (totalUsers === 1) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" },
        });
      }

      await prisma.profile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          headline: "前端开发者",
          bio: "",
          location: "",
        },
        update: {},
      });
    },
  },
  pages: {
    signIn: "/login",
  },
};

export const getAuthSession = () => getServerSession(authOptions);

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      role?: UserRole;
      image?: string | null;
    };
  }

  interface User {
    role: UserRole;
  }
}

