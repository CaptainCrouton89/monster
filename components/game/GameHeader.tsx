import { GameSession } from "@/utils/supabase/session";
import Link from "next/link";

interface GameHeaderProps {
  gameId: string;
  username: string | null;
  gameSession: GameSession | null;
  isKeyboardOpen: boolean;
}

export function GameHeader({
  gameId,
  username,
  gameSession,
  isKeyboardOpen,
}: GameHeaderProps) {
  return (
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
  );
}
