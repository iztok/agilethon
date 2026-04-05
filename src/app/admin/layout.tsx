import { getAuthUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  if (!user.isAdmin) redirect("/dashboard");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AdminNav user={{ name: user.name, email: user.email, isAdmin: true }} />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
