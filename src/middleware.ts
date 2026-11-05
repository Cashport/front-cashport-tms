import { NextRequest, NextResponse } from "next/server";
import { SOCKET_URI } from "./utils/constants/globalConstants";
import {
  LANG_COOKIE,
  LANG_COOKIE_MAX_AGE,
  LANG_PARAM,
  isBot,
  isLang,
  languageFromHeader
} from "./modules/landing/language";

const LANDING_ROUTES = ["/", "/en"];
const PUBLIC_FILES = ["/robots.txt", "/sitemap.xml", "/llms.txt", "/assets"];
// Inicio de la app tras el login (antes / redirigía aquí).
const APP_HOME = "/landing";

export async function middleware(request: NextRequest) {
  // content-security-policy
  const apiHost = process.env.NEXT_PUBLIC_API_HOST?.slice(0, -4) ?? "https://api.example.com/";
  const apiChatHost = process.env.NEXT_PUBLIC_CHAT_API_HOST?.slice(0, -4) ?? "";
  const apiChatWsHost = apiChatHost.replace('https://', 'wss://').replace('http://', 'ws://');
  const apin8nHost = process.env.NEXT_PUBLIC_API_AUDIT_AI?.slice(0, -45) ?? "";
  const socketHost = SOCKET_URI?.split("//")[1] ?? "sockets.example.com";
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://api.mapbox.com ;
    style-src 'self' 'unsafe-inline' https://api.mapbox.com https://fonts.googleapis.com;
    img-src 'self' https://*.amazonaws.com https://api.mapbox.com data: blob: https://www.gstatic.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://firebase.googleapis.com ${apiHost} ${apin8nHost} https://${socketHost} wss://${socketHost} ${apiChatHost} ${apiChatWsHost} ;
    frame-src 'self' https://*.firebaseapp.com https://*.firebaseio.com https://www.gstatic.com;
    object-src 'none';
    frame-ancestors 'self';
    base-uri 'self';
    form-action 'self';
    worker-src blob: ;
    child-src blob: ;
`;
  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, " ").trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);
  // end content-security-policy

  // X-XSS-Protection & Permissions-Policy restricted
  requestHeaders.set("X-XSS-Protection", "1; mode=block");
  requestHeaders.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=(), accelerometer=(), gyroscope=()"
  );

  const session = request.cookies.get(process.env.NEXT_PUBLIC_COOKIE_SESSION_NAME ?? "");

  const { pathname } = request.nextUrl;
  const withCsp = (res: NextResponse) => {
    res.headers.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);
    return res;
  };
  // Todo lo que no es la landing pública queda fuera de los buscadores.
  const noIndex = (res: NextResponse) => {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  };
  const next = () =>
    withCsp(
      NextResponse.next({
        request: { headers: requestHeaders },
        headers: requestHeaders
      })
    );
  const redirectTo = (path: string) =>
    noIndex(
      withCsp(NextResponse.redirect(new URL(path, request.url), { headers: requestHeaders }))
    );
  // Redirección que depende del visitante (idioma): ningún caché la comparte.
  const privateRedirect = (path: string) => {
    const res = withCsp(NextResponse.redirect(new URL(path, request.url), 307));
    res.headers.set("Cache-Control", "private, no-store");
    res.headers.set("Vary", "Accept-Language, Cookie");
    return res;
  };
  const isValidSession = async () => {
    if (!session) return false;
    //Call the API to validate the token
    const responseAPI = await fetch(`${request.nextUrl.origin}/api/auth`, {
      headers: {
        Cookie: `${process.env.NEXT_PUBLIC_COOKIE_SESSION_NAME}=${session.value}`
      }
    });
    if (responseAPI.status !== 200) console.error("Error en la validación del token");
    return responseAPI.status === 200;
  };

  // Archivos públicos de la landing (logos, robots, sitemap, llms.txt).
  if (PUBLIC_FILES.some((file) => pathname === file || pathname.startsWith(`${file}/`))) {
    return next();
  }

  // La landing (/ y /en) es el login: pública e indexable. Con sesión válida
  // se entra directo a la app.
  if (LANDING_ROUTES.includes(pathname)) {
    if (session && (await isValidSession())) return redirectTo(APP_HOME);

    // ES | EN elegido a mano (?lang=): se guarda y se vuelve a la URL limpia.
    const chosenParam = request.nextUrl.searchParams.get(LANG_PARAM);
    if (isLang(chosenParam)) {
      const res = privateRedirect(chosenParam === "en" ? "/en" : "/");
      res.cookies.set(LANG_COOKIE, chosenParam, {
        path: "/",
        maxAge: LANG_COOKIE_MAX_AGE,
        sameSite: "lax"
      });
      return res;
    }

    // En / se respeta el idioma del navegador (o la elección guardada); los
    // bots nunca se redirigen. /en se respeta siempre: es un enlace explícito.
    if (pathname === "/") {
      const saved = request.cookies.get(LANG_COOKIE)?.value;
      const lang = isLang(saved)
        ? saved
        : isBot(request.headers.get("user-agent"))
          ? "es"
          : languageFromHeader(request.headers.get("accept-language"));
      if (lang === "en") return privateRedirect("/en");
      const res = next();
      res.headers.set("Vary", "Accept-Language, Cookie");
      return res;
    }
    return next();
  }

  // El login anterior ahora vive en la landing.
  if (pathname === "/auth/login") {
    return noIndex(NextResponse.redirect(new URL("/", request.url), 308));
  }

  const noAuthRoutes = ["/auth/changePass", "/auth/accept-invitation"];
  if (noAuthRoutes.some((route) => pathname.startsWith(route))) {
    return noIndex(next());
  }

  //Return to the landing login if there is no valid session
  if (!(await isValidSession())) {
    if (!session) console.info("No hay cookie de sesión");
    return redirectTo("/");
  }
  return noIndex(next());
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" }
      ]
    }
  ]
};
