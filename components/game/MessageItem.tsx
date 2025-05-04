import { UIMessage } from "./types";

interface MessageItemProps {
  message: UIMessage;
}

export function MessageItem({ message }: MessageItemProps) {
  return (
    <div
      className={`flex ${
        message.sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[90%] sm:max-w-[80%] px-3 sm:px-4 py-2 rounded-2xl ${
          message.sender === "user"
            ? "game-message-user text-white rounded-tr-none"
            : "game-message-ai text-white rounded-tl-none"
        }`}
      >
        <div className="font-medium text-sm sm:text-base">
          {message.sender === "user" ? message.userId : "MonsterBot"}
        </div>
        <div className="text-sm sm:text-base break-words">{message.text}</div>
        <div className="text-xs text-[var(--game-text-secondary)] mt-1 text-right">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
