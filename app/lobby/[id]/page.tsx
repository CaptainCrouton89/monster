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
import Link from "next/link";
import { use, useEffect, useState } from "react";

export default function LobbyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const lobbyId = unwrappedParams.id;

  const [username, setUsername] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    // Check for user in localStorage
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      setIsDialogOpen(true);
    }
  }, []);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() !== "") {
      localStorage.setItem("username", inputValue);
      setUsername(inputValue);
      setIsDialogOpen(false);
    }
  };

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

          <p className="text-slate-300 mb-6">
            Waiting for other players to join...
          </p>

          <div className="flex flex-col gap-4">
            <Link
              href={`/game/${lobbyId}`}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-full font-medium transition-colors text-center"
            >
              Start Game
            </Link>
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
