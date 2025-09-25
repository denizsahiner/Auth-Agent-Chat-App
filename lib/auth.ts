import { createClient } from "./supabase/client";

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: any;
}

// Get browser client
const supabase = createClient();

// Sign up function
export async function signUp(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: "An error occured" };
  }
}

// Sign in function
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: "An error occured while logging in." };
  }
}

// Sign out function
export async function signOut(): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: "An error occured while logging out." };
  }
}

// User session
export async function getUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("User fetch error:", error);
      return null;
    }
    return user;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

// Auth state changes
export function onAuthStateChange(callback: (user: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
}
