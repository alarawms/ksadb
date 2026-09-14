import { afterEach, describe, expect, it, vi } from "vitest";
import { applyStoredTheme, setTheme, THEME_KEY } from "./theme";

function fakeDoc() {
  return { documentElement: { dataset: {} } } as unknown as Document;
}

function stubStorage(value: string | null) {
  vi.stubGlobal("localStorage", {
    getItem: vi.fn(() => value),
    setItem: vi.fn(),
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("theme", () => {
  it("defaults to dark when nothing is stored", () => {
    stubStorage(null);
    const doc = fakeDoc();
    expect(applyStoredTheme(doc)).toBe("dark");
    expect(doc.documentElement.dataset.theme).toBe("dark");
  });

  it("applies a stored light theme", () => {
    stubStorage("light");
    const doc = fakeDoc();
    expect(applyStoredTheme(doc)).toBe("light");
    expect(doc.documentElement.dataset.theme).toBe("light");
  });

  it("ignores stored garbage", () => {
    stubStorage("solarized");
    expect(applyStoredTheme(fakeDoc())).toBe("dark");
  });

  it("setTheme persists and applies", () => {
    const setItem = vi.fn();
    vi.stubGlobal("localStorage", { getItem: () => null, setItem });
    const doc = fakeDoc();
    setTheme("light", doc);
    expect(setItem).toHaveBeenCalledWith(THEME_KEY, "light");
    expect(doc.documentElement.dataset.theme).toBe("light");
  });
});
