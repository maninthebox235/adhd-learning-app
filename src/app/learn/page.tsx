"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import ProblemCard from "@/components/ProblemCard";
import WorkedExampleDisplay from "@/components/WorkedExampleDisplay";
import { TOPICS_BY_ID } from "@/lib/knowledge-graph";
import { planLearningSession, getSessionProgress, computeSessionXp } from "@/lib/task-selection";
import {
  getStudentState,
  saveStudentState,
  saveSession,
  getCachedProblems,
  cacheProblems,
  getCachedWorkedExample,
  cacheWorkedExample,
} from "@/lib/storage";
import {
  updateKnowledgePoint,
  addXp,
  applyImplicitReviews,
  updateStreak,
} from "@/lib/student-model";
import {
  SessionTask,
  LearningSession,
  Problem,
  WorkedExample,
  StudentState,
} from "@/lib/types";

type Phase = "loading" | "session" | "complete" | "empty";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export default function LearnPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [tasks, setTasks] = useState<SessionTask[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [currentExample, setCurrentExample] = useState<WorkedExample | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [studentState, setStudentState] = useState<StudentState | null>(null);
  const [sessionId] = useState(() => generateId());
  const [sessionXp, setSessionXp] = useState(0);
  const taskStartTime = useRef(Date.now());

  const initSession = useCallback(async () => {
    const state = getStudentState();
    const withStreak = updateStreak(state);
    setStudentState(withStreak);

    const plan = planLearningSession(withStreak);
    if (plan.tasks.length === 0) {
      setPhase("empty");
      return;
    }

    setTasks(plan.tasks);
    setPhase("session");

    await loadContent(plan.tasks[0], withStreak);
  }, []);

  useEffect(() => {
    initSession();
  }, [initSession]);

  async function loadContent(task: SessionTask, state: StudentState) {
    setContentLoading(true);
    taskStartTime.current = Date.now();

    const topic = TOPICS_BY_ID[task.topicId];
    if (!topic) {
      setContentLoading(false);
      return;
    }

    if (task.type === "worked-example") {
      const cached = getCachedWorkedExample(task.knowledgePointId);
      if (cached) {
        setCurrentExample(cached);
        setCurrentProblem(null);
        setContentLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/problems", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topicId: task.topicId,
            knowledgePointId: task.knowledgePointId,
            type: "worked-example",
          }),
        });
        const data = await res.json();
        if (data.workedExample) {
          cacheWorkedExample(task.knowledgePointId, data.workedExample);
          setCurrentExample(data.workedExample);
          setCurrentProblem(null);
        }
      } catch (err) {
        console.error("Failed to load worked example:", err);
      }
    } else {
      let problems = getCachedProblems(task.knowledgePointId);
      if (problems.length === 0) {
        try {
          const res = await fetch("/api/problems", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              topicId: task.topicId,
              knowledgePointId: task.knowledgePointId,
              type: "problems",
            }),
          });
          const data = await res.json();
          if (data.problems) {
            cacheProblems(task.knowledgePointId, data.problems);
            problems = data.problems;
          }
        } catch (err) {
          console.error("Failed to load problems:", err);
        }
      }

      if (problems.length > 0) {
        const randomIdx = Math.floor(Math.random() * problems.length);
        setCurrentProblem(problems[randomIdx]);
        setCurrentExample(null);
      }
    }

    setContentLoading(false);
  }

  function handleWorkedExampleComplete() {
    const updatedTasks = [...tasks];
    updatedTasks[currentIdx] = {
      ...updatedTasks[currentIdx],
      completed: true,
      correct: true,
      xpEarned: 5,
      timeSpentMs: Date.now() - taskStartTime.current,
    };
    setTasks(updatedTasks);
    setSessionXp((x) => x + 5);

    if (studentState) {
      const updated = addXp(studentState, 5);
      setStudentState(updated);
      saveStudentState(updated);
    }

    advanceToNext(updatedTasks);
  }

  function handleProblemAnswer(correct: boolean, hintsUsed: number) {
    const task = tasks[currentIdx];
    const xpEarned = correct ? Math.max(1, (currentProblem?.xpValue ?? 10) - hintsUsed * 2) : 0;

    const updatedTasks = [...tasks];
    updatedTasks[currentIdx] = {
      ...updatedTasks[currentIdx],
      completed: true,
      correct,
      hintsUsed,
      xpEarned,
      timeSpentMs: Date.now() - taskStartTime.current,
    };
    setTasks(updatedTasks);
    setSessionXp((x) => x + xpEarned);

    if (studentState) {
      const kp = TOPICS_BY_ID[task.topicId]?.knowledgePoints;
      const kpIndex = kp?.findIndex((k) => k.id === task.knowledgePointId) ?? 0;

      const topicState = studentState.topicStates[task.topicId];
      if (topicState) {
        const updatedTopicState = updateKnowledgePoint(
          topicState,
          kpIndex as 0 | 1 | 2,
          correct,
          hintsUsed
        );
        const quality = correct ? (hintsUsed === 0 ? 5 : hintsUsed === 1 ? 4 : 3) : 1;

        let updated: StudentState = {
          ...studentState,
          topicStates: {
            ...studentState.topicStates,
            [task.topicId]: updatedTopicState,
          },
        };
        updated = addXp(updated, xpEarned);
        updated = applyImplicitReviews(updated, task.topicId, quality);

        setStudentState(updated);
        saveStudentState(updated);
      }
    }

    advanceToNext(updatedTasks);
  }

  function advanceToNext(updatedTasks: SessionTask[]) {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= updatedTasks.length) {
      completeSession(updatedTasks);
      return;
    }

    setCurrentIdx(nextIdx);
    if (studentState) {
      loadContent(updatedTasks[nextIdx], studentState);
    }
  }

  function completeSession(finalTasks: SessionTask[]) {
    const session: LearningSession = {
      id: sessionId,
      date: new Date().toISOString().split("T")[0],
      startedAt: Date.now(),
      completedAt: Date.now(),
      tasks: finalTasks,
      totalXpEarned: computeSessionXp(finalTasks),
      newTopicsIntroduced: [...new Set(finalTasks.filter((t) => t.type === "worked-example").map((t) => t.topicId))],
      topicsReviewed: [...new Set(finalTasks.filter((t) => t.type === "review").map((t) => t.topicId))],
    };
    saveSession(session);

    if (studentState) {
      const updated = {
        ...studentState,
        sessionsCompleted: studentState.sessionsCompleted + 1,
      };
      saveStudentState(updated);
    }

    setPhase("complete");
  }

  if (phase === "loading" || (phase === "session" && contentLoading && !currentProblem && !currentExample)) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4 animate-bounce">🚀</div>
        <h2 className="text-xl font-bold text-text mb-2">Preparing your session...</h2>
        <p className="text-text-light">Getting the perfect problems for you!</p>
      </main>
    );
  }

  if (phase === "empty") {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-text mb-2">You&apos;re all caught up!</h2>
        <p className="text-text-light mb-6">
          No new topics or reviews right now. Come back later or try the review session!
        </p>
        <Link
          href="/"
          className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-xl transition-colors"
        >
          Back to Dashboard
        </Link>
      </main>
    );
  }

  if (phase === "complete") {
    const correctCount = tasks.filter((t) => t.correct).length;
    return (
      <main className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-bg-card rounded-2xl border border-border p-8">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-text mb-2">Session Complete!</h2>
          <p className="text-text-light mb-6">Great work, Isaac!</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div>
              <div className="text-2xl font-bold text-primary">{sessionXp}</div>
              <div className="text-xs text-text-lighter">XP Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent-green">{correctCount}</div>
              <div className="text-xs text-text-lighter">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary">{tasks.length}</div>
              <div className="text-xs text-text-lighter">Problems</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Link
              href="/learn"
              className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Another Session
            </Link>
            <Link
              href="/"
              className="bg-bg border border-border text-text font-medium px-6 py-3 rounded-xl hover:bg-bg-card transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const task = tasks[currentIdx];
  const topic = TOPICS_BY_ID[task?.topicId];
  const progress = getSessionProgress(tasks);

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      {/* Session header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{topic?.emoji}</span>
            <span className="text-sm font-medium text-text">{topic?.name}</span>
            <span className="text-xs text-text-lighter px-2 py-0.5 bg-bg rounded-full">
              {task?.type === "worked-example" ? "📝 Example" : task?.type === "review" ? "🔄 Review" : "✏️ Practice"}
            </span>
          </div>
          <span className="text-sm text-text-light">
            {progress.completed + 1} / {progress.total}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-text-lighter">+{sessionXp} XP this session</span>
          <Link href="/chat/ask" className="text-xs text-primary font-medium hover:underline">
            🤔 I&apos;m stuck — ask my buddy
          </Link>
        </div>
      </div>

      {/* Content */}
      {contentLoading ? (
        <div className="text-center py-12">
          <div className="loading-dot inline-block w-3 h-3 bg-primary rounded-full mx-1" />
          <div className="loading-dot inline-block w-3 h-3 bg-primary rounded-full mx-1" />
          <div className="loading-dot inline-block w-3 h-3 bg-primary rounded-full mx-1" />
        </div>
      ) : task?.type === "worked-example" && currentExample ? (
        <WorkedExampleDisplay
          example={currentExample}
          onComplete={handleWorkedExampleComplete}
        />
      ) : currentProblem ? (
        <ProblemCard
          problem={currentProblem}
          onAnswer={handleProblemAnswer}
          showTopicLabel={task?.type === "review"}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-text-light">Loading problem...</p>
        </div>
      )}
    </main>
  );
}
