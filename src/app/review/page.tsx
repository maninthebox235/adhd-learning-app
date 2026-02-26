"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import ProblemCard from "@/components/ProblemCard";
import { TOPICS_BY_ID } from "@/lib/knowledge-graph";
import { planReviewSession, getSessionProgress, computeSessionXp } from "@/lib/task-selection";
import {
  getStudentState,
  saveStudentState,
  saveSession,
  getCachedProblems,
  cacheProblems,
} from "@/lib/storage";
import {
  updateKnowledgePoint,
  addXp,
  applyImplicitReviews,
} from "@/lib/student-model";
import {
  SessionTask,
  LearningSession,
  Problem,
  StudentState,
} from "@/lib/types";

type Phase = "loading" | "session" | "complete" | "empty";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export default function ReviewPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [tasks, setTasks] = useState<SessionTask[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [studentState, setStudentState] = useState<StudentState | null>(null);
  const [sessionId] = useState(() => generateId());
  const [sessionXp, setSessionXp] = useState(0);
  const taskStartTime = useRef(Date.now());

  const initSession = useCallback(async () => {
    const state = getStudentState();
    setStudentState(state);

    const plan = planReviewSession(state);
    if (plan.tasks.length === 0) {
      setPhase("empty");
      return;
    }

    setTasks(plan.tasks);
    setPhase("session");
    await loadProblem(plan.tasks[0]);
  }, []);

  useEffect(() => {
    initSession();
  }, [initSession]);

  async function loadProblem(task: SessionTask) {
    setContentLoading(true);
    taskStartTime.current = Date.now();

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
      const idx = Math.floor(Math.random() * problems.length);
      setCurrentProblem(problems[idx]);
    }

    setContentLoading(false);
  }

  function handleAnswer(correct: boolean, hintsUsed: number) {
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

    const nextIdx = currentIdx + 1;
    if (nextIdx >= updatedTasks.length) {
      completeSession(updatedTasks);
    } else {
      setCurrentIdx(nextIdx);
      loadProblem(updatedTasks[nextIdx]);
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
      newTopicsIntroduced: [],
      topicsReviewed: [...new Set(finalTasks.map((t) => t.topicId))],
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

  if (phase === "loading") {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4 animate-bounce">⚡</div>
        <h2 className="text-xl font-bold text-text mb-2">Loading review...</h2>
        <p className="text-text-light">Picking the topics you need most!</p>
      </main>
    );
  }

  if (phase === "empty") {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-text mb-2">No reviews due!</h2>
        <p className="text-text-light mb-6">
          All caught up. Come back tomorrow or start learning new topics!
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/learn"
            className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-xl transition-colors"
          >
            Learn New Topics
          </Link>
          <Link
            href="/"
            className="bg-bg border border-border text-text font-medium px-6 py-3 rounded-xl hover:bg-bg-card transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (phase === "complete") {
    const correctCount = tasks.filter((t) => t.correct).length;
    const accuracy = tasks.length > 0 ? Math.round((correctCount / tasks.length) * 100) : 0;

    return (
      <main className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-bg-card rounded-2xl border border-border p-8">
          <div className="text-6xl mb-4">💪</div>
          <h2 className="text-2xl font-bold text-text mb-2">Review Complete!</h2>
          <p className="text-text-light mb-6">Your memory muscles are getting stronger!</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div>
              <div className="text-2xl font-bold text-primary">{sessionXp}</div>
              <div className="text-xs text-text-lighter">XP Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent-green">{accuracy}%</div>
              <div className="text-xs text-text-lighter">Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary">{tasks.length}</div>
              <div className="text-xs text-text-lighter">Reviewed</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Link
              href="/"
              className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/learn"
              className="bg-bg border border-border text-text font-medium px-6 py-3 rounded-xl hover:bg-bg-card transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const progress = getSessionProgress(tasks);

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      {/* Review header -- no topic labels shown (interleaving principle) */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <span className="text-sm font-medium text-text">Mixed Review</span>
          </div>
          <span className="text-sm text-text-light">
            {progress.completed + 1} / {progress.total}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-secondary transition-all duration-500"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <div className="text-right mt-1">
          <span className="text-xs text-text-lighter">+{sessionXp} XP</span>
        </div>
      </div>

      {contentLoading ? (
        <div className="text-center py-12">
          <div className="loading-dot inline-block w-3 h-3 bg-secondary rounded-full mx-1" />
          <div className="loading-dot inline-block w-3 h-3 bg-secondary rounded-full mx-1" />
          <div className="loading-dot inline-block w-3 h-3 bg-secondary rounded-full mx-1" />
        </div>
      ) : currentProblem ? (
        <ProblemCard
          problem={currentProblem}
          onAnswer={handleAnswer}
          showTopicLabel={false}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-text-light">Loading problem...</p>
        </div>
      )}
    </main>
  );
}
