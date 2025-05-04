"use client";

import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";

type GameSession = {
  id: string;
  game_state: {
    users: string[];
    status: string;
  };
  created_at: string;
};

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
};

export default function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const gameId = unwrappedParams.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [username, setUsername] = useState<string | null>(null);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for user in localStorage
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Fetch game session
    fetchGameSession();
  }, [gameId]);

  useEffect(() => {
    // Add initial bot message once we have game data
    if (gameSession && !isLoading && messages.length === 0) {
      const players = gameSession.game_state.users.filter(
        (user) => user !== username
      );
      const playerList =
        players.length > 0
          ? `You're playing with ${players.join(", ")}.`
          : "You're the only player right now.";

      setMessages([
        {
          id: "welcome",
          sender: "bot",
          text: `Welcome to the game! I'll be your monster companion. ${playerList} What would you like to do?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [gameSession, isLoading, username]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchGameSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("game_sessions")
        .select("*")
        .eq("id", gameId)
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error("Game session not found");
      }

      setGameSession(data as GameSession);
    } catch (error: unknown) {
      console.error("Error fetching game session:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load game session";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (inputValue.trim() === "") return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot response after short delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: `I'm just a demo bot. Your game ID is ${gameId} and you said: "${userMessage.text}"`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-slate-900 text-white items-center justify-center">
        <p>Loading game...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-slate-900 text-white items-center justify-center">
        <p className="text-red-400">{error}</p>
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
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">dumb game</h1>
          <span className="bg-indigo-600 px-2 py-1 rounded-md text-xs">
            Game #{gameId}
          </span>
        </div>
        <div className="text-sm text-slate-300 flex items-center">
          {username && (
            <span className="mr-4">
              Playing as{" "}
              <span className="font-semibold text-green-400">{username}</span>
            </span>
          )}
          {gameSession && (
            <span className="bg-slate-700 px-2 py-1 rounded-md text-xs">
              {gameSession.game_state.users.length} Player
              {gameSession.game_state.users.length !== 1 && "s"}
            </span>
          )}
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                message.sender === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none"
                  : "bg-slate-700 text-white rounded-tl-none"
              }`}
            >
              <div className="font-medium">
                {message.sender === "user" ? username : "MonsterBot"}
              </div>
              <div>{message.text}</div>
              <div className="text-xs text-slate-300 mt-1 text-right">
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
      <div className="bg-slate-800 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-slate-700 border border-slate-600 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors"
          >
            Send
          </button>
        </form>
        <div className="mt-3 flex justify-center gap-4">
          <Link
            href={`/lobby/${gameId}`}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Return to Lobby
          </Link>
          <button
            onClick={fetchGameSession}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Refresh Game
          </button>
        </div>
      </div>
    </div>
  );
}
