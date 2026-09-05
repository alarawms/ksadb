"use client";

import { useEffect } from "react";

import type { FilterState } from "@/lib/filterState";

export function FilterButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button type="button" className="btn inline-flex items-center gap-2" onClick={onClick}>
      Filters
      {count > 0 && (
        <span className="rounded-full px-1.5 text-xs font-bold"
          style={{ background: "var(--accent)", color: "#04211d" }}>
          {count}
        </span>
      )}
    </button>
  );
}

interface DrawerProps {
  state: FilterState;
  onChange: (next: FilterState) => void;
  platforms: string[];
  institutions: string[];
  open: boolean;
  onClose: () => void;
}

export function FilterDrawer({ state, onChange, platforms, institutions, open, onClose }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const set = (patch: Partial<FilterState>) => onChange({ ...state, ...patch });
  const togglePlatform = (p: string) =>
    set({
      platforms: state.platforms.includes(p)
        ? state.platforms.filter((x) => x !== p)
        : [...state.platforms, p],
    });

  const section = (title: string, children: React.ReactNode) => (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-dim)]">{title}</h3>
      {children}
    </div>
  );

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      )}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col gap-5 overflow-y-auto border-l p-4 transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Filters</h2>
          <button type="button" className="btn px-2 py-1" onClick={onClose}>✕</button>
        </div>

        {section("Text", (
          <input className="input w-full" placeholder="Accession / organism / center"
            value={state.q} onChange={(e) => set({ q: e.target.value })} />
        ))}

        {section("Organism", (
          <input className="input w-full" placeholder="e.g. Homo sapiens"
            value={state.organism} onChange={(e) => set({ organism: e.target.value })} />
        ))}

        {platforms.length > 0 && section("Platform", (
          <div className="space-y-1">
            {platforms.map((p) => (
              <label key={p} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={state.platforms.includes(p)} onChange={() => togglePlatform(p)} />
                {p}
              </label>
            ))}
          </div>
        ))}

        {section("Institution", (
          <>
            <input className="input w-full" list="ksadb-institutions" placeholder="e.g. KAUST"
              value={state.institution} onChange={(e) => set({ institution: e.target.value })} />
            <datalist id="ksadb-institutions">
              {institutions.map((n) => <option key={n} value={n} />)}
            </datalist>
          </>
        ))}

        {section("Year range", (
          <div className="flex items-center gap-2">
            <input className="input w-full" type="number" placeholder="From" value={state.yearFrom}
              onChange={(e) => set({ yearFrom: e.target.value })} />
            <span className="text-[var(--text-dim)]">–</span>
            <input className="input w-full" type="number" placeholder="To" value={state.yearTo}
              onChange={(e) => set({ yearTo: e.target.value })} />
          </div>
        ))}

        {section("Source", (
          <div className="flex gap-4">
            {["", "NCBI", "ENA"].map((s) => (
              <label key={s || "any"} className="flex items-center gap-1 text-sm">
                <input type="radio" name="ksadb-source" checked={state.source === s} onChange={() => set({ source: s })} />
                {s || "Any"}
              </label>
            ))}
          </div>
        ))}

        {section("Flags", (
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={state.saudiOnly} onChange={(e) => set({ saudiOnly: e.target.checked })} />
              Saudi submitter only
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={state.pathogen} onChange={(e) => set({ pathogen: e.target.checked })} />
              Pathogen only
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={state.wgs} onChange={(e) => set({ wgs: e.target.checked })} />
              Whole-genome only
            </label>
          </div>
        ))}
      </div>
    </>
  );
}
