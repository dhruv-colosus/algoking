import type { Metadata } from "next";
import ProblemList from "@/components/problems/problem-list";
import { problems } from "@/lib/data";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = { title: "Problem sheet" };

export default function ProblemsPage() {
  return <div className="page-content"><div className="page-heading"><div><h1>Your problem sheet</h1><p>Learn a pattern, walk through the example, then write it yourself.</p></div><span className="subtle-label"><Icon name="layers" size={16} /> {problems.length} {problems.length === 1 ? "problem" : "problems"}</span></div><section className="panel problem-panel"><ProblemList /></section><p className="page-footnote">Practice at your own pace. Your bookmarks and solved problems stay in this browser.</p></div>;
}
