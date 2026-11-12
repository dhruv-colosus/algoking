import { Icon, type IconName } from "@/components/ui/icon";
import type { Block, CalloutTone } from "@/lib/fundamentals/types";
import { CodeBlock } from "./code-block";
import { figures } from "./figures";
import { Rich } from "./rich-text";

const calloutIcons: Record<CalloutTone, [IconName, string]> = {
  harness: ["workflow", "In a harness"],
  trap: ["target", "Watch out"],
  now: ["sparkles", "Current"],
  analogy: ["help", "Think of it like this"],
};

export const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function RenderBlock({ block, figureLabel }: { block: Block; figureLabel?: string }) {
  switch (block.kind) {
    case "p": return <p className="course-p"><Rich text={block.text} /></p>;
    case "h": return <h2 id={slugify(block.text)} className="course-h">{block.text}</h2>;
    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return <List className="course-list">{block.items.map((item) => <li key={item}><Rich text={item} /></li>)}</List>;
    }
    case "figure": {
      const Figure = figures[block.figure];
      return <figure className="fx-figure">
        <div className="fx-figure-head"><span className="fx-figure-label">{figureLabel}</span><h3>{block.title}</h3></div>
        <div className="fx-figure-body"><Figure /></div>
        <figcaption><Rich text={block.caption} /></figcaption>
      </figure>;
    }
    case "code": return <CodeBlock code={block.code} lang={block.lang} file={block.file} note={block.note} />;
    case "callout": {
      const [icon, label] = calloutIcons[block.tone];
      return <aside className={`course-callout is-${block.tone}`}><Icon name={icon} size={16} /><div><span className="course-callout-label">{label}</span><strong>{block.title}</strong><p><Rich text={block.text} /></p></div></aside>;
    }
    case "table": return <div className="course-table-scroll" role="region" aria-label={`Table: ${block.head.join(", ")}`} tabIndex={0}><table className="course-table"><thead><tr>{block.head.map((cell, i) => <th key={i} scope="col">{cell}</th>)}</tr></thead><tbody>{block.rows.map((row, r) => <tr key={r}>{row.map((cell, c) => c === 0 ? <th key={c} scope="row"><Rich text={cell} /></th> : <td key={c}><Rich text={cell} /></td>)}</tr>)}</tbody></table></div>;
    case "steps": return <ol className="course-steps">{block.items.map(([title, text], i) => <li key={title}><span>{String(i + 1).padStart(2, "0")}</span><div><strong>{title}</strong><p><Rich text={text} /></p></div></li>)}</ol>;
    case "example": return <div className="course-example">
      <span className="course-example-label"><Icon name="target" size={14} />Worked example</span>
      <strong>{block.title}</strong>
      <dl>{block.lines.map(([label, value], i) => <div key={i}><dt><Rich text={label} /></dt><dd><Rich text={value} /></dd></div>)}</dl>
      <p className="course-example-result"><Rich text={block.result} /></p>
    </div>;
    case "deep": return <details className="course-deep">
      <summary><span className="course-deep-label">Go deeper</span><strong>{block.title}</strong></summary>
      <div className="course-deep-body">{block.blocks.map((inner, i) => <RenderBlock key={i} block={inner} />)}</div>
    </details>;
  }
}

export function LessonBlocks({ blocks, lessonNumber }: { blocks: Block[]; lessonNumber: number }) {
  const figureNumber = (index: number) => blocks.slice(0, index + 1).filter((b) => b.kind === "figure").length;
  return <>{blocks.map((block, index) => <RenderBlock key={index} block={block} figureLabel={block.kind === "figure" ? `Figure ${lessonNumber}.${figureNumber(index)}` : undefined} />)}</>;
}
