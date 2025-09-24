import Link from "next/link";

export default function Home() {
  return (
    <div className=" flex flex-col items-center justify-center">
      <h1 className="text-6xl flex justify-center mt-50">Chat App</h1>
      <p className="text-center mt-10 text-xl font-bold">
       “Beyond chat, into connection”
        
      </p>
      <div className="flex gap-6 mt-10">
        <Link
          href="/chat"
          className="px-6 py-2 bg-[#715A5A] text-white rounded-lg shadow hover:bg-[#645454] transition"
        >
          Chat now
        </Link>
        <Link
          href="/signup"
          className="px-6 py-2 bg-[#D3DAD9] text-gray-700 rounded-lg shadow hover:bg-[#b0b8b7] transition"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
