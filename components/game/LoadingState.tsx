import { Spinner } from "@/components/ui/spinner";

export function LoadingState() {
  return (
    <div className="flex flex-col h-screen bg-[var(--game-bg)] text-white items-center justify-center">
      <Spinner size="lg" variant="default" className="mb-4" />
      <p>Loading game...</p>
    </div>
  );
}
