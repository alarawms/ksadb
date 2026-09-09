// lib/exporters.test.ts
import { describe, expect, it } from "vitest";
import { toCurlScript, toSamplesheet, toSraToolsScript } from "./exporters";
import type { CollectionItem } from "./collection";

const run = (acc: string, ftp: string | null = `ftp.sra/${acc}/${acc}_1.fastq.gz;ftp.sra/${acc}/${acc}_2.fastq.gz`): CollectionItem => ({
  accession: acc, type: "run", fastq_ftp: ftp, fastq_md5: "m1;m2",
  fastq_bytes: 1000, organism: "X", country: "SA",
});

describe("exporters", () => {
  it("curl script splits paired reads and verifies md5", () => {
    const s = toCurlScript([run("ERR1")]);
    expect(s).toContain("curl -O https://ftp.sra/ERR1/ERR1_1.fastq.gz");
    expect(s).toContain("curl -O https://ftp.sra/ERR1/ERR1_2.fastq.gz");
    expect(s).toContain("md5sum");
  });
  it("sra-tools script prefetches accessions", () => {
    expect(toSraToolsScript([run("ERR1"), run("ERR2")]))
      .toContain("prefetch ERR1 ERR2");
  });
  it("samplesheet maps _1/_2 pairs", () => {
    const csv = toSamplesheet([run("ERR1")]);
    expect(csv).toContain("sample,fastq_1,fastq_2");
    expect(csv).toContain("ERR1,https://ftp.sra/ERR1/ERR1_1.fastq.gz,https://ftp.sra/ERR1/ERR1_2.fastq.gz");
  });
  it("skips runs without fastq_ftp with a comment", () => {
    expect(toCurlScript([run("ERR9", null)])).toContain("skipped 1");
  });
});
