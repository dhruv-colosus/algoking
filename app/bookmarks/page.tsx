import type { Metadata } from "next";
import ProblemList from "@/components/problems/problem-list";
import Button from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = { title: "Bookmarks" };

export default function BookmarksPage() {
  return <div className="page-content"><div className="page-heading"><div><span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span><h1>Saved for another day</h1><p>The problems you want to revisit, all in one quiet corner.</p></div><Button href="/problems" variant="secondary" size="sm">Explore problems <Icon name="arrow-up-right" size={14} /></Button></div><section className="panel problem-panel"><ProblemList savedOnly /></section></div>;
}
