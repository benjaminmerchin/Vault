import { redirect } from "next/navigation";
import { AppNav } from "@/components/app/app-nav";
import { Workspace } from "@/components/app/workspace";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const name =
    (profile?.full_name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    null;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <AppNav email={user.email ?? ""} name={name} />
      <div className="min-h-0 flex-1">
        <Workspace>{children}</Workspace>
      </div>
    </div>
  );
}
