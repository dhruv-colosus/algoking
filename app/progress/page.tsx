import type { Metadata } from "next";
import { ProgressOverview } from "@/components/problems/progress-overview";

export const metadata: Metadata = { title: "Your progress" };

export default function ProgressPage() {
  return <div className="page-content"><div className="page-heading"><div><span className="eyebrow">SMALL STEPS ADD UP</span><h1>Look how far you&apos;ve come</h1><p>Keep showing up. Understanding grows with practice.</p></div></div><ProgressOverview /><p className="page-footnote">This preview starts with sample progress. Mark problems as solved to make it your own.</p></div>;
}
