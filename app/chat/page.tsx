import ChatBox from "@/components/ChatBox";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ChatPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/signin");
  }
  return (
    <div className="min-h-screen ">
      <div className="container mx-auto h-screen">
        <ChatBox />
      </div>
    </div>
  );
}
