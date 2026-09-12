import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  // tsconfig uses jsx: "preserve" for Next's SWC; without this, vitest's
  // esbuild pass compiles JSX to React.createElement (classic runtime) and
  // components that don't import React blow up under test.
  esbuild: { jsx: "automatic", jsxImportSource: "react" },
  test: {
    // deploy/podman/pages-root/functions is a symlink back to functions/ for
    // the local pages:dev scaffold — don't run every test twice.
    exclude: [...configDefaults.exclude, "deploy/podman/pages-root/**"],
  },
});
