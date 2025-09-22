"use client";

import { useState } from "react";
import { signIn, signUp, AuthResult } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const router = useRouter();
  const isLogin = mode === "login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    //validation
    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }
    
    if (!isLogin && password !== confirmPassword) {
      setError("Passwords must be same");
      setLoading(false);
      return;
    }

    if (isLogin && password.length < 6) {
      setError("Invalid login credentials");
      setLoading(false);
      return;
    }

    if (!isLogin && password.length<6){
        setError("Password must contain at least 6 characters");
        setLoading(false);
        return;
    }

    try {
      let result: AuthResult;

      if (isLogin) {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password);
      }

      if (result.success) {
        if (isLogin) {
          router.push("/chat");
        } else {
          setMessage("Registiration succesful");
        }
      } else {
        setError(result.error || "An error occured");
      }
    } catch (err) {
      setError("An error occured");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#37353E] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ">
      <div className="max-w-md w-full bg-[#2A2831] border border-[#4A4855] rounded-xl shadow-lg p-8 space-y-8">
        <div>
          <h2 className=" mt-6 text-center text-3xl font-bold tracking-tight text-[#D3DAD9]">
            {isLogin ? "Sign in" : "Create new account"}
          </h2>
          <p className="mt-2 text-center text-sm text-[#D3DAD9] ">
            {isLogin ? (
              <>
                Don't you have an account?{" "}
                <Link href="/signup" className="font-medium text-[#739EC9] hover:text-blue-400">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                If you have an account{" "}
                <Link href="/signin" className="font-medium text-[#739EC9] hover:text-blue-400">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>

        <form className=" mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#D3DAD9]">
                Email adress
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className=" mt-1 block w-full px-3 py-2 bg-[#37353E] border border-[#4A4855] text-[#D3DAD9] rounded-md shadow-sm placeholder-[#8B8994] focus:outline-none focus:ring-2 focus:ring-[#739EC9] focus:border-[#739EC9] sm:text-sm"
                placeholder="example@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#D3DAD9] ">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className=" mt-1 block w-full px-3  py-2 bg-[#37353E] border border-[#4A4855] text-[#D3DAD9] rounded-md shadow-sm placeholder-[#8B8994] focus:outline-none focus:ring-2 focus:ring-[#739EC9] focus:border-[#739EC9] sm:text-sm"
                placeholder="At least 6 characters"
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword " className="block text-sm font-medium text-[#D3DAD9]">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className=" mt-1 block w-full px-3  py-2 bg-[#37353E] border border-[#4A4855] text-[#D3DAD9] rounded-md shadow-sm placeholder-[#8B8994] focus:outline-none focus:ring-2 focus:ring-[#739EC9] focus:border-[#739EC9] sm:text-sm"
                  placeholder="Confirm your password"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}
          {message && (
            <div className="bg-green-900/30 border border-green-700/50 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-300">{message}</p>
                </div>
              </div>
            </div>
          )}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#739EC9] hover:bg-[#5D88B3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#739EC9] focus:ring-offset-[#37353E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading && (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {loading
                ? isLogin
                  ? "Logging in..."
                  : "Registering..."
                : isLogin
                ? "Sign in"
                : "Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}