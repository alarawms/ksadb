// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Inspector from "./Inspector";
import type { DetailPayload, GraphNode } from "./graph-layout";

afterEach(cleanup);

function studyNode(): GraphNode {
  return { id: "study:A", type: "study", label: "A", link: "/study?id=A" };
}

describe("Inspector", () => {
  it("renders study detail fields and actions", () => {
    const onFocus = vi.fn();
    render(<Inspector node={studyNode()}
      detail={{ type: "study", accession: "A", title: "T", runs: 3, bytes: 100, top_organisms: [{ name: "Homo sapiens", runs: 3 }], platforms: ["ILLUMINA"] } as DetailPayload}
      onClose={() => {}} onFocus={onFocus} onOpen={() => {}} onSearch={() => {}} />);
    expect(screen.getByText("Homo sapiens")).toBeTruthy();
    expect(screen.getByText("3 runs")).toBeTruthy();
    fireEvent.click(screen.getByText("Focus graph"));
    expect(onFocus).toHaveBeenCalledWith("study:A");
  });

  it("close button calls onClose and Open page calls onOpen with node.link", () => {
    const onClose = vi.fn();
    const onOpen = vi.fn();
    render(<Inspector node={studyNode()}
      detail={{ type: "study", accession: "A" } as DetailPayload}
      onClose={onClose} onFocus={() => {}} onOpen={onOpen} onSearch={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Open page" }));
    expect(onOpen).toHaveBeenCalledWith("/study?id=A");
  });

  it("disables Open page when the node has no link", () => {
    render(<Inspector node={{ id: "term:T1", type: "term", label: "T1" }}
      detail={{ type: "term", id: "T1", label: "L", runs: 1, samples: 2, top_studies: [] } as DetailPayload}
      onClose={() => {}} onFocus={() => {}} onOpen={() => {}} onSearch={() => {}} />);
    expect((screen.getByRole("button", { name: "Open page" }) as HTMLButtonElement).disabled).toBe(true);
    // term nodes have no search mapping — the button is omitted
    expect(screen.queryByRole("button", { name: /View runs in search/ })).toBeNull();
  });

  it("View runs in search maps node types to search hrefs", () => {
    const onSearch = vi.fn();
    const { rerender } = render(<Inspector
      node={{ id: "organism:Homo sapiens", type: "organism", label: "Homo sapiens" }}
      detail={{ type: "organism", name: "Homo sapiens", studies: 1, runs: 2 } as DetailPayload}
      onClose={() => {}} onFocus={() => {}} onOpen={() => {}} onSearch={onSearch} />);
    fireEvent.click(screen.getByRole("button", { name: "View runs in search" }));
    expect(onSearch).toHaveBeenCalledWith("/search?organism=Homo%20sapiens");

    rerender(<Inspector node={{ id: "sample:SAMEA1", type: "sample", label: "SAMEA1" }}
      detail={{ type: "sample", accession: "SAMEA1", runs: 1, bytes: 0 } as DetailPayload}
      onClose={() => {}} onFocus={() => {}} onOpen={() => {}} onSearch={onSearch} />);
    fireEvent.click(screen.getByRole("button", { name: "View runs in search" }));
    expect(onSearch).toHaveBeenCalledWith("/search?q=SAMEA1");
  });

  it("falls back to em dash for missing values", () => {
    render(<Inspector node={{ id: "sample:SAMEA1", type: "sample", label: "SAMEA1" }}
      detail={null}
      onClose={() => {}} onFocus={() => {}} onOpen={() => {}} onSearch={() => {}} />);
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });
});
