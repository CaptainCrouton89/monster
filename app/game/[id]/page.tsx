"use client";

import { ChatInput } from "@/components/game/ChatInput";
import { ErrorState } from "@/components/game/ErrorState";
import { GameHeader } from "@/components/game/GameHeader";
import { LoadingState } from "@/components/game/LoadingState";
import { MessageList } from "@/components/game/MessageList";
import { UIMessage, convertToUIMessage } from "@/components/game/types";
import {
  addUserMessageWithWebhook,
  getSessionMessages,
  subscribeToMessages,
} from "@/utils/supabase/messages";
import { GameSession, getGameSession } from "@/utils/supabase/session";
import { use, useEffect, useRef, useState } from "react";

export default function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const gameId = unwrappedParams.id;

  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<() => void>(() => {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResponding, setAiResponding] = useState(false);

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

      // If AI message received, set aiResponding to false
      if (uiMessage.sender === "AI") {
        setAiResponding(false);
      }

      setMessages((prev) => {
        // Check if the message is already in the array to prevent duplicates
        const exists = prev.some((msg) => msg.id === uiMessage.id);
        if (exists) return prev;
        return [...prev, uiMessage];
      });
    });

    // Cleanup subscription
    return () => {
      subscriptionRef.current();
    };
  }, [gameId]);

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

  const handleSendMessage = async (e: React.FormEvent, messageText: string) => {
    if (messageText.trim() === "" || !username) return;

    setIsSubmitting(true);

    try {
      // Add user message to Supabase and send to webhook
      await addUserMessageWithWebhook(gameId, username, messageText);
      setIsSubmitting(false);
      // Set AI is responding
      setAiResponding(true);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="flex flex-col h-[100svh] bg-[var(--game-bg)] text-white overflow-hidden">
      <GameHeader
        gameId={gameId}
        username={username}
        gameSession={gameSession}
      />

      <MessageList messages={messages} aiResponding={aiResponding} />

      <ChatInput
        isSubmitting={isSubmitting}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
