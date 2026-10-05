"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import CountBadge from "@/components/ui/count-badge";
import { Icon, type IconName } from "@/components/ui/icon";
import { problems, topics } from "@/lib/data";

const mainLinks: { href: string; label: string; icon: IconName; count?: number }[] = [
  { href: "/", label: "Overview", icon: "grid" },
  { href: "/problems", label: "Problem sheet", icon: "list", count: 20 },
  { href: "/algorithms", label: "Algorithms", icon: "braces" },
  { href: "/roadmap", label: "Learning roadmap", icon: "route" },
];
const libraryLinks: typeof mainLinks = [
  { href: "/bookmarks", label: "Bookmarks", icon: "bookmark" },
  { href: "/progress", label: "My progress", icon: "chart" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchDialog = useRef<HTMLDialogElement>(null);
  const helpDialog = useRef<HTMLDialogElement>(null);
  const currentTopic = pathname.startsWith("/algorithms/") ? topics.find((topic) => pathname === `/algorithms/${topic.slug}`) : undefined;
  const pageLabel = currentTopic?.title ?? [...mainLinks, ...libraryLinks, { href: "/settings", label: "Settings" }].find((item) => item.href === pathname)?.label ?? "Problem workspace";

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") { event.preventDefault(); searchDialog.current?.showModal(); }
      if (event.key === "Escape") setNavigationOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function navLink(item: typeof mainLinks[number]) {
    const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
    return <li key={item.href}><Button href={item.href} variant="nav" size="md" data-active={active} aria-current={active ? "page" : undefined} className="sidebar-link" onClick={() => setNavigationOpen(false)}><Icon name={item.icon} size={15} /><span>{item.label}</span>{item.count ? <CountBadge>{item.count}</CountBadge> : null}</Button></li>;
  }
  const matches = query.trim() ? problems.filter((p) => `${p.title} ${p.topic}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6) : problems.slice(0, 4);

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">Skip to content</a>
      {navigationOpen ? <button className="navigation-backdrop" aria-label="Close navigation" onClick={() => setNavigationOpen(false)} /> : null}
      <aside className={`sidebar ${navigationOpen ? "is-open" : ""}`} aria-label="Main navigation">
        <Link href="/" className="brand" onClick={() => setNavigationOpen(false)}><span className="brand-mark"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="m6 10 4 5 6-8 6 8 4-5-3 14H9Z" fill="currentColor" /><path d="M11 27h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></span><span><strong>Algoking<span className="brand-period">.</span></strong></span></Link>
        <div className="sidebar-scroll"><nav><div className="sidebar-section"><ul>{mainLinks.map(navLink)}</ul></div><div className="sidebar-section"><h2 className="sidebar-heading">YOUR LIBRARY</h2><ul>{libraryLinks.map(navLink)}</ul></div><div className="sidebar-section quick-links"><h2 className="sidebar-heading">QUICK LINKS</h2><ul>{[{ slug: "arrays", name: "Arrays & hashing", color: "#eeb390" }, { slug: "binary-search", name: "Binary search", color: "#b7aee9" }, { slug: "trees", name: "Trees", color: "#b1ebc5" }].map((item) => <li key={item.slug}><Button href={`/algorithms/${item.slug}`} variant="nav" size="md" className="sidebar-link" onClick={() => setNavigationOpen(false)}><span className="quick-dot" style={{ background: item.color }} /><span>{item.name}</span><Icon name="arrow-up-right" size={12} /></Button></li>)}</ul></div></nav></div>
        <div className="sidebar-bottom"><div className="sidebar-support"><Button href="/settings" variant="nav" size="md" className="sidebar-link" onClick={() => setNavigationOpen(false)}><Icon name="settings" size={15} /><span>Settings</span></Button><Button variant="nav" size="md" className="sidebar-link" onClick={() => helpDialog.current?.showModal()}><Icon name="help" size={15} /><span>A little guidance</span></Button></div><Link href="/settings" className="sidebar-account" onClick={() => setNavigationOpen(false)}><span className="avatar">D</span><span><strong>Dhruv</strong></span><Icon name="chevron-down" size={14} /></Link></div>
      </aside>

      <div className="workspace"><header className="workspace-header"><div className="header-top"><div className="header-title"><Button variant="secondary" size="icon" className="mobile-menu" aria-label="Open navigation" aria-expanded={navigationOpen} onClick={() => setNavigationOpen(true)}><Icon name="menu" size={14} /></Button><span className="breadcrumb">Workspace<Icon name="chevron-right" size={12} /></span><h2>{pageLabel}</h2></div><div className="header-actions"><Button variant="secondary" size="sm" className="search-trigger" onClick={() => searchDialog.current?.showModal()} aria-label="Search problems" aria-keyshortcuts="Meta+K Control+K"><Icon name="search" size={13} /><span>Quick search</span><kbd>⌘ K</kbd></Button><span className="header-separator" /><Link href="/progress" className="streak" aria-label="View your practice streak"><Icon name="flame" size={15} /><span>3 day streak</span></Link><Link href="/settings" className="header-avatar" aria-label="Open account settings">D</Link></div></div><nav className="header-tabs" aria-label="Workspace views">{[{ href: "/", label: "Overview" }, { href: "/problems", label: "Problem sheet" }, { href: "/algorithms", label: "Algorithms" }].map((tab) => <Link key={tab.href} href={tab.href} className={pathname === tab.href || (tab.href !== "/" && pathname.startsWith(`${tab.href}/`)) ? "is-active" : ""} aria-current={pathname === tab.href || (tab.href !== "/" && pathname.startsWith(`${tab.href}/`)) ? "page" : undefined}>{tab.label}</Link>)}</nav></header><main id="main-content" className="main-scroll" tabIndex={-1} key={pathname}>{children}</main></div>

      <dialog ref={searchDialog} className="command-dialog" onClick={(event) => { if (event.target === event.currentTarget) searchDialog.current?.close(); }}><div className="dialog-heading"><Icon name="search" size={17} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a problem or pattern…" aria-label="Search problems and patterns" /><Button variant="ghost" size="icon-sm" aria-label="Close search" onClick={() => searchDialog.current?.close()}><Icon name="x" size={15} /></Button></div><div className="search-results"><h3>{query ? "Matching problems" : "A good place to start"}</h3>{matches.map((problem) => <button key={problem.id} onClick={() => { searchDialog.current?.close(); router.push(`/problems/${problem.slug}`); }}><Icon name="code" size={16} /><span>{problem.title}</span><small>{problem.difficulty}</small><Icon name="arrow-up-right" size={13} /></button>)}{matches.length === 0 ? <p className="search-empty">No matching problems. Try a topic below.</p> : null}<h3>Explore a pattern</h3><div className="search-topics">{topics.slice(0, 4).map((topic) => <Button key={topic.slug} href={`/algorithms/${topic.slug}`} variant="subtle" size="sm" onClick={() => searchDialog.current?.close()}>{topic.title}</Button>)}</div></div><div className="dialog-footer">Pick a problem. Think it through. <span>esc to close</span></div></dialog>
      <dialog ref={helpDialog} className="help-dialog"><div className="dialog-heading"><h2>A little guidance</h2><Button variant="ghost" size="icon-sm" aria-label="Close guidance" onClick={() => helpDialog.current?.close()}><Icon name="x" size={15} /></Button></div><p>Start with a pattern, read through a problem, and mark it solved when the idea clicks. Save anything you want to revisit.</p><p>This preview uses sample content. Your bookmarks and solved checkmarks stay in this browser.</p><Button variant="primary" href="/roadmap" onClick={() => helpDialog.current?.close()}>Explore the roadmap<Icon name="arrow-right" size={14} /></Button></dialog>
    </div>
  );
}
