"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  addUserToSession,
  GameSession,
  getGameSession,
  updateSessionStatus,
} from "@/utils/session";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function LobbyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const lobbyId = unwrappedParams.id;
  const router = useRouter();

  const [username, setUsername] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for user in localStorage
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      setIsDialogOpen(true);
    }

    // Fetch the game session
    fetchGameSession();
  }, [lobbyId]);

  // Join lobby when username is set
  useEffect(() => {
    if (username && gameSession) {
      joinLobby();
    }
  }, [username, gameSession]);

  const fetchGameSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const session = await getGameSession(lobbyId);

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

  const joinLobby = async () => {
    if (!username || !gameSession) return;

    try {
      // Only add the user if they're not already in the game
      if (!gameSession.game_state.users.includes(username)) {
        const updatedSession = await addUserToSession(lobbyId, username);
        setGameSession(updatedSession);
      }
    } catch (error) {
      console.error("Error joining lobby:", error);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() !== "") {
      localStorage.setItem("username", inputValue);
      setUsername(inputValue);
      setIsDialogOpen(false);
    }
  };

  const startGame = async () => {
    try {
      await updateSessionStatus(lobbyId, "in_progress");
      router.push(`/game/${lobbyId}`);
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <p>Loading lobby...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-8">
      <main className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Game Lobby</h1>
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 w-full max-w-md">
          <p className="text-xl mb-2">Lobby ID:</p>
          <p className="text-2xl font-mono bg-slate-950/50 p-3 rounded mb-6">
            {lobbyId}
          </p>

          {username && (
            <p className="text-green-400 mb-6">
              Playing as: <span className="font-semibold">{username}</span>
            </p>
          )}

          {gameSession && (
            <div className="mb-6">
              <p className="text-xl mb-2">Players:</p>
              <div className="bg-slate-950/50 p-3 rounded text-left">
                {gameSession.game_state.users.map((user, index) => (
                  <div key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span className="font-medium">{user}</span>
                    {user === username && (
                      <span className="text-xs text-slate-400 ml-2">(you)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <button
              onClick={startGame}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-full font-medium transition-colors text-center"
            >
              Start Game
            </button>
            <Link
              href="/"
              className="px-6 py-2 bg-transparent border border-slate-600 hover:bg-slate-700/30 rounded-full font-medium transition-colors"
            >
              Leave Lobby
            </Link>
          </div>
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Username</DialogTitle>
            <DialogDescription>
              Please enter a username to join the game lobby
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4 pt-4">
            <Input
              placeholder="Enter your username"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
            <Button type="submit" className="w-full">
              Create User
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
