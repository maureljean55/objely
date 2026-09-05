import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export async function signInWithPassword(email: string, password: string) {
  const supabase = createClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithPassword(email: string, password: string, metadata: Record<string, unknown>) {
  const supabase = createClient();
  return supabase.auth.signUp({ email, password, options: { data: metadata } });
}

export async function signOut() {
  const supabase = createClient();
  return supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}
