"use client";

import { useRef, type KeyboardEvent } from "react";

/** A small radio group styled as a segmented control, with arrow-key support. */
export function Segmented({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (value: string) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  function onKeyDown(event: KeyboardEvent, index: number) {
    if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const next = (index + step + options.length) % options.length;
    onChange(options[next][0]);
    refs.current[next]?.focus();
  }
  return <div className="fx-segmented" role="radiogroup" aria-label={label}>
    {options.map(([key, text], index) => <button key={key} ref={(node) => { refs.current[index] = node; }} type="button" role="radio" aria-checked={value === key} tabIndex={value === key ? 0 : -1} onClick={() => onChange(key)} onKeyDown={(event) => onKeyDown(event, index)}>{text}</button>)}
  </div>;
}
