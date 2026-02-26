import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { TOPICS_BY_ID } from "@/lib/knowledge-graph";
import { KnowledgePointLevel, Problem, WorkedExample } from "@/lib/types";
import {
  getProblemGenerationPrompt,
  getWorkedExamplePrompt,
} from "@/lib/prompts";

const anthropic = new Anthropic();

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function parseJsonResponse(text: string): unknown {
  const cleaned = text
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();
  return JSON.parse(cleaned);
}

export async function POST(req: NextRequest) {
  try {
    const { topicId, knowledgePointId, type } = (await req.json()) as {
      topicId: string;
      knowledgePointId: string;
      type: "problems" | "worked-example";
    };

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your-api-key-here") {
      return NextResponse.json(
        { error: "API key not configured. Add your ANTHROPIC_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    const topic = TOPICS_BY_ID[topicId];
    if (!topic) {
      return NextResponse.json({ error: "Unknown topic" }, { status: 400 });
    }

    const kp = topic.knowledgePoints.find((k) => k.id === knowledgePointId);
    if (!kp) {
      return NextResponse.json({ error: "Unknown knowledge point" }, { status: 400 });
    }

    if (type === "problems") {
      return await generateProblems(topic.name, kp.title, kp.description, kp.level, topicId, knowledgePointId);
    }

    return await generateWorkedExample(topic.name, kp.title, kp.description, kp.level, topicId, knowledgePointId);
  } catch (error) {
    console.error("Problem generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate content. Please try again!" },
      { status: 500 }
    );
  }
}

async function generateProblems(
  topicName: string,
  kpTitle: string,
  kpDescription: string,
  level: KnowledgePointLevel,
  topicId: string,
  knowledgePointId: string
) {
  const prompt = getProblemGenerationPrompt(topicName, kpTitle, kpDescription, level);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "[]";
  const parsed = parseJsonResponse(text) as Array<{
    type: string;
    question: string;
    choices: { label: string; value: string; isCorrect: boolean }[] | null;
    correctAnswer: string;
    hints: [string, string, string];
    explanation: string;
  }>;

  const xpValues = { 1: 5, 2: 10, 3: 15 };

  const problems: Problem[] = parsed.map((p) => ({
    id: generateId(),
    topicId,
    knowledgePointId,
    type: (p.type === "fill-in-blank" ? "fill-in-blank" : p.type === "true-false" ? "true-false" : "multiple-choice") as Problem["type"],
    question: p.question,
    choices: p.choices ?? undefined,
    correctAnswer: p.correctAnswer,
    hints: p.hints,
    explanation: p.explanation,
    xpValue: xpValues[level],
  }));

  return NextResponse.json({ problems });
}

async function generateWorkedExample(
  topicName: string,
  kpTitle: string,
  kpDescription: string,
  level: KnowledgePointLevel,
  topicId: string,
  knowledgePointId: string
) {
  const prompt = getWorkedExamplePrompt(topicName, kpTitle, kpDescription, level);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  const parsed = parseJsonResponse(text) as {
    title: string;
    problem: string;
    steps: { label: string; content: string }[];
    finalAnswer: string;
  };

  const workedExample: WorkedExample = {
    id: generateId(),
    topicId,
    knowledgePointId,
    title: parsed.title,
    problem: parsed.problem,
    steps: parsed.steps,
    finalAnswer: parsed.finalAnswer,
  };

  return NextResponse.json({ workedExample });
}
