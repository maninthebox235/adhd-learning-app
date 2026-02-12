"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mode, ChatMessage, ConversationLog, ParentAlert } from "@/lib/types";
import { saveConversation, saveAlert } from "@/lib/storage";

interface ChatInterfaceProps {
  mode: Mode;
  initialMessage?: string;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

const MODE_CONFIG: Record<
  Mode,
  { name: string; emoji: string; placeholder: string; color: string }
> = {
  ask: {
    name: "Ask Me Anything",
    emoji: "🤔",
    placeholder: "What are you curious about?",
    color: "text-accent-blue",
  },
  creative: {
    name: "Creative Builder",
    emoji: "🎨",
    placeholder: "What do you want to create?",
    color: "text-accent-purple",
  },
  challenge: {
    name: "Daily Challenge",
    emoji: "⚡",
    placeholder: "Tell me about your progress...",
    color: "text-accent-orange",
  },
};

export default function ChatInterface({
  mode,
  initialMessage,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(() => generateId());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasInitialized = useRef(false);
  const config = MODE_CONFIG[mode];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const persistConversation = useCallback(
    (msgs: ChatMessage[]) => {
      const conversation: ConversationLog = {
        id: conversationId,
        mode,
        messages: msgs,
        startedAt: msgs[0]?.timestamp || Date.now(),
      };
      saveConversation(conversation);
    },
    [conversationId, mode]
  );

  const sendMessage = useCallback(
    async (content: string, currentMessages: ChatMessage[]) => {
      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content,
        timestamp: Date.now(),
        mode,
      };

      const updatedMessages = [...currentMessages, userMessage];
      setMessages(updatedMessages);
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            mode,
            conversationId,
          }),
        });

        const data = await response.json();

        if (data.error) {
          const errorMessage: ChatMessage = {
            id: generateId(),
            role: "assistant",
            content: `Oops! ${data.error}`,
            timestamp: Date.now(),
            mode,
          };
          const withError = [...updatedMessages, errorMessage];
          setMessages(withError);
          persistConversation(withError);
          return;
        }

        // Save any alerts from the behavior analysis
        if (data.alert) {
          saveAlert(data.alert as ParentAlert);
        }

        const assistantMessage: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: data.message,
          timestamp: Date.now(),
          mode,
        };

        const withResponse = [...updatedMessages, assistantMessage];
        setMessages(withResponse);
        persistConversation(withResponse);
      } catch {
        const errorMessage: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content:
            "Hmm, I had trouble connecting. Can you try again? Make sure the internet is working!",
          timestamp: Date.now(),
          mode,
        };
        const withError = [...updatedMessages, errorMessage];
        setMessages(withError);
        persistConversation(withError);
      } finally {
        setIsLoading(false);
      }
    },
    [mode, conversationId, persistConversation]
  );

  // Send initial message if provided (e.g., for daily challenge)
  useEffect(() => {
    if (initialMessage && !hasInitialized.current) {
      hasInitialized.current = true;
      sendMessage(initialMessage, []);
    }
  }, [initialMessage, sendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    sendMessage(trimmed, messages);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Chat header */}
      <div className="bg-bg-card border-b border-border px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <span className="text-2xl">{config.emoji}</span>
          <h1 className={`text-lg font-bold ${config.color}`}>
            {config.name}
          </h1>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && !initialMessage && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">{config.emoji}</div>
              <h2 className="text-xl font-bold text-text mb-2">
                Hey Isaac! 👋
              </h2>
              <p className="text-text-light max-w-md mx-auto">
                {mode === "ask" &&
                  "Ask me anything you're curious about. No question is too weird or too simple!"}
                {mode === "creative" &&
                  "Let's build something awesome together! Tell me about your next big idea."}
                {mode === "challenge" &&
                  "Ready for today's challenge? Let's do this!"}
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`animate-fade-in-up flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-white rounded-br-md"
                    : "bg-bg-card border border-border text-text rounded-bl-md"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="bg-bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5 items-center h-5">
                  <div className="loading-dot w-2 h-2 bg-primary rounded-full" />
                  <div className="loading-dot w-2 h-2 bg-primary rounded-full" />
                  <div className="loading-dot w-2 h-2 bg-primary rounded-full" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="bg-bg-card border-t border-border px-4 py-3">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto flex gap-2 items-end"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={config.placeholder}
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border bg-bg px-4 py-3 text-sm text-text placeholder:text-text-lighter focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50 transition-colors"
            style={{ maxHeight: "120px" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = Math.min(target.scrollHeight, 120) + "px";
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-primary hover:bg-primary-dark text-white rounded-xl px-5 py-3 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
