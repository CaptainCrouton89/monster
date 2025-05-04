import { Message as DBMessage } from "@/utils/supabase/messages";

// Client-side message type with UI-specific fields
export type UIMessage = {
  id: string;
  sender: "user" | "AI";
  userId: string | null;
  text: string;
  timestamp: Date;
  imageUrl: string | null;
};

// Convert DB message to UI message
export function convertToUIMessage(message: DBMessage): UIMessage {
  return {
    id: message.id,
    sender: message.is_ai ? "AI" : "user",
    userId: message.user_id,
    text: message.text,
    timestamp: new Date(message.created_at),
    imageUrl: message.image_url,
  };
}
