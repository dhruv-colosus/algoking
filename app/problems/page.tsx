import type { Metadata } from "next";
import ProblemList from "@/components/problems/problem-list";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = { title: "Problem sheet" };

export default function ProblemsPage() {
  return <div className="page-content"><div className="page-heading"><div><span className="eyebrow">ONE PROBLEM AT A TIME</span><h1>Your problem sheet</h1><p>A thoughtful collection to help you build your problem-solving muscle.</p></div><span className="subtle-label"><Icon name="layers" size={16} /> 20 handpicked problems</span></div><section className="panel"><ProblemList /></section><p className="page-footnote">Practice at your own pace. Your bookmarks and solved problems stay in this browser.</p></div>;
}
