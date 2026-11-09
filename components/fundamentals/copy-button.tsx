"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState("Copy");
  async function copy() {
    try { await navigator.clipboard.writeText(text); setState("Copied"); }
    catch { setState("Select to copy"); }
    window.setTimeout(() => setState("Copy"), 1600);
  }
  return <button type="button" className="course-copy" onClick={copy} aria-live="polite">{state}</button>;
}
