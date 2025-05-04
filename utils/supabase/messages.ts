"use client";

import { createClient } from "@/utils/supabase/client";

export type Message = {
  id: string;
  session_id: string;
  user_id: string | null;
  is_ai: boolean;
  content: string;
  created_at: string;
};

/**
 * Fetches messages for a specific game session
 * @param sessionId The game session ID
 * @param limit Number of messages to fetch (default: 50)
 * @returns Array of messages
 */
export async function getSessionMessages(
  sessionId: string,
  limit = 50
): Promise<Message[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching messages:", error);
    throw new Error("Failed to fetch messages");
  }

  return data as Message[];
}

/**
 * Adds a new user message to the database
 * @param sessionId The game session ID
 * @param userId User's identifier
 * @param content Message content
 * @returns The created message
 */
export async function addUserMessage(
  sessionId: string,
  userId: string,
  content: string
): Promise<Message> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({
      session_id: sessionId,
      user_id: userId,
      is_ai: false,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding user message:", error);
    throw new Error("Failed to add message");
  }

  return data as Message;
}

/**
 * Adds a new AI message to the database
 * @param sessionId The game session ID
 * @param content Message content
 * @returns The created message
 */
export async function addAIMessage(
  sessionId: string,
  content: string
): Promise<Message> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({
      session_id: sessionId,
      user_id: null,
      is_ai: true,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding AI message:", error);
    throw new Error("Failed to add message");
  }

  return data as Message;
}

/**
 * Subscribes to new messages for a game session
 * @param sessionId The game session ID
 * @param callback Function to call when new messages arrive
 * @returns A function to unsubscribe
 */
export function subscribeToMessages(
  sessionId: string,
  callback: (message: Message) => void
) {
  const supabase = createClient();

  const subscription = supabase
    .channel(`messages:${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(subscription);
  };
}

/**
 * Deletes a message by ID
 * @param messageId ID of the message to delete
 * @returns True if successful
 */
export async function deleteMessage(messageId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("id", messageId);

  if (error) {
    console.error("Error deleting message:", error);
    throw new Error("Failed to delete message");
  }

  return true;
}

/**
 * Gets the most recent messages for a game session
 * @param sessionId The game session ID
 * @param count Number of recent messages to fetch
 * @returns Array of messages
 */
export async function getRecentMessages(
  sessionId: string,
  count = 10
): Promise<Message[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(count);

  if (error) {
    console.error("Error fetching recent messages:", error);
    throw new Error("Failed to fetch recent messages");
  }

  // Return in chronological order
  return (data as Message[]).reverse();
}
