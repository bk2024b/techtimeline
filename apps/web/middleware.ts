import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@techtimeline/database";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient({
    get(name: string) {
      return request.cookies.get(name);
    },
    set(name: string, value: string, options) {
      response.cookies.set({ name, value, ...options });
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = request.nextUrl.pathname.startsWith("/login");
  const isProtectedRoute = !isAuthRoute && !request.nextUrl.pathname.startsWith("/auth");

  if (!user && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
