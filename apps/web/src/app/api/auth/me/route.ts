import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ApiError, getMe } from "@/lib/api";
import { getSessionFromCookies } from "@/lib/session";

export async function GET() {
  const cookieStore = cookies();
  const session = getSessionFromCookies(cookieStore);

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const user = await getMe(session.accessToken);
    return NextResponse.json({ authenticated: true, user });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ authenticated: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ authenticated: false, message: "No se pudo validar la sesión" }, { status: 500 });
  }
}
