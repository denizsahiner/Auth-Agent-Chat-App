import { decryptMessage, encryptMessage } from "./crypto";
import { createClient } from "./supabase/server";

export interface DatabaseMessage {
  id: string;
  user_id: string;
  encrypted_content: string;
  role: "user" | "assistant";
  created_at: string;
}
export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}
export async function saveMessage(
  userId: string,
  content: string,
  role: "user" | "assistant"
): Promise<string> {
  try {
    const supabase = await createClient();

    const encryptedContent = JSON.stringify(encryptMessage(content));
    const { data, error } = await supabase
      .from("messages")
      .insert({
        user_id: userId,
        encrypted_content: encryptedContent,
        role: role,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Database save error:", error);
      throw new Error("Failed to save message");
    }
    return data.id;
  } catch (error) {
    console.error("Save message error", error);
    throw error;
  }
}

export async function getMessages(userId: string): Promise<Message[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("messages")
      .select("id,user_id,role,created_at,encrypted_content")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Database fetch error", error);
      throw new Error("Failed to fetch messages");
    }

    //Decrypting messages
    const messages: Message[] = data.map((dbMessage: DatabaseMessage) => {
      try {
        return {
          id: dbMessage.id,
          content: decryptMessage(JSON.parse(dbMessage.encrypted_content)),
          role: dbMessage.role,
          timestamp: new Date(dbMessage.created_at),
        };
      } catch (decryptError) {
        console.error(
          "Message decryption failed for ID:",
          dbMessage.id,
          decryptError
        );
        return {
          id: dbMessage.id,
          content: "[Decryption failed]",
          role: dbMessage.role,
          timestamp: new Date(dbMessage.created_at),
        };
      }
    });

    return messages;
  } catch (error) {
    console.error("Get messages error:", error);
    throw error;
  }
}
