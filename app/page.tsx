import Link from "next/link";
import Button from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import TopicCard from "@/components/home/topic-card";
import ProblemList from "@/components/problems/problem-list";
import { topics } from "@/lib/data";

const homeTopics = [...topics.slice(3, 5), ...topics.slice(0, 3), ...topics.slice(5)];

export default function Home() {
  return (
    <div className="page-content home-content">
      <div className="home-pattern-layout">
      <section className="hero">
        <div className="hero-copy"><h1>Master the patterns.</h1><p>Understand the patterns. Build your intuition.<br className="desktop-break" /> Get a little better, one problem at a time.</p><div className="hero-actions"><Button variant="primary" size="md" href="/problems" className="hero-button">Start practicing<Icon name="arrow-right" size={15} /></Button><Button variant="secondary" size="md" href="/roadmap" className="hero-button"><Icon name="route" size={15} />Explore the roadmap</Button></div></div>
      </section>

      <section className="topic-section" aria-label="Practice patterns"><div className="topic-grid">{homeTopics.map((topic, index) => <TopicCard key={topic.slug} topic={topic} index={index} sizes="(max-width: 560px) 280px, (max-width: 1199px) 33vw, 20vw" loading="eager" />)}</div></section>
      </div>

      <section className="practice-section"><div className="section-heading"><div><h2>A good place to start</h2></div><Link href="/problems" className="text-link">View problem sheet<Icon name="arrow-right" size={14} /></Link></div><div className="panel problem-panel"><ProblemList compact /></div></section>

    </div>
  );
}
