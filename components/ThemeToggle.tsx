"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem("turbolev-theme") as Theme | null;
    const initial: Theme = stored === "light" || stored === "dark" ? stored : "dark";
    document.documentElement.dataset.theme = initial;
    setTheme(initial);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("turbolev-theme", next);
    setTheme(next);
  }

  return (
    <button className="theme-toggle" type="button" onClick={toggle} aria-label="Перемкнути тему">
      <span aria-hidden="true">{theme === "dark" ? "☾" : "☀"}</span>
      <small>{theme === "dark" ? "ТЕМНА" : "СВІТЛА"}</small>
    </button>
  );
}
