"use client";

import {
  Message as DBMessage,
  addUserMessageWithWebhook,
  getSessionMessages,
  subscribeToMessages,
} from "@/utils/supabase/messages";
import { GameSession, getGameSession } from "@/utils/supabase/session";
import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";

// Client-side message type with UI-specific fields
type UIMessage = {
  id: string;
  sender: "user" | "AI";
  userId: string | null;
  text: string;
  timestamp: Date;
};

// Convert DB message to UI message
function convertToUIMessage(message: DBMessage): UIMessage {
  return {
    id: message.id,
    sender: message.is_ai ? "AI" : "user",
    userId: message.user_id,
    text: message.text,
    timestamp: new Date(message.created_at),
  };
}

export default function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const gameId = unwrappedParams.id;

  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [username, setUsername] = useState<string | null>(null);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<() => void>(() => {});

  useEffect(() => {
    // Check for user in localStorage
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Fetch game session
    fetchGameSession();

    // Fetch messages
    fetchMessages();

    // Subscribe to new messages
    subscriptionRef.current = subscribeToMessages(gameId, (newMessage) => {
      console.log("New message received:", newMessage);
      const uiMessage = convertToUIMessage(newMessage);
      setMessages((prev) => {
        // Check if the message is already in the array to prevent duplicates
        const exists = prev.some((msg) => msg.id === uiMessage.id);
        if (exists) return prev;
        return [...prev, uiMessage];
      });
    });

    // Detect mobile keyboard
    if (typeof window !== "undefined") {
      const detectKeyboard = () => {
        const visualViewport = window.visualViewport;
        if (visualViewport) {
          const isKeyboard = window.innerHeight > visualViewport.height + 150;
          setIsKeyboardOpen(isKeyboard);

          if (isKeyboard && chatContainerRef.current) {
            // Adjust scroll when keyboard is opened
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }
        }
      };

      window.visualViewport?.addEventListener("resize", detectKeyboard);
      return () => {
        window.visualViewport?.removeEventListener("resize", detectKeyboard);
        subscriptionRef.current();
      };
    }

    // Cleanup subscription
    return () => {
      subscriptionRef.current();
    };
  }, [gameId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchGameSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const session = await getGameSession(gameId);

      if (!session) {
        throw new Error("Game session not found");
      }

      setGameSession(session);
    } catch (error: unknown) {
      console.error("Error fetching game session:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load game session";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const dbMessages = await getSessionMessages(gameId);
      const uiMessages = dbMessages.map(convertToUIMessage);
      setMessages(uiMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (inputValue.trim() === "" || !username) return;

    const messageText = inputValue.trim();
    setInputValue("");

    try {
      // Add user message to Supabase and send to webhook
      await addUserMessageWithWebhook(gameId, username, messageText, gameId);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-[var(--game-bg)] text-white items-center justify-center">
        <p>Loading game...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-[var(--game-bg)] text-white items-center justify-center p-4">
        <p className="text-red-400 text-center">{error}</p>
        <Link
          href="/"
          className="mt-4 px-6 py-2 bg-transparent border border-slate-600 hover:bg-slate-700/30 rounded-full font-medium transition-colors"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--game-bg)] text-white">
      {/* Header */}
      <header
        className={`game-header p-3 sm:p-4 flex items-center justify-between shadow-md ${
          isKeyboardOpen ? "hidden sm:flex" : "flex"
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className="text-lg sm:text-xl font-bold">
            <Link href="/">Monsters</Link>
          </h1>
          <span className="bg-indigo-600 px-2 py-0.5 sm:py-1 rounded-md text-xs truncate max-w-[100px] sm:max-w-none">
            Game #{gameId}
          </span>
        </div>
        <div className="text-xs sm:text-sm text-[var(--game-text-secondary)] flex items-center flex-shrink-0">
          {username && (
            <span className="mr-2 sm:mr-4 truncate max-w-[80px] sm:max-w-none">
              <span className="hidden xs:inline">Playing as </span>
              <span className="font-semibold text-green-400">{username}</span>
            </span>
          )}
          {gameSession && (
            <span className="bg-slate-700 px-2 py-0.5 sm:py-1 rounded-md text-xs whitespace-nowrap">
              {gameSession.game_state.users.length} Player
              {gameSession.game_state.users.length !== 1 && "s"}
            </span>
          )}
        </div>
      </header>

      {/* Chat area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4"
        style={isKeyboardOpen ? { height: "calc(100vh - 76px)" } : {}}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[90%] sm:max-w-[80%] px-3 sm:px-4 py-2 rounded-2xl ${
                message.sender === "user"
                  ? "game-message-user text-white rounded-tr-none"
                  : "game-message-ai text-white rounded-tl-none"
              }`}
            >
              <div className="font-medium text-sm sm:text-base">
                {message.sender === "user" ? message.userId : "MonsterBot"}
              </div>
              <div className="text-sm sm:text-base break-words">
                {message.text}
              </div>
              <div className="text-xs text-[var(--game-text-secondary)] mt-1 text-right">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="game-header p-3 sm:p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 game-input rounded-full px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="game-button-primary px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base transition-colors flex-shrink-0"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
