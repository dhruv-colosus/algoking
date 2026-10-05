import { notFound, permanentRedirect } from "next/navigation";
import { topics } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return topics.map(({ slug }) => ({ slug }));
}

export default async function LegacyTopicPage({ params }: Props) {
  const { slug } = await params;
  if (!topics.some((topic) => topic.slug === slug)) notFound();
  permanentRedirect(`/algorithms/${slug}`);
}
