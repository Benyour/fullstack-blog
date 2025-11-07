"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavigationItem = {
  href: string;
  label: string;
};

export function NavigationLinks({ items }: { items: NavigationItem[] }) {
  const pathname = usePathname();

  const normalizedPath = useMemo(() => pathname.replace(/\/$/, "") || "/", [pathname]);

  return (
    <div className="relative flex items-center gap-2">
      {items.map((item) => {
        const normalizedHref = item.href.replace(/\/$/, "");
        const isActive = normalizedHref === "/#contact"
          ? normalizedPath === "/"
          : normalizedHref === normalizedPath || (normalizedHref !== "/" && normalizedPath.startsWith(normalizedHref));

        return (
          <motion.div key={item.href} className="relative" whileTap={{ scale: 0.96 }}>
            {isActive ? (
              <motion.span
                layoutId="nav-active-indicator"
                className="absolute inset-0 rounded-full bg-[var(--accent)]/12"
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
              />
            ) : null}
            <Link
              href={item.href}
              className="relative inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              prefetch
            >
              {item.label}
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}


