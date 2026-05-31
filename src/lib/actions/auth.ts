"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };

const REACH_ERR = "Couldn't reach the authentication service. Try again.";

export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createClient();
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
  } catch {
    return { error: REACH_ERR };
  }
  redirect("/dashboard");
}

export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  if (!email || password.length < 6)
    return { error: "Enter an email and a password of at least 6 characters." };

  const supabase = await createClient();
  let go = false;
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: error.message };

    if (data.session) {
      go = true;
    } else {
      // No session => email confirmation is on. Try an immediate sign-in.
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!signInErr) go = true;
      else
        return {
          message:
            "Account created. Check your email to confirm — or jump in with the live demo.",
        };
    }
  } catch {
    return { error: REACH_ERR };
  }
  if (go) redirect("/dashboard");
  return {};
}

export async function signInDemoAction(): Promise<AuthState> {
  const email = process.env.DEMO_EMAIL;
  const password = process.env.DEMO_PASSWORD;
  if (!email || !password)
    return {
      error:
        "Demo isn't configured — set DEMO_EMAIL and DEMO_PASSWORD in the environment.",
    };

  const supabase = await createClient();
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: `Demo sign-in failed: ${error.message}` };
  } catch {
    return { error: REACH_ERR };
  }
  redirect("/dashboard");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
