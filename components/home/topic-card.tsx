"use client";

import Image from "next/image";
import Link from "next/link";
import type { PointerEvent } from "react";
import type { Topic } from "@/lib/data";

export default function TopicCard({ topic, index = 0, imageWidth = 920, imageHeight = 620, sizes = "(max-width: 560px) 100vw, (max-width: 1199px) 50vw, 26vw", loading, lessonCount }: { topic: Topic; index?: number; imageWidth?: number; imageHeight?: number; sizes?: string; loading?: "eager" | "lazy"; lessonCount?: number }) {
  const lessonLabel = lessonCount === undefined ? undefined : `${lessonCount} ${lessonCount === 1 ? "Lesson" : "Lessons"}`;
  function updateGlare(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType === "touch" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const link = event.currentTarget;
    const bounds = link.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    link.style.setProperty("--glare-angle", `${110 + x * 45 - y * 25}deg`);
    link.style.setProperty("--tilt-x", `${(0.5 - y) * 8}deg`);
    link.style.setProperty("--tilt-y", `${(x - 0.5) * 8}deg`);
    link.dataset.hovered = "true";
  }

  function resetGlare(event: PointerEvent<HTMLAnchorElement>) {
    const link = event.currentTarget;
    delete link.dataset.hovered;
    link.style.removeProperty("--tilt-x");
    link.style.removeProperty("--tilt-y");
  }

  return (
    <Link href={`/algorithms/${topic.slug}`} className="topic-image-link" aria-label={`Practice ${topic.title}${lessonLabel ? `, ${lessonLabel}` : ""}`} onPointerEnter={updateGlare} onPointerMove={updateGlare} onPointerLeave={resetGlare} onPointerCancel={resetGlare}>
      <span className="topic-image-surface">
        <Image src={topic.image} alt={topic.title} width={imageWidth} height={imageHeight} sizes={sizes} loading={loading ?? (index < 3 ? "eager" : "lazy")} unoptimized={topic.image === "/illustrations/linked-list.png"} />
        <span className="topic-image-glare" aria-hidden="true" />
      </span>
      {lessonLabel ? <span className="topic-lesson-count">{lessonLabel}</span> : null}
    </Link>
  );
}
