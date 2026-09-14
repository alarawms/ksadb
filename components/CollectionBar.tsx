"use client";

import Link from "next/link";

import { collectionBytes, type CollectionItem } from "@/lib/collection";
import { formatGb } from "@/lib/format";

export function CollectionBar({ items }: { items: CollectionItem[] }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t md:left-56"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between gap-4 px-4 py-2 text-sm">
        <Link className="link" href="/collection">
          Collection ({items.length} {items.length === 1 ? "item" : "items"}, ~{formatGb(collectionBytes(items))})
        </Link>
        <Link className="btn" href="/collection">Review &amp; export</Link>
      </div>
    </div>
  );
}
