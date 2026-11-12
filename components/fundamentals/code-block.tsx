import { codeToHtml } from "shiki";
import type { CodeLanguage } from "@/lib/fundamentals/types";
import { Rich } from "./rich-text";
import { CopyButton } from "./copy-button";

const labels: Record<CodeLanguage, string> = { ts: "TypeScript", js: "JavaScript", c: "C", bash: "Shell", json: "JSON", text: "Text" };

export async function CodeBlock({ code, lang, file, note }: { code: string; lang: CodeLanguage; file: string; note?: string }) {
  const source = code.replace(/\n$/, "");
  const html = await codeToHtml(source, { lang, theme: "github-dark" });
  return <div className="course-code">
    <div className="course-code-bar"><span className="course-code-file">{file}</span><span className="course-code-lang">{labels[lang]}</span><CopyButton text={source} /></div>
    <div className="code-panel" tabIndex={0} role="region" aria-label={`${file} source`} dangerouslySetInnerHTML={{ __html: html }} />
    {note ? <p className="course-code-note"><Rich text={note} /></p> : null}
  </div>;
}
