import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get(process.env.NEXT_PUBLIC_COOKIE_SESSION_NAME ?? "");
  //TODO: logic to return us to projects if we log in if we are logged in and with a tokenos logeados y con token

  console.log("session", session);
  //Return to /login if there is no session cookie
  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  //Call the API to validate the token
  const responseAPI = await fetch(`${request.nextUrl.origin}/api/auth`, {
    headers: {
      Cookie: `${process.env.NEXT_PUBLIC_COOKIE_SESSION_NAME}=${session?.value}`
    }
  });
  //Return to /login if validation fails
  if (responseAPI.status !== 200) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

//Our protected routes
export const config = {
  matcher: ["/", "/proyectos/:path*", "/logistics/:path*"]
};
