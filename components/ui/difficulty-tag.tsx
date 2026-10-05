import Tag from "@/components/ui/tag";
import type { Difficulty } from "@/lib/data";

const tones = { Easy: "green", Medium: "yellow", Hard: "red" } as const;

export default function DifficultyTag({ difficulty }: { difficulty: Difficulty }) {
  return <Tag tone={tones[difficulty]} className="h-[26px] px-2.5">{difficulty}</Tag>;
}
