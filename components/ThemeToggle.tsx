"use client";

import { useEffect, useState } from "react";
import { applyStoredTheme, setTheme, type Theme } from "@/lib/theme";

export function ThemeToggle() {
  const [theme, setState] = useState<Theme>("dark");

  useEffect(() => {
    setState(applyStoredTheme());
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setState(next);
  };

  return (
    <button
      type="button"
      className="btn px-2 py-1"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}
