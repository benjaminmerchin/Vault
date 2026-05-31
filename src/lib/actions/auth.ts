"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { confirmUserEmail } from "@/lib/admin-db";

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
    const admin = createAdminClient();
    if (admin) {
      // Best path: create the user already-confirmed (no email sent at all).
      const { error: adminErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });
      if (adminErr && !/already|registered|exists/i.test(adminErr.message))
        return { error: adminErr.message };
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInErr) return { error: signInErr.message };
      go = true;
    } else {
      // Fallback: public signup, then force-confirm via the DB and sign in.
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) return { error: error.message };
      if (data.session) {
        go = true;
      } else {
        await confirmUserEmail(email);
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!signInErr) go = true;
        else return { message: "Account created — you can sign in now." };
      }
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
