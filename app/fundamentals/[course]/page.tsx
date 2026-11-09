import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseOverview } from "@/components/fundamentals/course-pages";
import { courseModules, findCourse } from "@/lib/fundamentals/syllabus";

type Props = { params: Promise<{ course: string }> };

export function generateStaticParams() { return courseModules.map(({ slug }) => ({ course: slug })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = findCourse((await params).course);
  return course ? { title: `${course.title} · Module ${course.number}`, description: course.tagline } : { title: "Course" };
}

export default async function CoursePage({ params }: Props) {
  const course = findCourse((await params).course);
  if (!course) notFound();
  return <CourseOverview course={course} />;
}
