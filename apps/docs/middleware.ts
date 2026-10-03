import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/**
 * Bepaalt de taal van het verzoek (cookie NEXT_LOCALE, anders Accept-Language).
 * Next 16 noemt dit bestand proxy.ts; op Next 15 heet het middleware.ts.
 */
export default function middleware(request: NextRequest): NextResponse {
  return intlMiddleware(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
