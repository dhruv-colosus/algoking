"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

export default function SettingsPage() {
  const [hints, setHints] = useState(true);
  const [focus, setFocus] = useState(false);
  const [language, setLanguage] = useState("Python");
  return <div className="page-content"><div className="page-heading"><div><span className="eyebrow">MAKE IT YOURS</span><h1>Your workspace, your way</h1><p>A few small preferences for a more comfortable practice session.</p></div></div><section className="panel settings-panel"><div className="section-heading"><div><h2>Practice preferences</h2><p>These preferences apply to this preview session.</p></div><Icon name="settings" size={18} /></div><div className="setting-row"><div><h3>Preferred language</h3><p>Choose the language you like to think in.</p></div><select className="filter-select" value={language} onChange={(event) => setLanguage(event.target.value)} aria-label="Preferred programming language"><option>Python</option><option>JavaScript</option><option>TypeScript</option><option>Java</option><option>C++</option></select></div><div className="setting-row"><div><h3>Gentle hints</h3><p>Keep the starting hint available when you need a nudge.</p></div><button className={`switch${hints ? " is-on" : ""}`} type="button" role="switch" aria-checked={hints} aria-label="Gentle hints" onClick={() => setHints(!hints)}><span /></button></div><div className="setting-row"><div><h3>Focus preference</h3><p>Save your preference for a distraction-free practice view.</p></div><button className={`switch${focus ? " is-on" : ""}`} type="button" role="switch" aria-checked={focus} aria-label="Focus preference" onClick={() => setFocus(!focus)}><span /></button></div></section><div className="settings-note"><Icon name="book" size={18} /><p>Designed to keep the learning simple. No account needed for this preview.</p></div></div>;
}
