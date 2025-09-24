import ChatBox from "@/components/ChatBox";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ChatPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/");
  }
  return (
    <div className="min-h-screen ">
      <div className="container mx-auto h-screen">
        <ChatBox sessionUserId={session.user.id} />
      </div>
    </div>
  );
}
