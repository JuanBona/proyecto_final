import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type UserRole = "traveler" | "approver";

export interface Session {
  accessToken: string;
  role: UserRole;
}

function isRole(value: string | undefined): value is UserRole {
  return value === "traveler" || value === "approver";
}

type CookieStore = {
  get(name: string): { value: string } | undefined;
};

export function getSessionFromCookies(store: CookieStore): Session | null {
  const accessToken = store.get("accessToken")?.value;
  const role = store.get("role")?.value;

  if (!accessToken || !isRole(role)) {
    return null;
  }

  return { accessToken, role };
}

export function getServerSession(): Session | null {
  return getSessionFromCookies(cookies());
}

export function requireSession(roles?: UserRole[]): Session {
  const session = getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (roles && !roles.includes(session.role)) {
    redirect(session.role === "approver" ? "/approvals" : "/trips/new");
  }

  return session;
}
