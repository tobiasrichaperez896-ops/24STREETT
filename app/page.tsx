import { redirect } from "next/navigation"

// The 24 STREET site is a static HTML/CSS/JS project served from /public.
// Send the app root to the static entry point.
export default function Page() {
  redirect("/index.html")
}
