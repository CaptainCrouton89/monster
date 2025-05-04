import Link from "next/link";

interface ErrorStateProps {
  error: string;
}

export function ErrorState({ error }: ErrorStateProps) {
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
