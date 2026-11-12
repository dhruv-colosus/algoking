import Link from "next/link";
import Button from "@/components/ui/button";
import Tag from "@/components/ui/tag";
import { Icon } from "@/components/ui/icon";
import { courseMinutes, courseModules, isPublished, lessonCount, phases, studyMethod } from "@/lib/fundamentals/syllabus";
import type { CourseModule, Lesson, Level } from "@/lib/fundamentals/types";
import { LessonBlocks, slugify } from "./lesson-blocks";
import { Rich } from "./rich-text";

const levelTone: Record<Level, "green" | "purple" | "yellow"> = { Basics: "green", Depth: "purple", Current: "yellow" };
const pad = (n: number) => String(n).padStart(2, "0");
export const coursePath = (course: CourseModule) => `/fundamentals/${course.slug}`;
export const lessonPath = (course: CourseModule, lesson: Lesson) => `/fundamentals/${course.slug}/${lesson.slug}`;

export function LevelTag({ level }: { level: Level }) {
  return <Tag tone={levelTone[level]} size="sm" className="course-level">{level}</Tag>;
}

/* ---------- Syllabus overview ---------- */

function SyllabusStack() {
  const cx = 150, gap = 62;
  const slabs = [...phases].reverse();
  return <svg className="fundamentals-stack" viewBox="0 0 600 316" role="img" aria-labelledby="stack-title stack-desc">
    <title id="stack-title">Four phases stacked from the machine upward</title>
    <desc id="stack-desc">{`The machine is the foundation, then bytes on the wire, state and failure, and surfaces and agents. Published: ${phases.filter((p) => p.modules.some(isPublished)).map((p) => p.title).join(" and ")}.`}</desc>
    {slabs.map((phase, i) => {
      const y = 60 + i * gap, live = phase.modules.some(isPublished);
      return <g key={phase.number} className={`stack-slab${live ? " is-live" : ""}`}>
        <path className="slab-left" d={`M ${cx - 130} ${y} L ${cx} ${y + 38} L ${cx} ${y + 56} L ${cx - 130} ${y + 18} Z`} />
        <path className="slab-right" d={`M ${cx} ${y + 38} L ${cx + 130} ${y} L ${cx + 130} ${y + 18} L ${cx} ${y + 56} Z`} />
        <path className="slab-top" d={`M ${cx - 130} ${y} L ${cx} ${y - 38} L ${cx + 130} ${y} L ${cx} ${y + 38} Z`} />
        <text x={cx} y={y + 5} textAnchor="middle" className="slab-number">{pad(phase.number)}</text>
        <line x1={cx + 136} y1={y} x2={318} y2={y} className="slab-leader" />
        <text x="328" y={y - 2} className="slab-title">{phase.title}</text>
        <text x="328" y={y + 16} className="slab-meta">{live ? "Published · " : ""}Modules {phase.modules.map((m) => m.number).sort((a, b) => a - b).join(", ")} · {phase.weeks} weeks</text>
      </g>;
    })}
  </svg>;
}

export function FundamentalsOverview() {
  const livePhases = phases.filter((p) => p.modules.some(isPublished));
  const startOf = (phase: (typeof phases)[number]) => phase.modules.find(isPublished)!;
  return <div className="page-content fundamentals-page">
    <section className="fundamentals-hero">
      <div>
        <h1>Agentic computer fundamentals.</h1>
        <p>A systems course for agent and harness engineers. It starts with bits in a register and works up to a model token turning into a safe action. Every module runs from first principles to what production systems use in late 2026.</p>
        <div className="fundamentals-hero-actions">{livePhases.map((phase, i) => <Button key={phase.number} href={coursePath(startOf(phase))} variant={i === livePhases.length - 1 ? "primary" : "secondary"}>Start Phase {phase.number}<Icon name="arrow-right" size={14} /></Button>)}<span className="graph-lesson-count">{lessonCount} lessons published · 4 phases · 15 modules</span></div>
      </div>
      <SyllabusStack />
    </section>

    <section className="panel fundamentals-method" aria-labelledby="method-heading">
      <h2 id="method-heading">Study each module in four steps</h2>
      <ol>{studyMethod.map(([title, text], i) => <li key={title}><span>{pad(i + 1)}</span><strong>{title}</strong><p>{text}</p></li>)}</ol>
    </section>

    {phases.map((phase) => {
      const live = phase.modules.some(isPublished);
      return <section key={phase.number} className="fundamentals-phase" aria-labelledby={`phase-${phase.number}`}>
        <div className="fundamentals-phase-head">
          <div><span className="algorithm-number">PHASE {pad(phase.number)} · {phase.weeks} WEEKS</span><h2 id={`phase-${phase.number}`}>{phase.title}</h2><p>You can now explain: {phase.outcome.toLowerCase()}.</p></div>
          {live ? <Tag tone="green" size="sm">Published</Tag> : <Tag tone="neutral" size="sm">In preparation</Tag>}
        </div>
        <div className="algorithm-grid">
          {phase.modules.map((item) => isPublished(item)
            ? <article key={item.number} className="panel algorithm-card course-card">
                <div className="algorithm-topline"><span className="algorithm-number">MODULE {pad(item.number)}</span><span className="subtle-label">{item.lessons.length} lessons · {courseMinutes(item)} min</span></div>
                <h3><Link href={coursePath(item)}>{item.title}</Link></h3>
                <p><Rich text={item.tagline} /></p>
                <div className="algorithm-footer"><span className="course-levels">{(["Basics", "Depth", "Current"] as Level[]).map((l) => <LevelTag key={l} level={l} />)}</span><Button href={coursePath(item)} variant="ghost" size="sm">Open course<Icon name="arrow-right" size={14} /></Button></div>
              </article>
            : <article key={item.number} className="panel algorithm-card course-card is-planned" aria-label={`Module ${item.number}: ${item.title}, not published yet`}>
                <div className="algorithm-topline"><span className="algorithm-number">MODULE {pad(item.number)}</span><span className="subtle-label">Not published yet</span></div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
              </article>)}
        </div>
      </section>;
    })}
  </div>;
}

/* ---------- Course overview ---------- */

export function CourseOverview({ course }: { course: CourseModule }) {
  const phase = phases.find((p) => p.modules.some((m) => m.number === course.number))!;
  return <div className="page-content course-overview">
    <Button href="/fundamentals" variant="link" size="sm"><Icon name="arrow-right" className="back-icon" size={14} />Systems syllabus</Button>
    <section className="panel course-hero">
      <div className="course-hero-copy">
        <span className="algorithm-number">PHASE {pad(phase.number)} · MODULE {pad(course.number)}</span>
        <h1>{course.title}.</h1>
        <p className="course-tagline"><Rich text={course.tagline} /></p>
        <p><Rich text={course.intuition} /></p>
        <div className="course-hero-meta"><span><Icon name="book" size={15} />{course.lessons.length} lessons</span><span><Icon name="clock" size={15} />{courseMinutes(course)} minutes of reading</span><span><Icon name="code" size={15} />{course.lessons.reduce((n, l) => n + l.blocks.filter((b) => b.kind === "figure").length, 0)} illustrations</span></div>
        <Button href={lessonPath(course, course.lessons[0])} variant="primary">Start lesson 1<Icon name="arrow-right" size={14} /></Button>
      </div>
      <div className="course-hero-levels" aria-label="What this module covers">
        {(["Basics", "Depth", "Current"] as Level[]).map((level) => <div key={level}><LevelTag level={level} /><ul>{course.levels[level].map((topic) => <li key={topic}>{topic}</li>)}</ul></div>)}
      </div>
    </section>
    <aside className="course-callout is-harness"><Icon name="workflow" size={16} /><div><span className="course-callout-label">Why agent engineers need this</span><p><Rich text={course.harness} /></p></div></aside>

    <div className="course-overview-grid">
      <section aria-labelledby="lessons-heading">
        <h2 id="lessons-heading" className="course-section-title">Lessons</h2>
        <ol className="course-lesson-list">{course.lessons.map((lesson, i) => <li key={lesson.slug}>
          <Link href={lessonPath(course, lesson)} className="panel course-lesson-row">
            <span className="course-lesson-number">{pad(i + 1)}</span>
            <span className="course-lesson-copy"><strong>{lesson.title}</strong><span><Rich text={lesson.summary} /></span></span>
            <span className="course-lesson-meta"><LevelTag level={lesson.level} /><span>{lesson.minutes} min</span></span>
          </Link>
        </li>)}</ol>
      </section>
      <aside className="panel course-timeline" aria-labelledby="timeline-heading">
        <h2 id="timeline-heading">How we got here</h2>
        <ol>{course.timeline.map(([year, title, text]) => <li key={year + title}><span>{year}</span><div><strong>{title}</strong><p>{text}</p></div></li>)}</ol>
      </aside>
    </div>

    <div className="course-wrap-grid">
      <section className="panel course-wrap" aria-labelledby="lab-heading"><h2 id="lab-heading">Module lab</h2><ol className="course-checklist">{course.lab.map((step) => <li key={step}><Rich text={step} /></li>)}</ol></section>
      <section className="panel course-wrap" aria-labelledby="interview-heading"><h2 id="interview-heading">Interview questions</h2><div className="course-qa">{course.interview.map(([q, a]) => <details key={q}><summary><Rich text={q} /></summary><p><Rich text={a} /></p></details>)}</div></section>
      <section className="panel course-wrap" aria-labelledby="read-heading"><h2 id="read-heading">Read</h2><ul className="course-reading">{course.reading.map((r) => <li key={r}><Icon name="book" size={14} />{r}</li>)}</ul></section>
    </div>
  </div>;
}

/* ---------- Lesson ---------- */

export function LessonPage({ course, lesson, index }: { course: CourseModule; lesson: Lesson; index: number }) {
  const courseIndex = courseModules.indexOf(course);
  const prevCourse = courseModules[courseIndex - 1], nextCourse = courseModules[courseIndex + 1];
  const previous = index > 0 ? { href: lessonPath(course, course.lessons[index - 1]), label: "Previous lesson", title: course.lessons[index - 1].title }
    : prevCourse ? { href: lessonPath(prevCourse, prevCourse.lessons.at(-1)!), label: `Module ${pad(prevCourse.number)}`, title: prevCourse.lessons.at(-1)!.title } : { href: "/fundamentals", label: "Back to", title: "Systems syllabus" };
  const next = index < course.lessons.length - 1 ? { href: lessonPath(course, course.lessons[index + 1]), label: "Next lesson", title: course.lessons[index + 1].title }
    : nextCourse ? { href: lessonPath(nextCourse, nextCourse.lessons[0]), label: `Next module · ${nextCourse.shortTitle}`, title: nextCourse.lessons[0].title } : { href: "/fundamentals", label: "Every published lesson complete", title: "Systems syllabus" };
  const headings = lesson.blocks.filter((b) => b.kind === "h").map((b) => (b as { text: string }).text);

  return <article className="page-content course-lesson">
    <header className="course-lesson-header">
      <Button href={coursePath(course)} variant="secondary" size="icon" aria-label={`Back to ${course.title}`} className="tutorial-back"><Icon name="arrow-right" className="back-icon" size={18} /></Button>
      <div>
        <nav className="course-crumbs" aria-label="Breadcrumb"><Link href="/fundamentals">Agentic fundamentals</Link><Icon name="chevron-right" size={12} /><Link href={coursePath(course)}>Module {pad(course.number)} · {course.shortTitle}</Link></nav>
        <h1>{lesson.title}</h1>
        <p className="course-summary"><Rich text={lesson.summary} /></p>
        <div className="course-lesson-tags"><LevelTag level={lesson.level} /><span>Lesson {index + 1} of {course.lessons.length}</span><span><Icon name="clock" size={13} />{lesson.minutes} min</span></div>
      </div>
    </header>

    <div className="course-layout">
      <div className="course-main">
        <LessonBlocks blocks={lesson.blocks} lessonNumber={index + 1} />

        <section className="course-practice" aria-labelledby="practice-heading">
          <h2 id="practice-heading" className="course-h">Where you will meet it</h2>
          <div className="course-practice-grid">{lesson.practice.map(([title, text]) => <div key={title} className="panel"><strong>{title}</strong><p><Rich text={text} /></p></div>)}</div>
        </section>

        {lesson.terms?.length ? <section className="panel course-terms" aria-labelledby="terms-heading">
          <h2 id="terms-heading">Words to know</h2>
          <dl>{lesson.terms.map(([term, definition]) => <div key={term}><dt>{term}</dt><dd><Rich text={definition} /></dd></div>)}</dl>
        </section> : null}

        <section aria-labelledby="check-heading">
          <h2 id="check-heading" className="course-h">Check yourself</h2>
          <p className="course-p">Answer out loud before you open each one.</p>
          <div className="course-qa">{lesson.check.map(([q, a]) => <details key={q}><summary><Rich text={q} /></summary><p><Rich text={a} /></p></details>)}</div>
        </section>

        <section className="panel course-try" aria-labelledby="try-heading">
          <Icon name="terminal" size={18} />
          <div><h2 id="try-heading">Try it</h2><p><Rich text={lesson.tryIt} /></p></div>
        </section>
      </div>

      <aside className="course-aside">
        <nav className="panel course-outline" aria-label={`${course.title} lessons`}>
          <span className="course-outline-title">Module {pad(course.number)} · {course.shortTitle}</span>
          <div className="course-progress" aria-hidden="true"><span style={{ width: `${((index + 1) / course.lessons.length) * 100}%` }} /></div>
          <ol>{course.lessons.map((item, i) => <li key={item.slug}><Link href={lessonPath(course, item)} aria-current={i === index ? "page" : undefined} className={i < index ? "is-before" : ""}><span>{pad(i + 1)}</span>{item.title}</Link></li>)}</ol>
        </nav>
        {headings.length ? <nav className="course-onpage" aria-label="On this page"><span className="course-outline-title">On this page</span><ul>{headings.map((h) => <li key={h}><a href={`#${slugify(h)}`}>{h}</a></li>)}<li><a href="#practice-heading">Where you will meet it</a></li>{lesson.terms?.length ? <li><a href="#terms-heading">Words to know</a></li> : null}<li><a href="#check-heading">Check yourself</a></li></ul></nav> : null}
      </aside>
    </div>

    <nav className="graph-lesson-navigation" aria-label="Lesson navigation">
      <Link href={previous.href}><span>{previous.label}</span><strong><Icon name="arrow-right" className="back-icon" size={14} />{previous.title}</strong></Link>
      <Link href={next.href}><span>{next.label}</span><strong>{next.title}<Icon name="arrow-right" size={14} /></strong></Link>
    </nav>
  </article>;
}
