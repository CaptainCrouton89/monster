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
  checkGameSessionExists,
  createGameSession,
} from "@/utils/supabase/session";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [gameIdInput, setGameIdInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has a username
    const username = localStorage.getItem("username");
    if (!username) {
      setIsUserDialogOpen(true);
    }
  }, []);

  function handleSetUsername(e: React.FormEvent) {
    e.preventDefault();
    if (usernameInput.trim()) {
      localStorage.setItem("username", usernameInput.trim());
      setIsUserDialogOpen(false);
    }
  }

  async function createGame() {
    setIsCreating(true);

    try {
      // Get the username from localStorage
      const username = localStorage.getItem("username");

      // Create a new game session in Supabase
      const gameSession = await createGameSession(username);

      // Navigate to the new lobby
      router.push(`/lobby/${gameSession.id}`);
    } catch (error) {
      console.error("Failed to create game:", error);
      setIsCreating(false);
    }
  }

  async function joinGame(e: React.FormEvent) {
    e.preventDefault();
    setJoinError(null);

    if (!gameIdInput.trim()) {
      setJoinError("Please enter a game ID");
      return;
    }

    try {
      // Check if the game exists
      const exists = await checkGameSessionExists(gameIdInput.trim());

      if (!exists) {
        setJoinError("Game not found");
        return;
      }

      // Navigate to the lobby
      router.push(`/lobby/${gameIdInput.trim()}`);
    } catch (error) {
      console.error("Failed to join game:", error);
      setJoinError("Error joining game");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-8">
      <main className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-6xl font-bold tracking-tight">dumb game</h1>
        <p className="text-xl text-slate-300 max-w-md">
          Make monsters and fight.
        </p>
        <div className="flex gap-4 mt-6">
          <button
            onClick={createGame}
            disabled={isCreating}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-full font-medium text-lg transition-colors disabled:opacity-70"
          >
            {isCreating ? "Creating..." : "Create Game"}
          </button>
          <button
            onClick={() => setIsJoinDialogOpen(true)}
            className="px-8 py-3 bg-transparent border-2 border-indigo-600 hover:bg-indigo-700/20 rounded-full font-medium text-lg transition-colors"
          >
            Join Game
          </button>
        </div>
      </main>

      {/* Join Game Dialog */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join Existing Game</DialogTitle>
            <DialogDescription>
              Enter a game ID to join an existing game
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={joinGame} className="space-y-4 pt-4">
            <Input
              placeholder="Enter game ID"
              value={gameIdInput}
              onChange={(e) => setGameIdInput(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
            {joinError && <p className="text-red-400 text-sm">{joinError}</p>}
            <Button type="submit" className="w-full">
              Join Game
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Username Dialog */}
      <Dialog
        open={isUserDialogOpen}
        onOpenChange={setIsUserDialogOpen}
        defaultOpen={false}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Username</DialogTitle>
            <DialogDescription>
              Please enter a username to play
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSetUsername} className="space-y-4 pt-4">
            <Input
              placeholder="Enter your username"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
