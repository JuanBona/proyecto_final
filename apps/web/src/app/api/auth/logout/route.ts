import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const clearCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 0,
};

export async function POST(request: Request) {
  const cookieStore = cookies();
  cookieStore.set("accessToken", "", clearCookieOptions);
  cookieStore.set("role", "", clearCookieOptions);
  return NextResponse.redirect(new URL("/login", request.url));
}
