import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ApiError, getMe, login } from "@/lib/api";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };

    if (!body.email || !body.password) {
      return NextResponse.json({ message: "Email y contraseña son obligatorios" }, { status: 400 });
    }

    const tokens = await login(body.email, body.password);
    const user = await getMe(tokens.accessToken);
    const cookieStore = cookies();

    cookieStore.set("accessToken", tokens.accessToken, cookieOptions);
    cookieStore.set("role", user.role, cookieOptions);

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message, code: error.code }, { status: error.statusCode });
    }
    return NextResponse.json({ message: "No se pudo iniciar sesión" }, { status: 500 });
  }
}
