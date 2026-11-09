import type { Metadata } from "next";
import { FundamentalsOverview } from "@/components/fundamentals/course-pages";

export const metadata: Metadata = { title: "Agentic computer fundamentals", description: "A systems syllabus for agent and harness engineers, from bits and caches to processes and event loops." };

export default function FundamentalsPage() {
  return <FundamentalsOverview />;
}
