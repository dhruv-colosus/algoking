import { Icon } from "@/components/ui/icon";
import { practiceLinks } from "@/lib/practice-links";

export function PracticeLink({ slug, title }: { slug: string; title: string }) {
  const link = practiceLinks[slug];
  if (!link) return <span aria-label="Practice link unavailable">—</span>;

  return (
    <a
      className="practice-link"
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Practice ${title} on ${link.platform === "GFG" ? "GeeksforGeeks" : link.platform} (opens in a new tab)`}
    >
      {link.platform}<Icon name="external" size={13} />
    </a>
  );
}
