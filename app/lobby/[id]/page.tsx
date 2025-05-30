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
} from "@/utils/supabase/session";
import { ClipboardCopy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import QRCode from "react-qr-code";

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
  const [copied, setCopied] = useState(false);
  const [lobbyUrl, setLobbyUrl] = useState("");

  useEffect(() => {
    // Set the lobby URL when component mounts
    if (typeof window !== "undefined") {
      setLobbyUrl(window.location.href);
    }
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(lobbyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

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
      <div className="flex flex-col items-center justify-center min-h-screen game-gradient text-white">
        <p>Loading lobby...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen game-gradient text-white">
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
    <div className="flex flex-col items-center justify-center min-h-screen game-gradient text-white p-4 sm:p-8">
      <main className="flex flex-col items-center gap-6 sm:gap-8 text-center w-full">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Game Lobby
        </h1>
        <div className="game-card p-4 sm:p-6 rounded-lg border w-full max-w-sm sm:max-w-md">
          <p className="text-lg sm:text-xl mb-2">Lobby ID:</p>
          <p className="text-xl sm:text-2xl font-mono bg-slate-950/50 p-2 sm:p-3 rounded mb-4 sm:mb-6 break-all">
            {lobbyId}
          </p>

          {/* QR Code Section */}
          <div className="mb-4 sm:mb-6">
            <p className="text-lg sm:text-xl mb-2 sm:mb-3">Share Lobby:</p>
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <div className="bg-white p-2 sm:p-3 rounded">
                <QRCode value={lobbyUrl} size={120} />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 game-header text-white border-slate-600"
                  onClick={copyToClipboard}
                >
                  <ClipboardCopy size={16} />
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
              </div>
            </div>
          </div>

          {username && (
            <p className="text-green-400 mb-4 sm:mb-6">
              Playing as: <span className="font-semibold">{username}</span>
            </p>
          )}

          {gameSession && (
            <div className="mb-4 sm:mb-6">
              <p className="text-lg sm:text-xl mb-2">Players:</p>
              <div className="bg-slate-950/50 p-2 sm:p-3 rounded text-left">
                {gameSession.game_state.users.map((user, index) => (
                  <div key={index} className="flex items-center py-1">
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

          <div className="flex flex-col gap-3 sm:gap-4">
            <button
              onClick={startGame}
              className="w-full px-4 sm:px-6 py-2 game-button-primary rounded-full font-medium transition-colors text-center"
            >
              Start Game
            </button>
            <Link
              href="/"
              className="w-full px-4 sm:px-6 py-2 bg-transparent border border-slate-600 hover:bg-slate-700/30 rounded-full font-medium transition-colors text-center"
            >
              Leave Lobby
            </Link>
          </div>
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
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
              className="game-input text-white"
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
