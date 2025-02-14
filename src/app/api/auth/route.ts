import { auth } from "firebase-admin";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { customInitApp } from "../../../../firebase-admin-config";
import { COOKIE_NAME } from "@/utils/constants/globalConstants";
import { customGetAuth } from "../../../../firebase";
import { getPermissions } from "@/utils/permissions/getPermissions";

customInitApp();

export async function POST() {
  const authorization = headers().get("Authorization");
  let token: string = "";

  if (authorization?.startsWith("Bearer ")) {
    const idToken = authorization.split("Bearer ")[1];
    const decodedToken = await auth().verifyIdToken(idToken);
    const sessionCookie = await auth().createSessionCookie(idToken, {
      expiresIn: 60 * 60 * 24 * 14 * 1000
    });
    const permissions = await getPermissions(sessionCookie);
    console.log(permissions);
    const idCustomToken = await auth().createCustomToken(decodedToken.uid, {
      permissions
    });
    const customToken = await customGetAuth(idCustomToken);
    if (decodedToken) {
      //Generar cookie
      const expiresIn = 60 * 60 * 24 * 14 * 1000;
      const sessionCookie = await auth().createSessionCookie(
        (await customToken.user.getIdTokenResult()).token,
        {
          expiresIn
        }
      );
      token = sessionCookie;
      console.log(COOKIE_NAME);
      console.log("sessionCookie", sessionCookie);
      const options = {
        name: COOKIE_NAME,
        value: sessionCookie,
        maxAge: expiresIn,
        httpOnly: true,
        secure: true
      };

      cookies().set(options as any);
    }
  }

  return NextResponse.json({ data: { token } }, { status: 200 });
}

export async function GET() {
  const session = cookies().get(COOKIE_NAME || "")?.value || "";

  if (!session) {
    return NextResponse.json({ isLogged: false }, { status: 401 });
  }

  const decodedClaims = await auth().verifySessionCookie(session, true);

  if (!decodedClaims) {
    return NextResponse.json({ isLogged: false }, { status: 401 });
  }

  return NextResponse.json({ isLogged: true, data: decodedClaims, token: session }, { status: 200 });
}
