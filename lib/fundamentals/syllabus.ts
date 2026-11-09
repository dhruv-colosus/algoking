import { concurrencyAndAsync } from "./concurrency-and-async";
import { machineReality } from "./machine-reality";
import { operatingSystems } from "./operating-systems";
import type { CourseModule, Lesson, Phase, PlannedModule } from "./types";

export const courseModules: CourseModule[] = [machineReality, operatingSystems, concurrencyAndAsync];

export const phases: Phase[] = [
  {
    number: 1, title: "The machine", weeks: 5, outcome: "Where time goes inside one process",
    modules: courseModules,
  },
  {
    number: 2, title: "Bytes on the wire", weeks: 8, outcome: "Every byte of a request, and why it is shaped that way",
    modules: [
      { number: 4, title: "Networking from packets to TCP", summary: "Framing, windows, congestion control and the cold-connection tax." },
      { number: 5, title: "TLS, HTTP/1.1, HTTP/2, HTTP/3 and QUIC", summary: "Where head-of-line blocking lives, and what each version moved." },
      { number: 6, title: "Streaming and RPC", summary: "SSE, WebSocket, gRPC and everything that breaks an LLM stream." },
      { number: 7, title: "Serialization", summary: "JSON, Protobuf by hand, columnar formats and cache-stable prompts." },
      { number: 8, title: "Compression", summary: "Repeat removal, entropy coding, dictionaries and length oracles." },
    ],
  },
  {
    number: 3, title: "State and failure", weeks: 5, outcome: "What survives a crash, and how you would know",
    modules: [
      { number: 9, title: "Storage and databases", summary: "fsync, B-trees versus LSM trees, isolation and vector indexes." },
      { number: 10, title: "Distributed systems", summary: "Idempotency, retry storms and durable agent runs." },
      { number: 15, title: "Observability and performance", summary: "Percentiles, fan-out, coordinated omission and agent traces." },
    ],
  },
  {
    number: 4, title: "Surfaces and agents", weeks: 6, outcome: "How a model token becomes a safe action or a pixel",
    modules: [
      { number: 11, title: "Browser and React internals", summary: "The rendering pipeline, Fiber and streaming chat UIs." },
      { number: 12, title: "Isolation and sandboxing", summary: "Containers, gVisor, microVMs and what no sandbox can stop." },
      { number: 13, title: "LLM inference for systems engineers", summary: "Prefill, decode, KV cache and what silently breaks prefix caching." },
      { number: 14, title: "Agent and harness engineering", summary: "The harness as an operating system for a stateless, fallible CPU." },
    ],
  },
];

export const studyMethod: [string, string][] = [
  ["Predict", "Write down what you expect before you run anything."],
  ["Build", "Make the smallest working version from scratch."],
  ["Break", "Use packet loss, kill -9, a full pipe or a slow client, then measure."],
  ["Explain", "Say it aloud in two minutes, ending with when you would choose something else."],
];

export const isPublished = (item: CourseModule | PlannedModule): item is CourseModule => "lessons" in item;

export function findCourse(slug: string) {
  return courseModules.find((course) => course.slug === slug);
}

export function findLesson(courseSlug: string, lessonSlug: string): { course: CourseModule; lesson: Lesson; index: number } | undefined {
  const course = findCourse(courseSlug);
  const index = course?.lessons.findIndex((lesson) => lesson.slug === lessonSlug) ?? -1;
  return course && index >= 0 ? { course, lesson: course.lessons[index], index } : undefined;
}

export const lessonCount = courseModules.reduce((sum, course) => sum + course.lessons.length, 0);
export const courseMinutes = (course: CourseModule) => course.lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);
