import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonPage } from "@/components/fundamentals/course-pages";
import { courseModules, findLesson } from "@/lib/fundamentals/syllabus";

type Props = { params: Promise<{ course: string; lesson: string }> };

export function generateStaticParams() {
  return courseModules.flatMap((course) => course.lessons.map((lesson) => ({ course: course.slug, lesson: lesson.slug })));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course, lesson } = await params;
  const found = findLesson(course, lesson);
  return found ? { title: found.lesson.title, description: found.lesson.summary } : { title: "Lesson" };
}

export default async function FundamentalsLessonPage({ params }: Props) {
  const { course, lesson } = await params;
  const found = findLesson(course, lesson);
  if (!found) notFound();
  return <LessonPage course={found.course} lesson={found.lesson} index={found.index} />;
}
