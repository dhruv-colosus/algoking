"use client";

import Button from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function StepControls({ index, total, onChange }: { index: number; total: number; onChange: (next: number) => void }) {
  const last = index === total - 1;
  return <div className="fx-step-controls">
    <span className="fx-step-count">Step {String(index + 1).padStart(2, "0")} <span>/ {total}</span></span>
    <div className="fx-buttons">
      <Button variant="ghost" size="sm" disabled={index === 0} onClick={() => onChange(index - 1)}><Icon name="arrow-right" className="back-icon" size={13} />Previous</Button>
      <Button variant={last ? "secondary" : "primary"} size="sm" onClick={() => onChange(last ? 0 : index + 1)}>{last ? "Start again" : "Next step"}<Icon name={last ? "shuffle" : "arrow-right"} size={13} /></Button>
    </div>
  </div>;
}

export const kb = (bytes: number) => bytes >= 1e6 ? `${(bytes / 1e6).toFixed(bytes >= 1e7 ? 0 : 1)} MB` : bytes >= 1e3 ? `${(bytes / 1e3).toFixed(bytes >= 1e4 ? 0 : 1)} KB` : `${Math.round(bytes)} B`;
export const ms = (value: number) => value >= 1000 ? `${(value / 1000).toFixed(2)} s` : `${Math.round(value)} ms`;
export const hex2 = (n: number) => n.toString(16).toUpperCase().padStart(2, "0");
