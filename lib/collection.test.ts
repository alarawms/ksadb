// lib/collection.test.ts
import { describe, expect, it } from "vitest";
import { collectionBytes, toggleItem, addItems, type CollectionItem } from "./collection";

const item = (acc: string, bytes = 1000): CollectionItem => ({
  accession: acc, type: "run", fastq_ftp: `ftp.example/${acc}.fastq.gz`,
  fastq_md5: "abc", fastq_bytes: bytes, organism: "X", country: "SA",
});

describe("collection", () => {
  it("toggles items by accession", () => {
    const one = toggleItem([], item("ERR1"));
    expect(one).toHaveLength(1);
    expect(toggleItem(one, item("ERR1"))).toHaveLength(0);
    expect(toggleItem(one, item("ERR2"))).toHaveLength(2);
  });
  it("addItems only appends missing accessions, never removes", () => {
    const one = [item("ERR1")];
    expect(addItems(one, [item("ERR1"), item("ERR2")])).toHaveLength(2);
    expect(addItems(one, [item("ERR1")])).toHaveLength(1);
    expect(addItems([], [])).toHaveLength(0);
  });
  it("sums bytes", () => {
    expect(collectionBytes([item("A", 1000), item("B", 500)])).toBe(1500);
  });
});
