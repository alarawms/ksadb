// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import FacetRail, { type FacetGroups } from "./FacetRail";

afterEach(cleanup);

const GROUPS: FacetGroups = {
  domain: [{ value: "human", count: 3 }, { value: "other", count: 2 }],
  region: [{ value: "Riyadh", count: 120 }, { value: "Jeddah", count: 40 }],
  platform: [{ value: "ILLUMINA", count: 9000 }, { value: "OXFORD_NANOPORE", count: 300 }],
  years: [2024, 2023],
};

describe("FacetRail", () => {
  it("renders chips for every group", () => {
    render(<FacetRail facets={GROUPS} active={{}} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /human \(3\)/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Riyadh \(120\)/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /ILLUMINA \(9,000\)/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: "2024" })).toBeTruthy();
  });

  it("clicking a chip calls onChange with the facet set", () => {
    const onChange = vi.fn();
    render(<FacetRail facets={GROUPS} active={{}} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /human \(3\)/ }));
    expect(onChange).toHaveBeenCalledWith({ domain: "human" });
    fireEvent.click(screen.getByRole("button", { name: "2023" }));
    expect(onChange).toHaveBeenCalledWith({ year: 2023 });
  });

  it("clicking an active chip calls onChange with it cleared", () => {
    const onChange = vi.fn();
    render(<FacetRail facets={GROUPS} active={{ domain: "human" }} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /human \(3\)/ }));
    expect(onChange).toHaveBeenCalledWith({});
  });

  it("active chip has the badge-accent class", () => {
    render(<FacetRail facets={GROUPS} active={{ platform: "ILLUMINA" }} onChange={() => {}} />);
    const chip = screen.getByRole("button", { name: /ILLUMINA \(9,000\)/ });
    expect(chip.className).toContain("badge-accent");
    expect(screen.getByRole("button", { name: /OXFORD_NANOPORE \(300\)/ }).className)
      .not.toContain("badge-accent");
  });

  it("links to /search with the equivalent params when a facet is active", () => {
    render(<FacetRail facets={GROUPS}
      active={{ region: "Riyadh", platform: "ILLUMINA", year: 2023 }}
      onChange={() => {}} />);
    const link = screen.getByRole("link", { name: /matching runs/ }) as HTMLAnchorElement;
    expect(link.pathname).toBe("/search");
    const qs = new URLSearchParams(link.search);
    expect(qs.get("region")).toBe("Riyadh");
    expect(qs.get("platform")).toBe("ILLUMINA");
    expect(qs.get("from")).toBe("2023-01-01");
    expect(qs.get("to")).toBe("2023-12-31");
  });

  it("hides the search link when nothing is active", () => {
    render(<FacetRail facets={GROUPS} active={{}} onChange={() => {}} />);
    expect(screen.queryByRole("link", { name: /matching runs/ })).toBeNull();
  });
});
