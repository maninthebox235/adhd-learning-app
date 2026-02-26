"use client";

import { useState, useRef } from "react";
import { Problem } from "@/lib/types";

interface ProblemCardProps {
  problem: Problem;
  onAnswer: (correct: boolean, hintsUsed: number) => void;
  showTopicLabel?: boolean;
}

type AnswerState = "unanswered" | "correct" | "incorrect";

export default function ProblemCard({ problem, onAnswer, showTopicLabel = true }: ProblemCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [fillAnswer, setFillAnswer] = useState("");
  const [answerState, setAnswerState] = useState<AnswerState>("unanswered");
  const [hintsShown, setHintsShown] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const startTime = useRef(Date.now());

  const checkAnswer = () => {
    const userAnswer = problem.type === "fill-in-blank" ? fillAnswer.trim() : selected;
    if (!userAnswer) return;

    const isCorrect = problem.type === "multiple-choice"
      ? problem.choices?.find((c) => c.value === userAnswer)?.isCorrect ?? false
      : userAnswer.toLowerCase() === problem.correctAnswer.toLowerCase();

    setAnswerState(isCorrect ? "correct" : "incorrect");

    if (isCorrect) {
      setTimeout(() => {
        setShowExplanation(true);
      }, 600);
    }
  };

  const showHint = () => {
    if (hintsShown < 3) {
      setHintsShown((h) => h + 1);
    }
  };

  const handleContinue = () => {
    onAnswer(answerState === "correct", hintsShown);
  };

  const tryAgain = () => {
    setSelected(null);
    setFillAnswer("");
    setAnswerState("unanswered");
  };

  return (
    <div className="bg-bg-card rounded-2xl border border-border p-6 max-w-2xl mx-auto">
      {showTopicLabel && (
        <div className="text-xs text-text-lighter uppercase tracking-wide mb-2">
          Practice Problem
        </div>
      )}

      <p className="text-text text-base leading-relaxed mb-6">{problem.question}</p>

      {problem.type === "multiple-choice" && problem.choices && (
        <div className="space-y-2 mb-6">
          {problem.choices.map((choice) => {
            let choiceClass = "bg-bg border-border hover:border-primary/50";
            if (answerState !== "unanswered") {
              if (choice.isCorrect) {
                choiceClass = "bg-accent-green/10 border-accent-green ring-2 ring-accent-green/30";
              } else if (choice.value === selected && !choice.isCorrect) {
                choiceClass = "bg-accent-red/10 border-accent-red ring-2 ring-accent-red/30";
              } else {
                choiceClass = "bg-bg border-border opacity-50";
              }
            } else if (choice.value === selected) {
              choiceClass = "bg-primary/10 border-primary ring-2 ring-primary/30";
            }

            return (
              <button
                key={choice.value}
                onClick={() => answerState === "unanswered" && setSelected(choice.value)}
                disabled={answerState !== "unanswered"}
                className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${choiceClass}`}
              >
                <span className="font-bold text-primary mr-3">{choice.label}.</span>
                <span className="text-text text-sm">{choice.value}</span>
              </button>
            );
          })}
        </div>
      )}

      {problem.type === "fill-in-blank" && (
        <div className="mb-6">
          <input
            type="text"
            value={fillAnswer}
            onChange={(e) => setFillAnswer(e.target.value)}
            disabled={answerState !== "unanswered"}
            placeholder="Type your answer..."
            className={`w-full rounded-xl border px-4 py-3 text-text bg-bg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${
              answerState === "correct"
                ? "border-accent-green bg-accent-green/5"
                : answerState === "incorrect"
                  ? "border-accent-red bg-accent-red/5"
                  : "border-border"
            }`}
            onKeyDown={(e) => {
              if (e.key === "Enter" && answerState === "unanswered") checkAnswer();
            }}
          />
        </div>
      )}

      {/* Hints */}
      {answerState !== "correct" && hintsShown > 0 && (
        <div className="space-y-2 mb-4">
          {problem.hints.slice(0, hintsShown).map((hint, i) => (
            <div key={i} className="bg-secondary/10 border border-secondary/20 rounded-lg px-4 py-2">
              <span className="text-secondary font-bold text-xs mr-2">💡 Hint {i + 1}:</span>
              <span className="text-text text-sm">{hint}</span>
            </div>
          ))}
        </div>
      )}

      {/* Answer feedback */}
      {answerState === "correct" && (
        <div className="animate-fade-in-up mb-4">
          <div className="bg-accent-green/10 border border-accent-green/20 rounded-xl p-4 text-center">
            <p className="text-2xl mb-1">🎉</p>
            <p className="font-bold text-accent-green">Nice one!</p>
            {showExplanation && (
              <p className="text-text-light text-sm mt-2">{problem.explanation}</p>
            )}
          </div>
        </div>
      )}

      {answerState === "incorrect" && (
        <div className="animate-fade-in-up mb-4">
          <div className="bg-accent-red/10 border border-accent-red/20 rounded-xl p-4 text-center">
            <p className="text-2xl mb-1">🤔</p>
            <p className="font-bold text-accent-red">Not quite — try again!</p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {answerState === "unanswered" && hintsShown < 3 && (
            <button
              onClick={showHint}
              className="text-secondary hover:text-secondary-light text-sm font-medium px-3 py-2 rounded-lg hover:bg-secondary/10 transition-colors"
            >
              💡 Hint ({3 - hintsShown} left)
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {answerState === "unanswered" && (
            <button
              onClick={checkAnswer}
              disabled={!selected && !fillAnswer.trim()}
              className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-2.5 rounded-xl disabled:opacity-40 transition-colors"
            >
              Check Answer
            </button>
          )}
          {answerState === "incorrect" && (
            <>
              <button
                onClick={tryAgain}
                className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleContinue}
                className="text-text-light hover:text-text text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-bg transition-colors"
              >
                Skip →
              </button>
            </>
          )}
          {answerState === "correct" && showExplanation && (
            <button
              onClick={handleContinue}
              className="bg-accent-green hover:bg-accent-green/90 text-white font-bold px-6 py-2.5 rounded-xl transition-colors"
            >
              Next →
            </button>
          )}
        </div>
      </div>

      {/* XP indicator */}
      <div className="mt-4 text-center">
        <span className="text-xs text-text-lighter">
          +{problem.xpValue} XP {hintsShown > 0 && `(−${hintsShown} for hints)`}
        </span>
      </div>
    </div>
  );
}
