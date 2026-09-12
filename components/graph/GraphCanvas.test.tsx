// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import GraphCanvas from "./GraphCanvas";
import type { GraphData } from "./graph-layout";

afterEach(cleanup);

const fixture: GraphData = {
  nodes: [
    { id: "study-1", type: "study", label: "Study Alpha", count: 12, link: "/study/1" },
    { id: "sample-1", type: "sample", label: "Sample Beta", count: 3 },
  ],
  edges: [
    { source: "study-1", target: "sample-1", kind: "has_sample", count: 3 },
  ],
};

async function renderCanvas() {
  const onNodeClick = vi.fn();
  const utils = render(<GraphCanvas data={fixture} filter="all" onNodeClick={onNodeClick} />);
  // Nodes enter the DOM only after the simulation's first tick.
  await waitFor(() => {
    expect(utils.container.querySelectorAll("g.graph-node").length).toBe(2);
  });
  return { onNodeClick, ...utils };
}

describe("GraphCanvas", () => {
  it("renders nodes and edges from the fixture graph", async () => {
    const { container } = await renderCanvas();
    expect(container.querySelectorAll("g.graph-node").length).toBe(2);
    expect(container.querySelectorAll("line").length).toBe(1);
  });

  it("search input filters and shows matches", async () => {
    await renderCanvas();
    const input = screen.getByLabelText("Find node");
    fireEvent.change(input, { target: { value: "beta" } });
    expect(await screen.findByRole("button", { name: /Sample Beta/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Study Alpha/ })).toBeNull();
  });

  it("Enter selects the first match and Escape clears the query", async () => {
    await renderCanvas();
    const input = screen.getByLabelText("Find node") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "alpha" } });
    await screen.findByRole("button", { name: /Study Alpha/ });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input.value).toBe("");
    fireEvent.change(input, { target: { value: "beta" } });
    await screen.findByRole("button", { name: /Sample Beta/ });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input.value).toBe("");
  });

  it("shows tooltip content on node hover", async () => {
    await renderCanvas();
    const node = document.querySelector("g.graph-node") as SVGGElement;
    fireEvent.mouseEnter(node);
    expect(await screen.findByText("click to open")).toBeTruthy();
    expect(screen.getAllByText("Study Alpha").length).toBeGreaterThan(0);
    fireEvent.mouseLeave(node);
    await waitFor(() => expect(screen.queryByText("click to open")).toBeNull());
  });

  it("zoom control buttons mutate the <g> transform", async () => {
    const { container } = await renderCanvas();
    const g = container.querySelector("svg > g") as SVGGElement;
    const before = g.getAttribute("transform");
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    await waitFor(() => {
      expect(g.getAttribute("transform")).not.toBe(before);
    });
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Fit" })).toBeTruthy();
  });

  it("mouse drag on a node does not throw and does not swallow clicks", async () => {
    const errors: Error[] = [];
    window.addEventListener("error", (e) => errors.push(e.error as Error));
    const { container, onNodeClick } = await renderCanvas();
    const node = container.querySelector("g.graph-node") as SVGGElement;
    // happy-dom's SVGPoint lacks matrixTransform, which d3-selection's pointer
    // math needs; stub the svg geometry so d3-drag can compute a position.
    const svg = container.querySelector("svg") as SVGSVGElement;
    svg.createSVGPoint = () =>
      ({ x: 0, y: 0, matrixTransform: () => ({ x: 0, y: 0 }) }) as unknown as DOMPoint;
    svg.getScreenCTM = () => ({ inverse: () => ({}) }) as unknown as DOMMatrix;
    // Regression pin for the d3 datum join: without __data__ on the <g>, the
    // drag start handler throws on d.fx and the end handler's setTimeout never
    // resets draggedRef, permanently swallowing node clicks.
    fireEvent.mouseDown(node, { button: 0, clientX: 10, clientY: 10, view: window });
    fireEvent.mouseMove(window, { clientX: 30, clientY: 30 });
    fireEvent.mouseUp(window, { view: window });
    expect(errors).toEqual([]);
    // draggedRef resets in the drag-end handler's setTimeout(0); in a real
    // browser mouseup and click are separate tasks, so yield a macrotask.
    await new Promise((r) => setTimeout(r, 0));
    fireEvent.click(node);
    expect(onNodeClick).toHaveBeenCalledTimes(1);
  });
});
