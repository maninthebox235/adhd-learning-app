import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getSystemPrompt, getBehaviorAnalysisPrompt } from "@/lib/prompts";
import { Mode, ParentAlert } from "@/lib/types";

const anthropic = new Anthropic();

// Patterns that indicate concerning content in user messages
const CONCERNING_PATTERNS = [
  /i('?m| am) (so )?(stupid|dumb|worthless|ugly|fat|useless)/i,
  /nobody (likes|loves|cares about) me/i,
  /i (hate|want to hurt) myself/i,
  /i (can'?t|cannot) do anything/i,
  /i (wish|want to) (die|disappear|not exist)/i,
  /everyone hates me/i,
  /i('?m| am) (a )?(failure|loser)/i,
  /no one (wants|likes) me/i,
  /i (should just|might as well) give up/i,
  /being bullied|bully me|picks on me|beat me up/i,
];

function checkForConcerns(
  message: string
): { flagged: boolean; type: ParentAlert["type"]; detail: string } | null {
  for (const pattern of CONCERNING_PATTERNS) {
    if (pattern.test(message)) {
      const isSafety =
        /hurt myself|die|disappear|not exist/i.test(message);
      return {
        flagged: true,
        type: isSafety
          ? "safety_flag"
          : /bully|picks on|beat/i.test(message)
            ? "concerning_behavior"
            : "negative_self_talk",
        detail: message.substring(0, 200),
      };
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, mode, conversationId } = (await req.json()) as {
      messages: { role: "user" | "assistant"; content: string }[];
      mode: Mode;
      conversationId: string;
    };

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your-api-key-here") {
      return NextResponse.json(
        {
          error:
            "API key not configured. Add your ANTHROPIC_API_KEY to .env.local",
        },
        { status: 500 }
      );
    }

    // Check the latest user message for concerning patterns
    const latestUserMessage = messages[messages.length - 1];
    let alert: ParentAlert | null = null;

    if (latestUserMessage?.role === "user") {
      const concern = checkForConcerns(latestUserMessage.content);
      if (concern) {
        alert = {
          id: `alert-${Date.now()}`,
          type: concern.type,
          message: `Detected ${concern.type.replace(/_/g, " ")} in conversation`,
          context: concern.detail,
          timestamp: Date.now(),
          conversationId,
        };
      }

      // Also use Claude to analyze for subtler patterns
      try {
        const analysisResponse = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 100,
          system: getBehaviorAnalysisPrompt(),
          messages: [
            { role: "user", content: latestUserMessage.content },
          ],
        });

        const analysisText =
          analysisResponse.content[0].type === "text"
            ? analysisResponse.content[0].text
            : "";

        if (analysisText.startsWith("FLAG:")) {
          const match = analysisText.match(
            /FLAG:\s*(negative_self_talk|concerning_behavior|safety_flag)\s*-\s*(.*)/
          );
          if (match && !alert) {
            alert = {
              id: `alert-${Date.now()}`,
              type: match[1] as ParentAlert["type"],
              message: match[2],
              context: latestUserMessage.content.substring(0, 200),
              timestamp: Date.now(),
              conversationId,
            };
          }
        }
      } catch {
        // Don't block the main response if analysis fails
      }
    }

    // Main conversation response
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: getSystemPrompt(mode),
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const assistantMessage =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({
      message: assistantMessage,
      alert,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again!" },
      { status: 500 }
    );
  }
}
