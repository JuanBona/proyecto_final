import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes: Array<{ path: string; role: "traveler" | "approver" }> = [
  { path: "/trips/new", role: "traveler" },
  { path: "/expenses", role: "traveler" },
  { path: "/approvals", role: "approver" },
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const target = protectedRoutes.find((route) => pathname.startsWith(route.path));

  if (!target) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("accessToken")?.value;
  const role = request.cookies.get("role")?.value;

  if (!accessToken || !role) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (role !== target.role) {
    const destination = role === "approver" ? "/approvals" : "/trips/new";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/trips/:path*", "/approvals/:path*", "/expenses/:path*"],
};
