import { Spinner } from "@/components/ui/spinner";
import React, { RefObject } from "react";
import { MessageItem } from "./MessageItem";
import { UIMessage } from "./types";

interface MessageListProps {
  messages: UIMessage[];
  aiResponding: boolean;
  isKeyboardOpen: boolean;
  chatContainerRef: RefObject<HTMLDivElement>;
  messagesEndRef: RefObject<HTMLDivElement>;
}

export function MessageList({
  messages,
  aiResponding,
  isKeyboardOpen,
  chatContainerRef,
  messagesEndRef,
}: MessageListProps) {
  return (
    <div
      ref={chatContainerRef}
      className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4"
      style={isKeyboardOpen ? { height: "calc(100vh - 76px)" } : {}}
    >
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}

      {aiResponding && (
        <div className="flex justify-start">
          <div className="game-message-ai text-white rounded-2xl rounded-tl-none max-w-[90%] sm:max-w-[80%] px-3 sm:px-4 py-3 flex items-center gap-2">
            <span className="font-medium text-sm sm:text-base">MonsterBot</span>
            <Spinner size="sm" variant="default" />
          </div>
        </div>
      )}

      <div ref={messagesEndRef as React.RefObject<HTMLDivElement>} />
    </div>
  );
}
