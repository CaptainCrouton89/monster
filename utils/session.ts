"use client";

import { createClient } from "@/utils/supabase/client";

export type GameSession = {
  id: string;
  game_state: {
    users: string[];
    status: string;
  };
  created_at: string;
};

/**
 * Creates a new game session
 * @param username Optional username to add to the session
 * @returns The newly created game session
 */
export async function createGameSession(username: string | null = null) {
  const users = username ? [username] : [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("game_sessions")
    .insert({
      game_state: {
        users,
        status: "waiting",
      },
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating game session:", error);
    throw new Error("Failed to create game session");
  }

  return data as GameSession;
}

/**
 * Gets a game session by ID
 * @param id Game session ID
 * @returns Game session data or null if not found
 */
export async function getGameSession(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("game_sessions")
    .select()
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Session not found
    }
    console.error("Error fetching game session:", error);
    throw new Error("Failed to fetch game session");
  }

  return data as GameSession;
}

/**
 * Adds a user to a game session
 * @param sessionId Game session ID
 * @param username Username to add
 * @returns Updated game session
 */
export async function addUserToSession(sessionId: string, username: string) {
  // First get the current session
  const currentSession = await getGameSession(sessionId);

  if (!currentSession) {
    throw new Error("Game session not found");
  }

  // Don't add if user already exists
  if (currentSession.game_state.users.includes(username)) {
    return currentSession;
  }

  const updatedUsers = [...currentSession.game_state.users, username];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("game_sessions")
    .update({
      game_state: {
        ...currentSession.game_state,
        users: updatedUsers,
      },
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) {
    console.error("Error adding user to session:", error);
    throw new Error("Failed to add user to session");
  }

  return data as GameSession;
}

/**
 * Updates the game session status
 * @param sessionId Game session ID
 * @param status New status
 * @returns Updated game session
 */
export async function updateSessionStatus(sessionId: string, status: string) {
  // First get the current session
  const currentSession = await getGameSession(sessionId);

  if (!currentSession) {
    throw new Error("Game session not found");
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("game_sessions")
    .update({
      game_state: {
        ...currentSession.game_state,
        status,
      },
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) {
    console.error("Error updating session status:", error);
    throw new Error("Failed to update session status");
  }

  return data as GameSession;
}

/**
 * Checks if a game session exists
 * @param id Game session ID
 * @returns True if the session exists, false otherwise
 */
export async function checkGameSessionExists(id: string) {
  try {
    const session = await getGameSession(id);
    return !!session;
  } catch {
    return false;
  }
}
