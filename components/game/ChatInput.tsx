import { Spinner } from "@/components/ui/spinner";
import React, { useState } from "react";

interface ChatInputProps {
  isSubmitting: boolean;
  onSendMessage: (e: React.FormEvent, message: string) => void;
}

export function ChatInput({ isSubmitting, onSendMessage }: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === "") return;

    onSendMessage(e, inputValue.trim());
    setInputValue("");
  };

  return (
    <div className="game-header p-3 sm:p-4 sticky bottom-0 z-10">
      <form onSubmit={handleSubmit} className="flex gap-2 relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 game-input rounded-full px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          className="game-button-primary px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base transition-colors flex-shrink-0 flex items-center gap-2"
          disabled={isSubmitting || inputValue.trim() === ""}
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" variant="inherit" />
              <span>Sending</span>
            </>
          ) : (
            "Send"
          )}
        </button>
      </form>
    </div>
  );
}
