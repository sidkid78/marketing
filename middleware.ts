export { auth as middleware } from "@/auth"

export const config = {
    matcher: ["/((?!login|api/auth|api/twitter|_next/static|_next/image|favicon.ico).*)"],
}
