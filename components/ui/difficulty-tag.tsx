import Tag from "@/components/ui/tag";
import type { Difficulty } from "@/lib/data";

const tones = { Easy: "green", Medium: "yellow", Hard: "red" } as const;

export default function DifficultyTag({ difficulty }: { difficulty: Difficulty }) {
  return <Tag tone={tones[difficulty]} className="h-[20.8px] px-2 text-[11.2px]">{difficulty}</Tag>;
}
