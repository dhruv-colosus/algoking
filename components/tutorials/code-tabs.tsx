"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Button from "@/components/ui/button";

type Language = "python" | "cpp";
const languages: Language[] = ["python", "cpp"];

export function CodeTabs({ python, cpp, source, filename = "binary_search", label = "Iterative binary search" }: { python: ReactNode; cpp: ReactNode; source: Record<Language, string>; filename?: string; label?: string }) {
  const [language, setLanguage] = useState<Language>("python");
  const [copyState, setCopyState] = useState("");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();

  function onTabKeyDown(event: KeyboardEvent, index: number) {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? 1 : (index + 1) % 2;
    setLanguage(languages[next]);
    setCopyState("");
    tabs.current[next]?.focus();
  }

  async function copyCode() {
    try { await navigator.clipboard.writeText(source[language]); setCopyState("Copied"); }
    catch { setCopyState("Select code to copy"); }
  }

  return <div className="code-window">
    <div className="code-toolbar"><div role="tablist" aria-label="Solution language">{languages.map((lang, index) => <button key={lang} ref={(node) => { tabs.current[index] = node; }} type="button" role="tab" id={`${id}-${lang}-tab`} aria-controls={`${id}-${lang}-panel`} aria-selected={language === lang} tabIndex={language === lang ? 0 : -1} onClick={() => { setLanguage(lang); setCopyState(""); }} onKeyDown={(event) => onTabKeyDown(event, index)}>{lang === "python" ? "Python" : "C++"}</button>)}</div><Button variant="ghost" onClick={copyCode}>{copyState || "Copy code"}</Button></div>
    {languages.map((lang) => <div key={lang} role="tabpanel" id={`${id}-${lang}-panel`} aria-labelledby={`${id}-${lang}-tab`} hidden={language !== lang} tabIndex={0} className="code-panel">{lang === "python" ? python : cpp}</div>)}
    <div className="code-footer"><span>{filename}.{language === "python" ? "py" : "cpp"}</span><span role="status">{copyState || label}</span></div>
  </div>;
}
