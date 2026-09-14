"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/explore", label: "Explore" },
  { href: "/insights", label: "Insights" },
  { href: "/collection", label: "Collection" },
  { href: "/search", label: "Search" },
  { href: "/samples", label: "Samples" },
  { href: "/pathogens", label: "Pathogens" },
  { href: "/genomes", label: "Genomes" },
  { href: "/human", label: "Human" },
  { href: "/compare", label: "Compare" },
  { href: "/institution", label: "Institutions" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`rounded px-3 py-2 text-sm ${
              active ? "font-semibold" : "text-[var(--text-dim)] hover:text-[var(--text)]"
            }`}
            style={active ? { background: "var(--accent-dim)", color: "var(--accent)" } : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            className="btn px-2 py-1 md:hidden"
            aria-label="Toggle navigation"
            onClick={() => setOpen(!open)}
          >
            ☰
          </button>
          <Link href="/dashboard" className="text-lg font-bold tracking-tight">
            KSADB
          </Link>
          <form method="GET" action="/search" className="ml-auto w-full max-w-xs">
            <input
              name="q"
              placeholder="Search runs, organisms, centers…"
              className="input w-full"
            />
          </form>
          <span className="badge badge-accent shrink-0"
            title="All list views are filtered to ENA country=SA">
            Saudi scope
          </span>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex">
        <aside
          className="sticky top-[53px] hidden h-[calc(100vh-53px)] w-56 shrink-0 overflow-y-auto border-r md:block"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          {nav}
        </aside>
        {open && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
            <aside
              className="absolute inset-y-0 left-0 w-56"
              style={{ background: "var(--surface)", borderRight: "1px solid var(--border)" }}
            >
              {nav}
            </aside>
          </div>
        )}
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
