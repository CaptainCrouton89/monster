import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-8">
      <main className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-6xl font-bold tracking-tight">dumb game</h1>
        <p className="text-xl text-slate-300 max-w-md">
          Make monsters and fight.
        </p>
        <div className="flex gap-4 mt-6">
          <Link
            href="/lobby/mock-lobby-123"
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-full font-medium text-lg transition-colors"
          >
            Create Game
          </Link>
          <button className="px-8 py-3 bg-transparent border-2 border-indigo-600 hover:bg-indigo-700/20 rounded-full font-medium text-lg transition-colors">
            Join Game
          </button>
        </div>
      </main>
    </div>
  );
}
