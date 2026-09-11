import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // deploy/podman/pages-root/functions is a symlink back to functions/ for
    // the local pages:dev scaffold — don't run every test twice.
    exclude: [...configDefaults.exclude, "deploy/podman/pages-root/**"],
  },
});
